import { PrismaService } from '../../../../../../prisma/prisma.service';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';
import { ProfileQueryRepository } from '../../profile/infrastructure/profile.query.repository';
import { ViewProfileModel } from '../../profile/api/models/view.profile.model';
import { PublicViewPostModel } from '../api/models/public.view.post.model';
import { UsersQueryRepository } from '../../users/infrastructure/users-query.repository';
import { PublicViewMainPageModel } from '../api/models/public.view.main.page.model';
import { Injectable } from '@nestjs/common';
import { PostWithKeysFromDb } from '../api/models/post.with.keys.from.db';

@Injectable()
export class PublicPostQueryRepository {
  constructor(
    private prisma: PrismaService,
    private usersQueryRepository: UsersQueryRepository,
    private profileQueryRepository: ProfileQueryRepository,
  ) {}

  async getPublicPost(id: string): Promise<ResultDTO<PublicViewPostModel>> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        image: {
          select: { key: true },
          orderBy: { index: 'desc' },
        },
      },
    });
    if (!post) return new ResultDTO(InternalCode.NotFound);

    const profile = await this.profileQueryRepository.getProfile(post.userId);

    return new ResultDTO(
      InternalCode.Success,
      this._mapDbToPublicView(post, profile),
    );
  }

  async getLastPublicPosts(): Promise<ResultDTO<PublicViewMainPageModel>> {
    const posts = await this.prisma.post.findMany({
      include: {
        image: {
          select: { key: true },
          orderBy: { index: 'desc' },
        },
      },
      skip: 0,
      take: 4,
      orderBy: {
        createdAt: 'desc',
      },
    });
    if (!posts) return new ResultDTO(InternalCode.NotFound);

    const publicViewPosts: PublicViewPostModel[] = await Promise.all(
      posts.map(async (p) => {
        const key = p.image.map((i) => i.key);
        const names = await this.prisma.profile.findUnique({
          where: { userId: p.userId },
          select: { userName: true },
        });

        return {
          userName: names.userName,
          imageUrl: key,
          description: p.description,
          comments: [],
        };
      }),
    );

    const usersCount = await this.usersQueryRepository.getUsersCount();

    return new ResultDTO(InternalCode.Success, {
      usersCount: usersCount.payload,
      lastPosts: publicViewPosts,
    });
  }

  _mapDbToPublicView(
    post: PostWithKeysFromDb,
    profile: ResultDTO<ViewProfileModel>,
  ): PublicViewPostModel {
    return {
      userName: profile.payload.userName,
      imageUrl: post.image.map((i) => i.key),
      description: post.description,
      comments: [],
    };
  }
}
