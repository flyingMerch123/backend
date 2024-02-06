import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { InternalCode } from '../../../../../../libs/enums';
import { FILE_STORAGE_URL } from '../../../../../../libs/constants';

@Injectable()
export class AvatarQueryRepository {
  constructor(private prisma: PrismaService) {}

  async findAvatar(userId: number): Promise<ResultDTO<{ avatarUrl: string }>> {
    const avatar = await this.prisma.avatar.findUnique({ where: { userId } });
    if (!avatar) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, {
      avatarUrl: FILE_STORAGE_URL + avatar.key,
    });
  }
}
