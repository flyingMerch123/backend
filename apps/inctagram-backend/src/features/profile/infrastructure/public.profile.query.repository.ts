import { PrismaService } from '../../../../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';
import { Profile } from '@prisma/client';
import { PublicViewProfileModel } from '../api/models/public.view.profile.model';
import { PostQueryRepository } from '../../post/infrastructure/post.query.repository';
import { DefaultPaginationInput } from '../../post/api/pagination/pagination.input.model';
import { ViewPostModel } from '../../post/api/models/view.post.model';
import { PaginationViewModel } from '../../post/api/pagination/pagination.view.model';

@Injectable()
export class PublicProfileQueryRepository {
  constructor(
    private prisma: PrismaService,
    private postQueryRepository: PostQueryRepository,
  ) {}

  async getPublicProfile(
    userName: string,
    query: DefaultPaginationInput,
  ): Promise<ResultDTO<PublicViewProfileModel>> {
    const profile = await this.prisma.profile.findFirst({
      where: { userName: userName },
    });
    if (!profile) return new ResultDTO(InternalCode.NotFound);

    query = new DefaultPaginationInput();
    const posts = await this.postQueryRepository.getPosts(
      profile.userId,
      query,
    );

    return new ResultDTO(
      InternalCode.Success,
      this._mapDbToPublicView(profile, posts),
    );
  }

  _mapDbToPublicView(
    profile: Profile,
    posts: ResultDTO<PaginationViewModel<ViewPostModel>>,
  ): PublicViewProfileModel {
    return {
      userName: profile.userName,
      following: 0,
      followers: 0,
      postsCount: posts.payload.itemsCount,
      aboutMe: profile.aboutMe,
      posts: posts.payload,
    };
  }
}
