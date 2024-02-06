import { File, FileDocument, FileModelType } from '../domain/s3.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';
import { Types } from 'mongoose';
import { fileIdAndKey } from '../../../../../../libs/types';

@Injectable()
export class S3Repository {
  constructor(@InjectModel(File.name) private FileModule: FileModelType) {}

  async save(avatarInstance: FileDocument): Promise<ResultDTO<fileIdAndKey>> {
    const savedFile = await avatarInstance.save();

    return new ResultDTO(InternalCode.Success, {
      fileId: savedFile.id.toString(),
      key: savedFile.key,
    });
  }

  async findByUserId(userId: number): Promise<ResultDTO<FileDocument>> {
    const userInstance = await this.FileModule.findOne({
      userId,
    });

    if (!userInstance) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, userInstance);
  }

  async findById(fileId: string): Promise<ResultDTO<FileDocument>> {
    const userInstance = await this.FileModule.findById(
      new Types.ObjectId(fileId),
    );
    if (!userInstance) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, userInstance);
  }

  async savePostImage(
    postImageInstance: FileDocument,
  ): Promise<ResultDTO<fileIdAndKey>> {
    const savedFile = await postImageInstance.save();

    return new ResultDTO(InternalCode.Success, {
      // postId: savedFile.
      fileId: savedFile.id.toString(),
      key: savedFile.key,
    });
  }
}
