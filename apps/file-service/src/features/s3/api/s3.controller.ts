import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { SaveAvatarCommand } from '../application/use-cases/save-avatar.use-case';
import { DeleteAvatarCommand } from '../application/use-cases/delete-avatar.use-case';
import { ExceptionAndResponseHelper } from '../../../../../../libs/core/exceptionAndResponse';
import { ApproachType } from '../../../../../../libs/enums';
import { SavePostImagesCommand } from '../application/use-cases/save-post-images.use-case';
import { fileIdAndKey } from '../../../../../../libs/types';
import { DeletePostImagesCommand } from '../application/use-cases/delete-post-images.use-case';

@Controller()
export class S3Controller extends ExceptionAndResponseHelper {
  constructor(private commandBus: CommandBus) {
    super(ApproachType.tcp);
  }

  @MessagePattern({ cmd: 'save_avatar' })
  async saveAvatar(data: any): Promise<fileIdAndKey> {
    const saveResult = await this.commandBus.execute(
      new SaveAvatarCommand(data.file, data.userId),
    );

    return this.sendExceptionOrResponse(saveResult);
  }

  @MessagePattern({ cmd: 'delete_avatar' })
  async deleteAvatar(data: any): Promise<void> {
    const deleteResult = await this.commandBus.execute(
      new DeleteAvatarCommand(data.fileId),
    );

    return this.sendExceptionOrResponse(deleteResult);
  }

  @MessagePattern({ cmd: 'save_post_images' })
  async savePostImages(data: any): Promise<fileIdAndKey[]> {
    const saveResult = await this.commandBus.execute(
      new SavePostImagesCommand(data.files, data.userId, data.postId),
    );

    return this.sendExceptionOrResponse(saveResult);
  }

  @MessagePattern({ cmd: 'delete_post_images' })
  async deletePostImages(data: any): Promise<void> {
    const deleteResult = await this.commandBus.execute(
      new DeletePostImagesCommand(data.fileId),
    );

    return this.sendExceptionOrResponse(deleteResult);
  }
}
