import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../../libs/enums';
import { Prisma } from '@prisma/client';
import { UsersQueryRepository } from '../../../users/infrastructure/users-query.repository';

export class CreateProfileCommand {
  constructor(public userId: number) {}
}

@CommandHandler(CreateProfileCommand)
export class CreateProfileUseCase
  implements ICommandHandler<CreateProfileCommand>
{
  constructor(
    private profileRepository: ProfileRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: CreateProfileCommand): Promise<ResultDTO<null>> {
    const user = await this.usersQueryRepository.findUser(command.userId);

    const data: Prisma.ProfileUncheckedCreateInput = {
      userId: user.payload.userId,
      userName: user.payload.login,
    };
    const profileResult = await this.profileRepository.createProfile(data);

    if (profileResult.hasError()) {
      return new ResultDTO(InternalCode.Internal_Server);
    } else {
      return new ResultDTO(InternalCode.Success);
    }
  }
}
