import { PrismaService } from '../../../../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { ViewPostModel } from '../api/models/view.post.model';
import { InternalCode } from '../../../../../../libs/enums';
import { CreateDescriptionModel } from '../api/models/create.description.model';

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
        key: true,
      },
    });
    return new ResultDTO(InternalCode.Success, {
      id: post.id,
      description: post.description,
      createdAt: post.createdAt.toISOString(),
      imageUrl: post.key,
    });
  }

  async updatePost(
    id: string,
    inputModel: CreateDescriptionModel,
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
