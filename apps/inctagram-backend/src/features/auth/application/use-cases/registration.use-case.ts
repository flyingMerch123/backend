import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { CreateUserCommand } from '../../../users/application/use-cases/create-user.use-case';
import { User } from '@prisma/client';
import { EmailEvents, InternalCode } from '../../../../../../../libs/enums';
import { DoOperationCommand } from '../../../email/application/use-cases/do-operation-use-case';
import { DeleteUserCommand } from '../../../users/application/use-cases/delete-user.use-case';
import { CreateProfileCommand } from '../../../profile/application/use.cases/create.profile.use.case';

export class RegistrationCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand>
{
  constructor(private commandBus: CommandBus) {}

  async execute(command: RegistrationCommand): Promise<ResultDTO<User>> {
    const userResult = await this.commandBus.execute(
      new CreateUserCommand(command.login, command.email, command.password),
    );
    if (userResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    // todo: создание сущности profile перенести в репозиторий при создании юзера
    const profileResult = await this.commandBus.execute(
      new CreateProfileCommand(userResult.payload.userId),
    );
    if (profileResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const sendEmailResult = await this.commandBus.execute(
      new DoOperationCommand(
        EmailEvents.Registration,
        command.email,
        userResult.payload.code,
      ),
    );

    if (sendEmailResult.hasError()) {
      await this.commandBus.execute(
        new DeleteUserCommand(userResult.payload.id),
      );
    }

    return sendEmailResult;
  }
}
