import { Router } from 'express';
import s3Route from '../s3Operations';
import metadataRoute from '../metadataHandler';
const proxyRouter = Router();

proxyRouter.use(s3Route);
proxyRouter.use(metadataRoute);

proxyRouter.get('/json', async (req, res) => {
  return res.status(200).send({ content: 'Proxy Be Working' });
});

export default proxyRouter;
