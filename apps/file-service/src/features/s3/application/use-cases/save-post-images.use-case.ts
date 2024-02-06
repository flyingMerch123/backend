import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Adapter } from '../../adapter/s3.adapter';
import { S3Repository } from '../../infrastructure/s3.repository';
import { InjectModel } from '@nestjs/mongoose';
import { File, FileDocument, FileModelType } from '../../domain/s3.entity';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { FileTypeEnum } from '../../../../../enums';
import { InternalCode } from '../../../../../../../libs/enums';
import { fileIdAndKey } from '../../../../../../../libs/types';
import { SavePostImageToS3Model } from '../../api/models/save.post.image.to.s3.model';

export class SavePostImagesCommand {
  constructor(
    public files: Express.Multer.File[],
    public userId: number,
    public postId: string,
  ) {}
}

@CommandHandler(SavePostImagesCommand)
export class SavePostImagesUseCase
  implements ICommandHandler<SavePostImagesCommand>
{
  constructor(
    private s3Adapter: S3Adapter,
    private s3Repository: S3Repository,
    @InjectModel(File.name) private FileModel: FileModelType,
  ) {}

  async execute(
    command: SavePostImagesCommand,
  ): Promise<ResultDTO<fileIdAndKey[]>> {
    const { files, userId, postId } = command;

    // сохраняем каждую картинку из массива files
    const savePostImagesResult: fileIdAndKey[] = await Promise.all(
      files.map(async (file) => {
        // сначала в s3
        const dto: SavePostImageToS3Model = {
          userId,
          postId,
          buffer: file.buffer,
          mimetype: file.mimetype,
        };
        const saveToS3Result = await this.s3Adapter.savePostImage(dto);
        // todo - добавить обработку ошибки здесь
        // if (saveToS3Result.hasError()) return saveToS3Result as ResultDTO<null>;

        const metadata = file;
        delete metadata.buffer;

        // затем в mongo подробную информацию о картинке
        const fileInstance: FileDocument = this.FileModel.makeInstance(
          saveToS3Result.payload.data.ETag,
          +userId,
          FileTypeEnum.Img,
          saveToS3Result.payload.key,
          metadata,
          this.FileModel,
        );
        const fileIdIdAndKey = await this.s3Repository.savePostImage(
          fileInstance,
        );

        return {
          ...fileIdIdAndKey.payload,
          postId,
        };
      }),
    );

    return new ResultDTO(InternalCode.Success, savePostImagesResult);
  }
}
