import { Router } from 'express';

import {
  configureProductsForBurnRedeem,
  getConfiguredProducts,
  getMetadataPreviewForOrder,
  getburnEvents,
  storeBurnEvents,
} from '../services/AdminService';
import clientProvider from '../../utils/clientProvider';

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

adminRoute.get('/admin/products/', async (req, res) => {
  await getConfiguredProducts()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

adminRoute.get('/admin/burns', async (req, res) => {
  await getburnEvents()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

adminRoute.post('/admin/refresh_burns/', async (req, res) => {
  const { client } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: true,
  });

  const promises = await storeBurnEvents(client);

  Promise.all(promises)
    .then((r: any) => {
      res.json({ success: true, message: 'Burns added to database' });
    })
    .catch((err: any) => {
      res.status(500).json({ error: 'Failed to sync burn events ' });
    });
});

// TODO: show configured products

// Gets metadata from IPFS for a given contract addr
adminRoute.get('/admin/metadata_preview/:orderId', async (req, res) => {
  const { orderId } = req.params;

  await getMetadataPreviewForOrder(orderId)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});
export default adminRoute;
