import s3 from '../../utils/awsConfig';
import 'dotenv/config';
import { PutObjectRequest } from 'aws-sdk/clients/s3';

async function createMetadataForCollection(
  address: string,
  jsonData: string,
  tokenAmt: number
) {
  for (let i = 0; i < tokenAmt; i++) {
    const bucketName = process.env.AWS_BUCKET!;

    // Generate a unique key for the S3 object
    const key = `${address}/` + i;

    // Set the parameters for S3 upload
    const params: PutObjectRequest = {
      Bucket: bucketName,
      Key: key,
      Body: jsonData,
    };

    // TODO: add mongo logs and return errors
  }
}

async function uploadToS3(params: PutObjectRequest) {
  s3.upload(params, (err: any, data: any) => {
    if (err) {
      console.error('Error uploading JSON data to S3:', err);
    } else {
      console.log('JSON data uploaded successfully:', data.Location);
    }
  });
}

export default createMetadataForCollection;
