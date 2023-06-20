import { Router } from 'express';
import {
  getNFTMetadataByToken,
  getTransactionHashesForMint,
  getBurnedErc721ForTx,
  addVerisartUrlToToken,
  removeVerisartUrlFromToken,
  getTotalSupply,
} from '../services/NftService';
import { getMetadataPreviewForOrder } from '../../server/services/AdminService';
import clientProvider from '../../utils/clientProvider';

const nftRoute = Router();

// Gets metadata as well as order info and shows projected metadata
nftRoute.get('/metadata_preview/:orderId', async (req, res) => {
  const { orderId } = req.params;

  const { client } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: true,
  });

  await getMetadataPreviewForOrder(orderId, client)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

nftRoute.post('/metadata/verisart_url', async (req, res) => {
  const jsonData = JSON.stringify(req.body);
  const promises = await addVerisartUrlToToken(jsonData);

  Promise.all(promises)
    .then((r: any) => {
      res.json({ success: true, message: 'Verisart urls added to tokens' });
    })
    .catch((err: any) => {
      res.status(500).json({ error: 'Failed to add verisart urls' });
    });
});

nftRoute.delete('/metadata/verisart_url', async (req, res) => {
  const jsonData = JSON.stringify(req.body);
  const promises = await removeVerisartUrlFromToken(jsonData);

  Promise.all(promises)
    .then((r: any) => {
      res.json({
        success: true,
        message: 'Verisart url removed from tokens',
      });
    })
    .catch((err: any) => {
      res.status(500).json({ error: 'Failed to remove verisart urls' });
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

// Gets metadata from on chain for a given contract addr
nftRoute.get('/metadata/:contractAddress/:tokenId', async (req, res) => {
  const { contractAddress, tokenId } = req.params;

  await getNFTMetadataByToken(contractAddress, tokenId)
    .then((result) => {
      res.json({ result });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

nftRoute.get('/burned_id/:burnAssetAddress/:tx', async (req, res) => {
  const { burnAssetAddress, tx } = req.params;

  await getBurnedErc721ForTx(burnAssetAddress, tx)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

nftRoute.get('/total_supply/:address/', async (req, res) => {
  const { address } = req.params;

  await getTotalSupply(address).then((result) => {
    res.json(result);
  });
});

export default nftRoute;
