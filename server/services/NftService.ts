import s3 from '../../utils/awsConfig';
import 'dotenv/config';
import fetch from 'node-fetch';

import { GetObjectRequest, PutObjectRequest } from 'aws-sdk/clients/s3';
import TokenGateModel from '../../utils/models/TokenGateModel';
import { Erc1155Abi } from '../../utils/abi/erc1155Abi';
import { ethers } from 'ethers';

//TODO: create a manual upload process just in case
//TODO: method for uploading data to IPFS

// TODO: call getNftMetadata and store each res to the database
export async function storeNFTMetadata(address: string) {}

export async function getStoredNFTMetadata(nftContractAddress: string) {}

//TODO: map this to an object and catch errors
export async function getNFTMetadata(nftContractAddress: string) {
  try {
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-API-KEY': process.env.SIMPLEHASH_API_KEY as string,
      },
    };

    const simpleHashRes = await fetch(
      `https://api.simplehash.com/api/v0/nfts/ethereum/${nftContractAddress}/1?limit=1`,
      options
    );

    return new Promise(async (resolve, reject) => {
      if (simpleHashRes.status !== 200) {
        console.error('Error fetching NFT metadata:');
        reject(
          `Couldn't get metadata for collection ${nftContractAddress} :${simpleHashRes.statusText}`
        );
      }

      const body = await simpleHashRes.json();
      const metadataURI = body?.extra_metadata.metadata_original_url;

      if (metadataURI) {
        // Make a request to the metadata URI to fetch the metadata
        const metadataResponse = await fetch(metadataURI);
        await metadataResponse
          .json()
          .then((result) => {
            resolve(result);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        reject(`Couldn't scrape IPFS/Arweave for data`);
      }
    });
  } catch (error: any) {
    console.error('Error fetching NFT metadata:', error.message);
  }
}

export async function getTransactionHashesForMint(nftContractAddress: string) {
  return await fetchTransactions(
    `https://api.simplehash.com/api/v0/nfts/ethereum/${nftContractAddress}`,
    []
  );
}

export async function fetchTransactions(url: string, dataArr: any[]) {
  try {
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-API-KEY': process.env.SIMPLEHASH_API_KEY as string,
      },
    };

    const simpleHashRes = await fetch(url, options);

    return new Promise(async (resolve, reject) => {
      if (simpleHashRes.status !== 200) {
        console.error('Error fetching NFT metadata:');
        reject(
          `Couldn't get metadata for collection ${url} :${simpleHashRes.statusText}`
        );
      }

      const data = await simpleHashRes.json();
      const newData = data.nfts.map((nft: any) => {
        return {
          token_id: nft.token_id,
          transaction: nft.first_created.transaction,
        };
      });

      dataArr.push(...newData);

      // if more results, recursivley add them
      if (data.next) {
        resolve(await fetchTransactions(data.next, dataArr));
      } else {
        resolve(dataArr);
      }
    });
  } catch (error: any) {
    console.error('Error fetching NFT metadata:', error.message);
  }
}

//TODO: error handling and logging
export async function getBurnedErc1155ForTx(
  burnAssetAddress: string,
  transactionHash: string
) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.MAINNET_RPC
    );
    const logs = (await provider.getTransactionReceipt(transactionHash)).logs;

    // Get the contract instance
    const interFaceAbi = new ethers.utils.Interface(Erc1155Abi);

    // Filter the logs based on the address field
    const filteredLogs = logs.find(
      (log) => log.address.toLowerCase() === burnAssetAddress.toLowerCase()
    );

    if (filteredLogs === undefined) {
      return false;
    }

    return interFaceAbi.parseLog(filteredLogs).args.id.toString();
  } catch (error) {
    console.log(error);
  }
}

export async function createMetadataForCollection(
  address: string,
  jsonData: string,
  tokenAmt: number
) {
  const promises = [];

  for (let i = 0; i < tokenAmt; i++) {
    const bucketName = process.env.AWS_BUCKET!;
    const key = `${address}/` + i;

    const parsedJson: any = JSON.parse(jsonData);
    const name = parsedJson.name.toLowerCase().trim();

    await TokenGateModel.updateOne(
      { contractAddress: address }, // Filter criteria
      {
        $set: {
          productName: name,
        },
      }, // Update values
      { upsert: true }
    )
      .then((result) => {
        console.log('Upsert result:', result);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    if (
      !parsedJson.attributes.find(
        (attribute: any) => attribute.trait_type === 'Claimed'
      )
    ) {
      parsedJson.attributes.push({
        trait_type: 'Claimed',
        value: 'False',
      });
    }

    const params: PutObjectRequest = {
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(parsedJson),
    };

    promises.push(await uploadToS3(params));
  }

  return promises;
}

export async function updateMetadataForToken(
  address: string,
  tokenId: string,
  jsonData: string
) {
  const bucketName = process.env.AWS_BUCKET!;
  const key = `${address}/` + tokenId;

  const params: PutObjectRequest = {
    Bucket: bucketName,
    Key: key,
    Body: jsonData,
  };

  return await uploadToS3(params);
}

export async function getMetadataByTokenId(address: string, tokenId: string) {
  const bucketName = process.env.AWS_BUCKET!;
  const key = `${address}/` + tokenId;

  const params: GetObjectRequest = {
    Bucket: bucketName,
    Key: key,
  };

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err || data.Body === undefined) {
        console.error('Error retrieving JSON file:', err);
        reject(err);
      } else {
        const jsonContent = data.Body.toString('utf-8');
        const jsonData = JSON.parse(jsonContent);

        resolve(jsonData);
      }
    });
  });
}

async function uploadToS3(params: PutObjectRequest) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err: any, data: any) => {
      if (err) {
        console.error('Error uploading JSON data to S3:', err);
        err.file = params.Key;
        reject(err);
      } else {
        console.log('JSON data uploaded successfully:', data.Location);
        resolve(data);
      }
    });
  });
}
