import 'dotenv/config';
import fetch from 'node-fetch';

import ProductContractModel from '../../utils/models/ProductContractModel';

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

// TODO: function that loops through logs, and saves what token was burned along with what token was claimed etc

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
