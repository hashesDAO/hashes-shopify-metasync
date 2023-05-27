import s3 from '../../utils/awsConfig';
import 'dotenv/config';
import { GetObjectRequest, PutObjectRequest } from 'aws-sdk/clients/s3';
import TokenGateModel from '../../utils/models/TokenGateModel';

export async function createMetadataForCollection(
  address: string,
  jsonData: string,
  tokenAmt: number
) {
  const promises = [];

  for (let i = 0; i < tokenAmt; i++) {
    const bucketName = process.env.AWS_BUCKET!;
    const key = `${address}/` + i;

    const parsedJson: any = JSON.parse(jsonData);
    const name = parsedJson.name.toLowerCase().trim();

    await TokenGateModel.updateOne(
      { contractAddress: address }, // Filter criteria
      {
        $set: {
          productName: name,
          numTokens: tokenAmt,
        },
      }, // Update values
      { upsert: true }
    )
      .then((result) => {
        console.log('Upsert result:', result);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    if (
      !parsedJson.attributes.find(
        (attribute: any) => attribute.trait_type === 'Claimed'
      )
    ) {
      parsedJson.attributes.push({
        trait_type: 'Claimed',
        value: 'False',
      });
    }

    const params: PutObjectRequest = {
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(parsedJson),
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
