import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { ViewUserModel } from '../api/models/output/ViewUserModel';
import { User } from '@prisma/client';
import { InternalCode } from '../../../../../../libs/enums';

@Injectable()
export class UsersQueryRepository {
  constructor(private prisma: PrismaService) {}

  async findUser(userId: number): Promise<ResultDTO<ViewUserModel>> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, this._mapDbToView(user));
  }

  async getUsersCount(): Promise<ResultDTO<number>> {
    const usersCount = await this.prisma.user.count();

    return new ResultDTO(InternalCode.Success, usersCount);
  }

  _mapDbToView(user: User): ViewUserModel {
    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }
}
