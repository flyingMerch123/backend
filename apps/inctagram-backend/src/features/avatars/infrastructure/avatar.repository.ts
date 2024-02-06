import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { Avatar, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { InternalCode } from '../../../../../../libs/enums';

@Injectable()
export class AvatarRepository {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateAvatar(
    data: Prisma.AvatarUncheckedCreateInput,
  ): Promise<ResultDTO<null>> {
    const avatar = await this.prisma.avatar.upsert({
      where: { userId: data.userId },
      update: data,
      create: data,
    });
    if (!avatar) return new ResultDTO(InternalCode.Internal_Server);

    return new ResultDTO(InternalCode.Success);
  }

  async deleteAvatar(userId: number): Promise<ResultDTO<Avatar>> {
    try {
      const deletedAvatar = await this.prisma.avatar.delete({
        where: { userId },
      });
      return new ResultDTO(InternalCode.Success, deletedAvatar);
    } catch (e) {
      return new ResultDTO(InternalCode.NotFound);
    }
  }
}
