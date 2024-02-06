import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { AvatarRepository } from '../../infrastructure/avatar.repository';
import { Inject } from '@nestjs/common';
import { InternalCode, Services } from '../../../../../../../libs/enums';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

export class DeleteAvatarCommand {
  constructor(public userId: number) {}
}

@CommandHandler(DeleteAvatarCommand)
export class DeleteAvatarUseCase
  implements ICommandHandler<DeleteAvatarCommand>
{
  constructor(
    @Inject(Services.FileService) private client: ClientProxy,
    private avatarRepository: AvatarRepository,
  ) {}

  async execute(command: DeleteAvatarCommand): Promise<ResultDTO<null>> {
    const deleteAvatarResult = await this.avatarRepository.deleteAvatar(
      +command.userId,
    );
    if (deleteAvatarResult.hasError())
      return deleteAvatarResult as ResultDTO<null>;

    try {
      await lastValueFrom(
        this.client.send(
          { cmd: 'delete_avatar' },
          { fileId: deleteAvatarResult.payload.fileId },
        ),
      );

      return new ResultDTO(InternalCode.Success);
    } catch (e) {
      return new ResultDTO(InternalCode.Internal_Server);
    }
  }
}
