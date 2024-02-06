import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';
import { SavePostImageToS3Model } from '../api/models/save.post.image.to.s3.model';
import { S3SaveOutputModel } from '../api/models/s3.save.output.model';
import { SavaAvatarToS3Model } from '../api/models/save.avatar.to.s3.model';

@Injectable()
export class S3Adapter {
  s3Client: S3Client;

  constructor() {
    const REGION = 'us-east-1';

    this.s3Client = new S3Client({
      region: REGION,
      endpoint: 'https://storage.yandexcloud.net',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async saveAvatar(
    dto: SavaAvatarToS3Model,
  ): Promise<ResultDTO<S3SaveOutputModel>> {
    const key = `content/users/${dto.userId}/avatars/${uuid()}_avatar.png`;

    const bucketParams = {
      Bucket: 'inctagram1',
      Key: key,
      Body: dto.buffer,
      ContentType: dto.mimetype,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      const uploadResult = await this.s3Client.send(command);
      return new ResultDTO(InternalCode.Success, { key, data: uploadResult });
    } catch (e) {
      return new ResultDTO(InternalCode.Internal_Server);
    }
  }

  async deleteAvatar(key: string): Promise<ResultDTO<null>> {
    const bucketParams = {
      Bucket: 'inctagram1',
      Key: key,
    };

    const command = new DeleteObjectCommand(bucketParams);

    try {
      await this.s3Client.send(command);
      return new ResultDTO(InternalCode.Success);
    } catch (e) {
      return new ResultDTO(InternalCode.Internal_Server);
    }
  }

  async savePostImage(
    dto: SavePostImageToS3Model,
  ): Promise<ResultDTO<S3SaveOutputModel>> {
    // todo - префикс для key должен храниться в .env в перемнных
    const key = `content/users/${dto.userId}/posts/${dto.postId}/${uuid()}.png`;

    const bucketParams = {
      Bucket: 'inctagram1',
      Key: key,
      Body: dto.buffer,
      ContentType: dto.mimetype,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      const saveResult = await this.s3Client.send(command);
      return new ResultDTO(InternalCode.Success, { key, data: saveResult });
    } catch (e) {
      return new ResultDTO(InternalCode.Internal_Server);
    }
  }

  async deletePostImage(key: string): Promise<ResultDTO<null>> {
    const bucketParams = {
      Bucket: 'inctagram1',
      Key: key,
    };

    const command = new DeleteObjectCommand(bucketParams);

    try {
      await this.s3Client.send(command);
      return new ResultDTO(InternalCode.Success);
    } catch (e) {
      return new ResultDTO(InternalCode.Internal_Server);
    }
  }
}
