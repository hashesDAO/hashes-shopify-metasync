import { Router } from 'express';
import createMetadataForCollection from '../services/MetadataService';

const metadataRoute = Router();

metadataRoute.post(
  '/metadata/create/:contractAddress/:numTokens',
  async (req, res) => {
    const { contractAddress, numTokens } = req.params;
    const jsonData = JSON.stringify(req.body);

    await createMetadataForCollection(
      contractAddress,
      jsonData,
      parseInt(numTokens)
    );
    res.json({ message: 'JSON data uploaded to S3.' });
  }
);

export default metadataRoute;
