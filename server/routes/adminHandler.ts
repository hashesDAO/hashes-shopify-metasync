import { Router } from 'express';

import {
  configureProductsForBurnRedeem,
  getAllEmails,
  getConfiguredProducts,
  getEmailsForUnBurned,
  getburnEvents,
  storeAllMetadata,
  storeBurnEvents,
  updateEverything,
  updateMetadataForAllProducts,
} from '../services/AdminService';
import clientProvider from '../../utils/clientProvider';

const adminRoute = Router();

adminRoute.post('/admin/configure_products', async (req, res) => {
  const jsonData = JSON.stringify(req.body);
  const promises = await configureProductsForBurnRedeem(jsonData);

  Promise.all(promises)
    .then((r: any) => {
      res.json({ success: true, message: 'Products successfully configured' });
    })
    .catch((err: any) => {
      res.status(500).json({ error: err });
    });
});

adminRoute.get('/admin/products', async (req, res) => {
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

adminRoute.get('/admin/emails', async (req, res) => {
  await getAllEmails()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

adminRoute.get('/admin/emails_unburned', async (req, res) => {
  await getEmailsForUnBurned()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

adminRoute.get('/admin/refresh_burns', async (req, res) => {
  const { client } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: true,
  });

  const promises = await storeBurnEvents(client, false);

  Promise.all(promises)
    .then((r: any) => {
      res.json({ success: true, message: 'Burns added to database' });
    })
    .catch((err: any) => {
      res.status(500).json({ error: 'Failed to sync burn events ' });
    });
});

adminRoute.post('/admin/repair', async (req, res) => {
  const { client } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: true,
  });

  const promise = await updateEverything(client);

  Promise.all(promise)
    .then((r: any) => {
      res.json({ success: true, message: 'Database updated' });
    })
    .catch((err: any) => {
      res.status(500).json({ error: 'Failed to sync database' });
    });
});

adminRoute.post('/admin/updateOS', async (req, res) => {
  await updateMetadataForAllProducts();
  res.json({ success: true, message: 'Request to update metadata success' });
});

adminRoute.post('/admin/upload_ipfs', async (req, res) => {
  const { client } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: true,
  });

  const promise = await storeAllMetadata(client);
  Promise.all(promise)
    .then((result: any) => {
      res.json({ success: true, message: `IPFS CID: ${result}` });
    })
    .catch((err: any) => {
      res.status(500).json({ error: err });
    });
});
export default adminRoute;
