import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AvatarRepository } from '../../infrastructure/avatar.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { Inject } from '@nestjs/common';
import { InternalCode, Services } from '../../../../../../../libs/enums';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Prisma } from '@prisma/client';

export class SaveAvatarCommand {
  constructor(public file: Express.Multer.File, public userId: number) {}
}

@CommandHandler(SaveAvatarCommand)
export class SaveAvatarUseCase implements ICommandHandler<SaveAvatarCommand> {
  constructor(
    @Inject(Services.FileService) private client: ClientProxy,
    private avatarRepository: AvatarRepository,
  ) {}

  async execute(command: SaveAvatarCommand) {
    const saveResult = await lastValueFrom(
      this.client.send(
        { cmd: 'save_avatar' },
        { file: command.file, userId: command.userId },
      ),
    );
    if (!saveResult) return new ResultDTO(InternalCode.Internal_Server);

    const data: Prisma.AvatarUncheckedCreateInput = {
      userId: command.userId,
      fileId: saveResult.fileId,
      key: saveResult.key,
    };

    return this.avatarRepository.createOrUpdateAvatar(data);
  }
}
