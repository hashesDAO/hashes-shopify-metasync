import 'dotenv/config';
import fetch from 'node-fetch';
import axios from 'axios';
import FormData from 'form-data';

import ProductContractModel from '../../utils/models/ProductContractModel';
import OrderPaidModel from '../../utils/models/OrderPaidModel';
import BurnToRedeemModel from '../../utils/models/BurnToRedeemModel';
import {
  verisartUrlByBurnedTokenId,
  getBurnedErc721ForTx,
  getNFTMetadataByToken,
  getTotalSupply,
  getTransactionHashesForMint,
} from './NftService';
import { GraphqlClient } from '@shopify/shopify-api/lib/clients/graphql/graphql_client';

export async function configureProductsForBurnRedeem(
  responseRequestBody: string
) {
  const jsonReponse = JSON.parse(responseRequestBody);
  const promises: Promise<any>[] = [];

  jsonReponse?.products.forEach(async (item: any) => {
    const productId = item.productId;
    const manifoldId = item.manifoldId;
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    };

    promises.push(
      new Promise(async (resolve, reject) => {
        try {
          const manifoldRes = await fetch(
            `https://apps.api.manifoldxyz.dev/public/instance/data?id=${manifoldId}`,
            options
          );
          if (manifoldRes.status !== 200) {
            console.error('Error fetching NFT metadata:');
            reject(
              `Couldn't get manifold info ${manifoldId} :${manifoldRes.statusText}`
            );
          }
          const data = await manifoldRes.json();
          const burnContractAddress =
            data.publicData.burnSet[0].items[0].contractAddress;
          const redeemContractAddress = data.publicData.redeemContractAddress;
          const extensionAddress = data.publicData.extensionAddress;
          const burnTknUrl = `https://app.manifold.xyz/br/${data.slug}`;

          await ProductContractModel.updateOne(
            { productId: productId }, // Filter criteria
            {
              $set: {
                redeemContractAddress: redeemContractAddress,
                burnContractAddress: burnContractAddress,
                extensionAddress: extensionAddress,
                burnTknUrl: burnTknUrl,
                manifoldId: manifoldId,
                ipfsUrl: 'NA',
              },
            }, // Update values
            { upsert: true }
          )
            .then((result) => {
              resolve(true);
            })
            .catch((error) => {
              reject(error);
            });
        } catch (error) {
          reject(`Error: ${error}`);
        }
      })
    );
  });

  return promises;
}

export async function updateMetadataForAllProducts() {
  const products = await getConfiguredProducts();

  products.forEach(async (product) => {
    await updateOSMetadataForCollection(product.redeemContractAddress);
  });
}

export async function storeBurnEvents(
  client: GraphqlClient,
  includeBurned: boolean
) {
  const orders = includeBurned
    ? await OrderPaidModel.find()
    : await OrderPaidModel.find({ fufilled: false, burned: false });

  const productContracts = await ProductContractModel.find();
  const promises: Promise<any>[] = [];

  for (const element of productContracts) {
    // Get transactions for all ERC721 claims
    const claimToBurnTxs: any = await getTransactionHashesForMint(
      element.redeemContractAddress
    );

    const burnContractAddress = element.burnContractAddress;
    const redeemContractAddress = element.redeemContractAddress;

    for (const tx of claimToBurnTxs) {
      const redeemToken = tx.token_id;
      const redeemTx = tx.transaction;

      const burnedToken = await getBurnedErc721ForTx(
        burnContractAddress,
        redeemTx
      );

      const order = orders.find(
        (order: any) =>
          order.productId === element.productId &&
          order.walletUsed === tx.mintee &&
          order.tokenId.toString() === burnedToken
      );

      if (order) {
        promises.push(
          new Promise(async (resolve, reject) => {
            await BurnToRedeemModel.updateOne(
              { orderNumber: order.orderNumber },
              {
                $set: {
                  orderPaidModel: order._id,
                  burnContractAddress: burnContractAddress,
                  redeemContractAddress: redeemContractAddress,
                  burnedTokenId: order.tokenId,
                  redeemedTokenId: redeemToken,
                  claimTx: redeemTx,
                },
              },
              { upsert: true }
            )
              .then(async (result) => {
                await OrderPaidModel.updateOne(
                  {
                    orderNumber: order.orderNumber,
                    productId: order.productId,
                  },
                  { $set: { burned: true } }
                );

                const tokensInOrder = await OrderPaidModel.find({
                  orderNumber: order.orderNumber,
                });
                const allBurned = tokensInOrder.every(
                  (result) => result.burned === true
                );

                const tags = [];

                if (allBurned) {
                  tags.push('Burned');
                } else {
                  tags.push('PARTIAL BURN');
                }

                if (order.gaming) {
                  tags.push('REVIEW ME');
                }

                console.log(tags);
                client
                  .query({
                    data: `mutation {
                      orderUpdate(input: { id: "gid://shopify/Order/${
                        order.globalId
                      }", tags: ${JSON.stringify(tags)} }) {
                        order {
                          id
                          tags
                        }
                        userErrors {
                          field
                          message
                        }
                      }
                    }
                  `,
                  })
                  .then((response) => {
                    console.log('Updated Order:', order.orderNumber);
                    resolve(true);
                  })
                  .catch((error) => {
                    console.error('Error updating order:', error);
                    reject(error);
                  });
              })
              .catch((error) => {
                reject(error);
              });
          })
        );
      }
    }
  }

  return promises;
}

