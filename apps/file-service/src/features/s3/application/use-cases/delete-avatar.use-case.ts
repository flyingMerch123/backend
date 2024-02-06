import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Repository } from '../../infrastructure/s3.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../../libs/enums';
import { S3Adapter } from '../../adapter/s3.adapter';

export class DeleteAvatarCommand {
  constructor(public fileId: string) {}
}

@CommandHandler(DeleteAvatarCommand)
export class DeleteAvatarUseCase
  implements ICommandHandler<DeleteAvatarCommand>
{
  constructor(
    private s3Repository: S3Repository,
    private s3Adapter: S3Adapter,
  ) {}

  async execute(command: DeleteAvatarCommand): Promise<ResultDTO<null>> {
    const avatar = await this.s3Repository.findById(command.fileId);
    if (avatar.hasError()) return avatar as ResultDTO<null>;

    try {
      await avatar.payload.deleteOne();
    } catch (e) {
      return new ResultDTO(InternalCode.Internal_Server);
    }

    return this.s3Adapter.deleteAvatar(avatar.payload.key);
  }
}
