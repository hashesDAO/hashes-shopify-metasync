import 'dotenv/config';
import fetch from 'node-fetch';

import { Erc721Abi } from '../../utils/abi/erc721Abi';

import { ethers } from 'ethers';
import TokenMetadataFieldModel from '../../utils/models/TokenMetadataFieldModel';

// Stores a custom field on a token basis to mongo
export async function addCustomMetadataFieldPerToken(
  responseRequestBody: string
) {
  const jsonReponse = JSON.parse(responseRequestBody);
  const promises: Promise<any>[] = [];

  jsonReponse?.tokens.forEach(async (token: any) => {
    const contractAddr = token.tokenGateAddress;
    const tokenId = token.tokenId;
    const metadataKey = token.metadataKey;
    const metadataValue = token.metadataValue;

    promises.push(
      new Promise(async (resolve, reject) => {
        await TokenMetadataFieldModel.updateOne(
          {
            burnContractAddress: contractAddr,
            tokenId: tokenId,
            metadataKey: metadataKey,
          },
          {
            $set: {
              metadataValue: metadataValue,
              burnContractAddress: contractAddr,
            },
          },
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

export async function removeCustomMetadataFieldPerToken(
  responseRequestBody: string
) {
  const jsonReponse = JSON.parse(responseRequestBody);
  const promises: Promise<any>[] = [];

  jsonReponse?.tokens.forEach(async (token: any) => {
    const contractAddr = token.tokenGateAddress;
    const tokenId = token.tokenId;
    const metadataKey = token.metadataKey;

    promises.push(
      new Promise(async (resolve, reject) => {
        await TokenMetadataFieldModel.deleteOne({
          burnContractAddress: contractAddr,
          tokenId: tokenId,
          metadataKey: metadataKey,
        })
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
export async function customMetadataByTokenId(
  tokenGateAddress: string,
  tokenId: string
) {
  return await TokenMetadataFieldModel.find({
    burnContractAddress: tokenGateAddress,
    tokenId: tokenId,
  });
}

export async function getNFTMetadataByToken(
  nftContractAddress: string,
  tokenId: string
): Promise<any> {
  try {
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-API-KEY': process.env.SIMPLEHASH_API_KEY as string,
      },
    };

    const simpleHashRes = await fetch(
      `https://api.simplehash.com/api/v0/nfts/ethereum/${nftContractAddress}/${tokenId}?limit=1`,
      options
    );

    return new Promise(async (resolve, reject) => {
      if (simpleHashRes.status !== 200) {
        console.error('Error fetching NFT metadata:');
        return reject(
          `Couldn't get metadata for collection ${nftContractAddress} :${simpleHashRes.statusText}`
        );
      }

      const body = await simpleHashRes.json();

      if (body.extra_metadata === undefined) {
        return resolve({});
      }

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
        return reject(`Couldn't scrape IPFS/Arweave for data`);
      }

      return resolve({});
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
  return new Promise(async (resolve, reject) => {
    try {
      const options = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-API-KEY': process.env.SIMPLEHASH_API_KEY as string,
        },
      };

      const simpleHashRes = await fetch(url, options);

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
          mintee: nft.first_created.minted_to,
        };
      });

      dataArr.push(...newData);

      // if more results, recursivley add them
      if (data.next) {
        resolve(await fetchTransactions(data.next, dataArr));
      } else {
        resolve(dataArr);
      }
    } catch (error: any) {
      reject(error);
      console.error('Error fetching NFT metadata:', error.message);
    }
  });
}

//TODO: error handling and logging
export async function getBurnedErc721ForTx(
  burnAssetAddress: string,
  transactionHash: string
) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.MAINNET_RPC
    );
    const logs = (await provider.getTransactionReceipt(transactionHash)).logs;

    // Get the contract instance
    const interFaceAbi = new ethers.utils.Interface(Erc721Abi);

    // Filter the logs based on the address field
    const filteredLogs = logs.find(
      (log) => log.address.toLowerCase() === burnAssetAddress.toLowerCase()
    );

    if (filteredLogs === undefined) {
      return false;
    }

    return interFaceAbi.parseLog(filteredLogs).args.tokenId.toString();
  } catch (error) {
    console.log(error);
  }
}

export async function getTotalSupply(contractAddress: string) {
  try {
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    };

    const looksRareRes = await fetch(
      `https://api.looksrare.org/api/v1/collections/stats?address=${contractAddress}`,
      options
    );

    if (looksRareRes.status !== 200) {
      console.error('Error getting collection size');
      return null;
    }

    const res = await looksRareRes.json();

    if (res.data.totalSupply) {
      return parseInt(res.data.totalSupply);
    }

    return 0;
  } catch (error: any) {
    console.error('Error fetching colection size', error.message);
    return 0;
  }
}