export async function getMetadataPreviewForOrder(
  orderNumber: string,
  client: GraphqlClient
) {
  await storeBurnEvents(client, false);

  try {
    const burnRedeemModel = await BurnToRedeemModel.findOne({
      orderNumber: orderNumber,
    });

    if (burnRedeemModel) {
      const metadataPreUpdate = await getNFTMetadataByToken(
        burnRedeemModel.redeemContractAddress,
        burnRedeemModel.redeemedTokenId.toString()
      );
      const burnContractAddress = burnRedeemModel.burnContractAddress;
      const burnTokenId = burnRedeemModel.burnedTokenId;

      const verisartUrl = await verisartUrlByBurnedTokenId(
        burnContractAddress,
        burnTokenId.toString()
      );

      if (verisartUrl) {
        metadataPreUpdate.description = `Print Edition Certificate: ${verisartUrl.url}\n\n${metadataPreUpdate.description}`;
      }

      return {
        tokenId: burnRedeemModel.redeemedTokenId,
        metadata: metadataPreUpdate,
      };
    } else {
      return `Token for order ${orderNumber}, not yet burned`;
    }
  } catch (e) {
    return `Unable to get metadata for order ${orderNumber} - ${e}`;
  }
}

export async function storeAllMetadata(client: GraphqlClient) {
  await storeBurnEvents(client, false);

  const products = await getConfiguredProducts();
  const uploadPromises = [];

  for (const product of products) {
    const uploadPromise = new Promise(async (resolve, reject) => {
      const redeemedTokenAddress = product.redeemContractAddress;
      const burnedTokenAddress = product.burnContractAddress;
      const totalRedeemedQuantity = await getTotalSupply(redeemedTokenAddress);
      const files = [];

      const metadata = await getNFTMetadataByToken(redeemedTokenAddress, '1');

      for (let i = 1; i < totalRedeemedQuantity! + 1; i++) {
        const newMetadata = JSON.parse(JSON.stringify(metadata));
        const burnRedeemModel = await BurnToRedeemModel.findOne({
          burnContractAddress: burnedTokenAddress,
          redeemContractAddress: redeemedTokenAddress,
          redeemedTokenId: i,
        });

        if (burnRedeemModel) {
          const burnTokenId = burnRedeemModel.burnedTokenId;

          const verisartUrl = await verisartUrlByBurnedTokenId(
            burnedTokenAddress,
            burnTokenId.toString()
          );

          if (verisartUrl) {
            newMetadata.description = `Print Edition Certificate: ${verisartUrl.url}\n\n${newMetadata.description}`;
          }
        }

        const fileData = JSON.stringify(newMetadata);
        const fileName = `/${redeemedTokenAddress}/${i}`;

        files.push({
          fileName,
          fileData,
        });
      }

      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('file', file.fileData, file.fileName);
        });

        const response = await axios.post(
          'https://api.nft.storage/upload',
          formData,
          {
            headers: {
              Authorization: `Bearer ${process.env.NFT_STORAGE_API_KEY}`,
              ...formData.getHeaders(),
            },
          }
        );

        if (response.status === 200) {
          const data = response.data;
          const cid = data.value.cid;
          const ipfsUrl = 'https://ipfs.io/ipfs/' + cid;

          product.ipfsUrl = ipfsUrl;
          product.save();

          resolve(ipfsUrl);
        } else {
          reject(
            new Error(`Failed to upload directory. Status: ${response.status}`)
          );
        }
      } catch (error) {
        console.error('Error uploading directory:', error);
        reject(error);
      }
    });

    uploadPromises.push(uploadPromise);
  }

  return uploadPromises;
}

