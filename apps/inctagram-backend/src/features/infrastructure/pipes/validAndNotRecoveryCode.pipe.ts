import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@Injectable()
export class IsValidAndNotConfirmedRecoveryCodePipe implements PipeTransform {
  constructor(private usersRepository: UsersRepository) {}

  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    try {
      const confirmDataResult = await this.usersRepository.findRecoveryData(
        value,
      );
      if (confirmDataResult.hasError()) throw new BadRequestException();

      if (confirmDataResult.payload?.isConfirmed)
        throw new BadRequestException();

      return value;
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
