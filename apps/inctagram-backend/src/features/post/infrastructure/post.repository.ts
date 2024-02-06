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
    postData: Prisma.PostUncheckedCreateInput,
    imagesData: Prisma.PostImageUncheckedCreateInput[],
  ): Promise<ResultDTO<ViewPostModel>> {
    const post = await this.prisma.post.create({
      data: { ...postData },
      select: {
        id: true,
        description: true,
        createdAt: true,
      },
    });

    let index = 0;
    // создавать записи в бд в цикле

    const postImages = await Promise.all(
      imagesData.map(async (imageData) => {
        index++;
        return this.prisma.postImage.create({
          data: { ...imageData, index },
          select: { key: true, index: true },
        });
      }),
    );

    return new ResultDTO(InternalCode.Success, {
      id: post.id,
      description: post.description,
      createdAt: post.createdAt.toISOString(),
      imageUrl: postImages
        .sort((a, b) => b.index - a.index)
        .map((img) => img.key),
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
