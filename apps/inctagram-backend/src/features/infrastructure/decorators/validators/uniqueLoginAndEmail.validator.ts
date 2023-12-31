import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

@Injectable()
@ValidatorConstraint({ async: true })
export class UniqueLoginAndEmailValidator
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}

  async validate(cred: string): Promise<boolean> {
    try {
      const userResult = await this.usersRepository.findByCredentials(cred);

      return userResult.hasError();
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const property = args.property[0].toUpperCase() + args.property.slice(1);
    return `${property} already exist`;
  }
}

export function IsUniqueLoginWithEmail(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsUniqueLoginWithEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UniqueLoginAndEmailValidator,
    });
  };
}
