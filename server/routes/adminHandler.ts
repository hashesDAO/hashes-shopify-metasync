import { Router } from 'express';

import {
  configureProductsForBurnRedeem,
  storeBurnEvents,
} from '../services/AdminService';

const adminRoute = Router();

adminRoute.post('/admin/configure_products/', async (req, res) => {
  const jsonData = JSON.stringify(req.body);

  const promises = await configureProductsForBurnRedeem(jsonData);

  Promise.all(promises)
    .then((r: any) => {
      res.json({ success: true, message: 'Products successfully configured' });
    })
    .catch((err: any) => {
      res.status(500).json({ error: 'Failed to configure products' });
    });
});

adminRoute.post('/admin/refresh_burns/', async (req, res) => {
  const promises = await storeBurnEvents();

  Promise.all(promises)
    .then((r: any) => {
      res.json({ success: true, message: 'Burns added to database' });
    })
    .catch((err: any) => {
      res.status(500).json({ error: 'Failed to sync burn events ' });
    });
});
// TODO:
// loop through configureProductsForBurnRedeem
// call getTransactionHashesForMint(redeemAssetAddress) and then loop through res
// save the redeemedId here
// calling getBurnedErc1155ForTx(burnAssetAddress, txHash)
// save the burnedId here
// we should have redeemAddress redeemTokenId burnAddress burnedId
// find all orderSchemas where burnedId and burnContractAddress match ?? double check this
// update metadata on those
// fufill orders

// make a checkForNewBurns endpoint and save all burns to database
// get metadata for orderNumber debug endpoint

//TODO: push to ipfs endpoints
export default adminRoute;
