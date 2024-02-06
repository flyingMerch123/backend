import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Express } from 'express';
import { S3Adapter } from '../../adapter/s3.adapter';
import { File, FileModelType } from '../../domain/s3.entity';
import { FileTypeEnum } from '../../../../../enums';
import { S3Repository } from '../../infrastructure/s3.repository';
import { InjectModel } from '@nestjs/mongoose';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { fileIdAndKey } from '../../../../../../../libs/types';
import { SavaAvatarToS3Model } from '../../api/models/save.avatar.to.s3.model';

export class SaveAvatarCommand {
  constructor(public img: Express.Multer.File, public userId: string) {}
}

@CommandHandler(SaveAvatarCommand)
export class SaveAvatarUseCase implements ICommandHandler<SaveAvatarCommand> {
  constructor(
    private s3Adapter: S3Adapter,
    private s3Repository: S3Repository,
    @InjectModel(File.name) private FileModel: FileModelType,
  ) {}

  async execute(command: SaveAvatarCommand): Promise<ResultDTO<fileIdAndKey>> {
    const avatarResult = await this.s3Repository.findByUserId(+command.userId);
    if (!avatarResult.hasError()) await avatarResult.payload.deleteOne();

    const dto: SavaAvatarToS3Model = {
      userId: +command.userId,
      buffer: command.img.buffer,
      mimetype: command.img.mimetype,
    };
    const saveResult = await this.s3Adapter.saveAvatar(dto);
    if (saveResult.hasError()) return saveResult as ResultDTO<null>;

    const metadata = command.img;
    delete metadata.buffer;

    const file = this.FileModel.makeInstance(
      saveResult.payload.data.ETag,
      +command.userId,
      FileTypeEnum.Img,
      saveResult.payload.key,
      metadata,
      this.FileModel,
    );

    return this.s3Repository.save(file);
  }
}
