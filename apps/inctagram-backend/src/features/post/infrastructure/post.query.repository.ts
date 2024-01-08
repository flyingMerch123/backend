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
    const viewPosts = posts.map((p: Post) => this._mapDbToView(p));

    const paginationPosts: PaginationViewModel<ViewPostModel> = {
      pagesCount: query.pagesCount(postsCount),
      currentPage: query.currentPage,
      pageSize: query.pageSize,
      itemsCount: query.itemsCount(postsCount),
      items: viewPosts,
    };

    return new ResultDTO(InternalCode.Success, paginationPosts);
  }

  _mapDbToView(post: Post): ViewPostModel {
    return {
      id: post.id,
      description: post.description,
      createdAt: post.createdAt.toISOString(),
    };
  }
}
