import { Router } from 'express';

import { configureProductsForBurnRedeem } from '../services/AdminService';

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

// TODO:
// loop through configureProductsForBurnRedeem
// call getTransactionHashesForMint(redeemAssetAddress) and then loop through res
// save the redeemedId here
// calling getBurnedErc1155ForTx(burnAssetAddress, txHash)
// save the burnedId here
// we should have redeemAddress redeemTokenId burnAddress burnedId

//TODO: push to ipfs endpoints
export default adminRoute;
