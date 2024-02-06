import { PutObjectCommandOutput } from '@aws-sdk/client-s3';

export type S3SaveOutputModel = {
  key: string;
  data: PutObjectCommandOutput;
};
