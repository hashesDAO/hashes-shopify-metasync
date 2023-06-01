import { Router } from 'express';
import {
  getNFTMetadata,
  getTransactionHashesForMint,
  getBurnedErc1155ForTx,
} from '../services/NftService';

const nftRoute = Router();

// Gets metadata from IPFS for a given contract addr
nftRoute.get('/metadata/:contractAddress/', async (req, res) => {
  const { contractAddress } = req.params;

  await getNFTMetadata(contractAddress)
    .then((result) => {
      res.json({ result });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

// Get all tokens and the txs they were minted on
nftRoute.get('/createdTx/:contractAddress', async (req, res) => {
  const { contractAddress } = req.params;

  await getTransactionHashesForMint(contractAddress)
    .then((result) => {
      res.json({ result });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

nftRoute.get('/burned_id/:burnAssetAddress/:tx', async (req, res) => {
  const { burnAssetAddress, tx } = req.params;

  await getBurnedErc1155ForTx(burnAssetAddress, tx)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

export default nftRoute;
