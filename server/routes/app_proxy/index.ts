import { Router } from 'express';
import metadataRoute from '../metadataHandler';
const proxyRouter = Router();

proxyRouter.use(metadataRoute);

proxyRouter.get('/json', async (req, res) => {
  return res.status(200).send({ content: 'Proxy Be Working' });
});

export default proxyRouter;
