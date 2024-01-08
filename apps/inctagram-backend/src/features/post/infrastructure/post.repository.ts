import { PrismaService } from '../../../../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { ViewPostModel } from '../api/models/view.post.model';
import { InternalCode } from '../../../../../../libs/enums';
import { UpdatePostModel } from '../api/models/update.post.model';

@Injectable()
export class PostRepository {
  constructor(private prisma: PrismaService) {}

  async createPost(
    // data: Prisma.PostCreateInput,
    data: Prisma.PostUncheckedCreateInput,
  ): Promise<ResultDTO<ViewPostModel>> {
    const post = await this.prisma.post.create({
      data: { ...data },
      select: {
        id: true,
        description: true,
        createdAt: true,
      },
    });
    return new ResultDTO(InternalCode.Success, {
      id: post.id,
      description: post.description,
      createdAt: post.createdAt.toISOString(),
    });
  }

  async updatePost(
    id: string,
    inputModel: UpdatePostModel,
  ): Promise<ResultDTO<null>> {
    await this.prisma.post.update({
      where: { id },
      data: {
        description: inputModel.description,
      },
    });
    return new ResultDTO(InternalCode.Success);
  }

  async deletePost(id: string): Promise<ResultDTO<null>> {
    await this.prisma.post.delete({
      where: { id },
    });
    return new ResultDTO(InternalCode.Success);
  }
}
