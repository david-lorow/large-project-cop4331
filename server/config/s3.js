const { S3Client } = require('@aws-sdk/client-s3');
const { TextractClient } = require('@aws-sdk/client-textract');

const region = process.env.AWS_REGION || 'us-east-1';

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

const s3 = new S3Client({ region, credentials });
const textract = new TextractClient({ region, credentials });

module.exports = { s3, textract };