export async function updateEverything(client: GraphqlClient) {
  let hasNextPage = true;
  let endCursor = null;
  let throttleTimeout = 500;

  try {
    while (hasNextPage) {
      let query: any = `
      query MyQuery {
        orders(first: 10, after:  ${endCursor ? `"${endCursor}"` : 'null'}) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            name
            email
            id
            lineItems(first: 10) {
              edges {
                node {
                  name
                  quantity
                  product {
                    id
                  }
                  customAttributes {
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    `;

      await new Promise((resolve) => setTimeout(resolve, throttleTimeout)); // Implement rate limiting

      const response: any = await client.query({ data: query });

      if (
        response.body.data &&
        response.body.data.orders &&
        response.body.data.orders.nodes
      ) {
        const orders = response.body.data.orders.nodes;

        orders.forEach((order: any) => {
          const orderId = order.id.match(/Order\/(.*)$/)[1];
          const orderNumber = parseInt(order.name.slice(1));
          const email = order.email;

          if (order.lineItems && order.lineItems.edges) {
            const lineItems = order.lineItems.edges;

            lineItems.forEach(async (lineItem: any) => {
              const productId =
                lineItem.node.product.id.match(/Product\/(.*)$/)[1];
              const lineItemCustomAttributes = lineItem.node.customAttributes;
              const quantity = lineItem.node.quantity;

              if (lineItemCustomAttributes) {
                const walletUsed = lineItemCustomAttributes.find(
                  (prop: any) => prop.key === '_wallet'
                )?.value;

                const tokenId = lineItemCustomAttributes.find(
                  (prop: any) => prop.key === 'Token ID'
                )?.value;

                const tokenGateId = lineItemCustomAttributes.find(
                  (prop: any) => prop.key === '_token_gate_id'
                )?.value;

                const existingOrder = await OrderPaidModel.find({
                  productId: productId,
                  orderNumber: orderNumber,
                  tokenId: tokenId,
                });

                if (existingOrder.length === 0) {
                  await OrderPaidModel.create({
                    globalId: orderId,
                    productId: productId,
                    orderNumber: orderNumber,
                    walletUsed: walletUsed,
                    email: email,
                    tokenId: tokenId,
                    tokenGateId: tokenGateId,
                    fufilled: false,
                    burned: false,
                    gaming: quantity > 1,
                  }).catch((error) => {
                    console.log('Already added');
                  });
                }
              }
            });
          }
        });

        hasNextPage = response.body.data.orders.pageInfo.hasNextPage;
        endCursor = response.body.data.orders.pageInfo.endCursor;

        throttleTimeout = 500; // Reset the throttle timeout to 500 milliseconds for the next request
      } else {
        return Promise.reject(response);
        break;
      }
    }
  } catch (error) {
    console.error('GraphQL request error:', error);
    return Promise.reject(error);
  }

  return await storeBurnEvents(client, true);
}

export async function updateOSMetadataForToken(
  contractAddress: string,
  tokenId: Number
) {
  const res = await fetch(
    `https://api.opensea.io/api/v1/asset/${contractAddress}/${tokenId}/?force_update=true`
  );
  await res.status;
}

export async function updateOSMetadataForCollection(contractAddress: string) {
  const res = await fetch(
    `https://api.opensea.io/api/v1/asset/${contractAddress}/?force_update=true`
  );
  await res.status;
}

export async function getConfiguredProducts() {
  return await ProductContractModel.find();
}

export async function getburnEvents() {
  return await BurnToRedeemModel.find();
}

export async function getAllEmails() {
  return await OrderPaidModel.find({}, 'email');
}

export async function getEmailsForUnBurned() {
  return await OrderPaidModel.find(
    {
      burned: false,
    },
    'email'
  );
}
