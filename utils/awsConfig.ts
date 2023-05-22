// @ts-nocheck
import 'dotenv/config';
import AWS from 'aws-sdk';

// Setup S3 configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: 'us-east-2',
});

const s3 = new AWS.S3();

export default s3;
