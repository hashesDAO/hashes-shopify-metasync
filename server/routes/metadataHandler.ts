import { Router } from 'express';
import {
  createMetadataForCollection,
  getMetadataByTokenId,
  updateMetadataForToken,
} from '../services/MetadataService';

const metadataRoute = Router();

metadataRoute.post(
  '/metadata/create/:contractAddress/:numTokens',
  async (req, res) => {
    const { contractAddress, numTokens } = req.params;
    const jsonData = JSON.stringify(req.body);

    const promises = await createMetadataForCollection(
      contractAddress,
      jsonData,
      parseInt(numTokens)
    );

    Promise.all(promises)
      .then((r: any) => {
        res.json({ success: true, message: 'JSON data uploaded to S3.' });
      })
      .catch((err: any) => {
        res.status(500).json({ error: 'Failed to upload JSON data to S3.' });
      });
  }
);

metadataRoute.put('/metadata/:contractAddress/:tokenId', async (req, res) => {
  const { contractAddress, tokenId } = req.params;
  const jsonData = JSON.stringify(req.body);

  await updateMetadataForToken(contractAddress, tokenId, jsonData)
    .then((result) => {
      res.json({
        success: true,
        message: `JSON data updated for ${contractAddress}-${tokenId}`,
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: `JSON data FAILED to update for ${contractAddress}-${tokenId} ERROR: ${error}`,
      });
    });
});

metadataRoute.get('/metadata/:contractAddress/:tokenId', async (req, res) => {
  const { contractAddress, tokenId } = req.params;

  await getMetadataByTokenId(contractAddress, tokenId)
    .then((result) => {
      res.json({ result });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

export default metadataRoute;
