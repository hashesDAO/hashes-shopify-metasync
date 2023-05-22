import { Router } from 'express';
import s3 from '../../utils/awsConfig';
import 'dotenv/config';
import { PutObjectRequest } from 'aws-sdk/clients/s3';

const s3Route = Router();

s3Route.post('/upload', async (req, res) => {
  const jsonData = JSON.stringify(req.body);

  const bucketName = process.env.AWS_BUCKET!;

  // Generate a unique key for the S3 object
  const key = 'json_data/' + Date.now() + '.json';

  // Set the parameters for S3 upload
  const params: PutObjectRequest = {
    Bucket: bucketName,
    Key: key,
    Body: jsonData,
  };

  // Upload the JSON data to S3
  s3.upload(params, (err: any, data: any) => {
    if (err) {
      console.error('Error uploading JSON data to S3:', err);
      res.status(500).json({ error: 'Failed to upload JSON data to S3.' });
    } else {
      console.log('JSON data uploaded successfully:', data.Location);
      res.json({
        message: 'JSON data uploaded to S3.',
        s3Location: data.Location,
      });
    }
  });
});

export default s3Route;
