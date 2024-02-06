import { ResultDTO } from '../dtos/resultDTO';
import { ApproachType, InternalCode } from '../enums';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export class ExceptionAndResponseHelper {
  private readonly typeExceptionMethod: ApproachType;

  constructor(typeExceptionMethod: ApproachType) {
    if (!(typeExceptionMethod in this)) throw new Error();

    this.typeExceptionMethod = typeExceptionMethod;
  }

  sendExceptionOrResponse(dto: ResultDTO<any>) {
    if (dto.hasError()) {
      const ExceptionClass = this[this.typeExceptionMethod](
        this.typeExceptionMethod === ApproachType.tcp ? undefined : dto.code,
      );
      throw new ExceptionClass(
        this.typeExceptionMethod === ApproachType.tcp ? dto.code : undefined,
      );
    }
    return dto.payload;
  }

  [ApproachType.http](code: InternalCode) {
    switch (code) {
      case InternalCode.NotFound:
        return NotFoundException;
      case InternalCode.Internal_Server:
        return InternalServerErrorException;
      case InternalCode.Unauthorized:
        return UnauthorizedException;
      case InternalCode.Forbidden:
        return ForbiddenException;
    }
  }

  [ApproachType.tcp]() {
    return RpcException;
  }
}
