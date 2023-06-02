import 'dotenv/config';
import fetch from 'node-fetch';

import ProductContractModel from '../../utils/models/ProductContractModel';
import OrderPaidModel from '../../utils/models/OrderPaidModel';
import BurnToRedeemModel from '../../utils/models/BurnToRedeemModel';
import {
  getBurnedErc1155ForTx,
  getNFTMetadata,
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

      const burnedToken = await getBurnedErc1155ForTx(
        burnContractAddress,
        redeemTx
      );

      console.log(burnedToken);

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

export async function getMetadataPreviewForOrder(orderNumber: string) {
  try {
    const burnRedeemModel = await BurnToRedeemModel.findOne({
      orderNumber: orderNumber,
    });

    if (burnRedeemModel) {
      const metadataPreUpdate = await getNFTMetadata(
        burnRedeemModel.redeemContractAddress,
        burnRedeemModel.redeemedTokenId.toString()
      );

      metadataPreUpdate.attributes.push({
        trait_type: 'Order Number',
        value: orderNumber,
      });

      metadataPreUpdate.attributes.push({
        trait_type: 'Burned Token Address',
        value: burnRedeemModel.burnContractAddress,
      });

      metadataPreUpdate.attributes.push({
        trait_type: 'Burned Token ID',
        value: burnRedeemModel.burnedTokenId,
      });

      return metadataPreUpdate;
    }
    return '';
  } catch (e) {
    return `Unable to get metadata for order ${orderNumber} - ${e}`;
  }
}

//TODO: push to ipfs, get ipfs link for preview , pin?
//TODO: fufill orders or tag them

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
