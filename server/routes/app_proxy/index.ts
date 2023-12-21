import { Router } from 'express';
import adminRoute from '../adminHandler';
import nftRoute from '../nftHandler';

const proxyRouter = Router();

proxyRouter.get('/json', async (req, res) => {
  return res.status(200).send({ content: 'Proxy Be Working' });
});

export default proxyRouter;
