import 'dotenv/config';
import fetch from 'node-fetch';

import ProductContractModel from '../../utils/models/ProductContractModel';
import OrderPaidModel from '../../utils/models/OrderPaidModel';
import BurnToRedeemModel from '../../utils/models/BurnToRedeemModel';
import {
  getBurnedErc1155ForTx,
  getTransactionHashesForMint,
} from './NftService';

export async function configureProductsForBurnRedeem(
  responseRequestBody: string
) {
  const jsonReponse = JSON.parse(responseRequestBody);
  const promises: Promise<any>[] = [];

  jsonReponse?.products.forEach(async (item: any) => {
    const productId = item.productId;
    const redeemContractAddress = item.redeemContractAddress;
    const burnContractAddress = item.burnContractAddress;
    const extensionAddress = item.extensionAddress;
    const burnTknUrl = item.burnTknUrl;

    promises.push(
      new Promise(async (resolve, reject) => {
        await ProductContractModel.updateOne(
          { productId: productId }, // Filter criteria
          {
            $set: {
              redeemContractAddress: redeemContractAddress,
              burnContractAddress: burnContractAddress,
              extensionAddress: extensionAddress,
              burnTknUrl: burnTknUrl,
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
      })
    );
  });

  return promises;
}

// make a checkForNewBurns endpoint and save all burns to database
// get metadata for orderNumber debug endpoint

export async function storeBurnEvents() {
  const orders = await OrderPaidModel.find({ fufilled: false });

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

      const order = orders.find(
        (order: any) =>
          order.productId === element.productId &&
          order.walletUsed === tx.mintee
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
                resolve(true);
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

// TODO: getMetadata thats stored in DB, loop through all orders, grab burned data, and update metadata/push to ipfs
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
