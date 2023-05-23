import { Router } from 'express';
import clientProvider from '../../utils/clientProvider';
import metadataRoute from './metadataHandler';

const userRoutes = Router();
userRoutes.use(metadataRoute);

userRoutes.get('/api', (req, res) => {
  const sendData = { text: 'This is coming from /apps/api route.' };
  res.status(200).json(sendData);
});

userRoutes.post('/api', (req, res) => {
  res.status(200).json(req.body);
});

userRoutes.get('/api/gql', async (req, res) => {
  //false for offline session, true for online session
  const { client } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: false,
  });

  const shop = await client.query({
    data: `{
      shop {
        name
      }
    }`,
  });

  res.status(200).send(shop);
});

export default userRoutes;