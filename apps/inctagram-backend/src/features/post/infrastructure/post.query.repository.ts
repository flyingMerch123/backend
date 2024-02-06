import { PrismaService } from '../../../../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';
import { ViewPostModel } from '../api/models/view.post.model';
import { Post } from '@prisma/client';
import { DefaultPaginationInput } from '../api/pagination/pagination.input.model';
import { PaginationViewModel } from '../api/pagination/pagination.view.model';

@Injectable()
export class PostQueryRepository {
  constructor(private prisma: PrismaService) {}

  async getPost(id: string): Promise<ResultDTO<Post>> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });
    if (!post) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, post);
  }

  async getPosts(
    userId: number,
    query: DefaultPaginationInput,
  ): Promise<ResultDTO<PaginationViewModel<ViewPostModel>>> {
    query = new DefaultPaginationInput();

    const posts = await this.prisma.post.findMany({
      include: {
        image: {
          select: { key: true },
          orderBy: { index: 'desc' },
        },
      },
      skip: query.skip(),
      take: query.pageSize,
      where: { userId },
      orderBy: {
        [query.sortBy]: query.sortDirection,
      },
    });
    if (!posts) return new ResultDTO(InternalCode.NotFound);

    const postsCount = await this.prisma.post.aggregate({
      _count: {
        userId: true,
      },
      where: { userId: userId },
    });

    // todo - map внутри map?
    const viewPosts = posts.map((p) => {
      const key = p.image.map((i) => i.key);
      return this._mapDbToView(p, key);
    });

    const paginationPosts: PaginationViewModel<ViewPostModel> = {
      pagesCount: query.pagesCount(postsCount),
      currentPage: query.currentPage,
      pageSize: query.pageSize,
      itemsCount: query.itemsCount(postsCount),
      items: viewPosts,
    };

    return new ResultDTO(InternalCode.Success, paginationPosts);
  }

  async getFilesId(postId: string): Promise<ResultDTO<string[]>> {
    const postImages = await this.prisma.postImage.findMany({
      where: { postId },
      select: { fileId: true },
    });
    if (!postImages) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(
      InternalCode.Success,
      postImages.map((fId) => fId.fileId),
    );
  }

  _mapDbToView(post: Post, imageUrl: string[]): ViewPostModel {
    return {
      id: post.id,
      description: post.description,
      createdAt: post.createdAt.toISOString(),
      imageUrl,
    };
  }
}
