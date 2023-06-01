import 'dotenv/config';
import fetch from 'node-fetch';

import { Erc1155Abi } from '../../utils/abi/erc1155Abi';
import { ethers } from 'ethers';

//TODO: create a manual upload process just in case
//TODO: method for uploading data to IPFS

// TODO: call getNftMetadata and store each res to the database
export async function storeNFTMetadata(address: string) {}

export async function getStoredNFTMetadata(nftContractAddress: string) {}

//TODO: map this to an object and catch errors
export async function getNFTMetadata(
  nftContractAddress: string,
  tokenId: string
) {
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
