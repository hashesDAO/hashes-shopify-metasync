import s3 from '../../utils/awsConfig';
import 'dotenv/config';
import { GetObjectRequest, PutObjectRequest } from 'aws-sdk/clients/s3';
import { resolveObjMapThunk } from 'graphql';

export async function createMetadataForCollection(
  address: string,
  jsonData: string,
  tokenAmt: number
) {
  const promises = [];

  for (let i = 0; i < tokenAmt; i++) {
    const bucketName = process.env.AWS_BUCKET!;
    const key = `${address}/` + i;

    const params: PutObjectRequest = {
      Bucket: bucketName,
      Key: key,
      Body: jsonData,
    };

    promises.push(await uploadToS3(params));
  }

  return promises;
}

export async function updateMetadataForToken(
  address: string,
  tokenId: string,
  jsonData: string
) {
  const bucketName = process.env.AWS_BUCKET!;
  const key = `${address}/` + tokenId;

  const params: PutObjectRequest = {
    Bucket: bucketName,
    Key: key,
    Body: jsonData,
  };

  return await uploadToS3(params);
}

export async function getMetadataByTokenId(address: string, tokenId: string) {
  const bucketName = process.env.AWS_BUCKET!;
  const key = `${address}/` + tokenId;

  const params: GetObjectRequest = {
    Bucket: bucketName,
    Key: key,
  };

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err || data.Body === undefined) {
        console.error('Error retrieving JSON file:', err);
        reject(err);
      } else {
        const jsonContent = data.Body.toString('utf-8');
        const jsonData = JSON.parse(jsonContent);

        resolve(jsonData);
      }
    });
  });
}

async function uploadToS3(params: PutObjectRequest) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err: any, data: any) => {
      if (err) {
        console.error('Error uploading JSON data to S3:', err);
        err.file = params.Key;
        reject(err);
      } else {
        console.log('JSON data uploaded successfully:', data.Location);
        resolve(data);
      }
    });
  });
}
