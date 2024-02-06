import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, PrismaPromise } from '@prisma/client';

export class CleanDbService {
  constructor(private prisma: PrismaService) {}

  async deleteUsers(): Promise<PrismaPromise<Prisma.BatchPayload>> {
    return this.prisma.user.deleteMany();
  }
  async deleteProfiles(): Promise<PrismaPromise<Prisma.BatchPayload>> {
    return this.prisma.profile.deleteMany();
  }
  async deleteAvatars(): Promise<PrismaPromise<Prisma.BatchPayload>> {
    return this.prisma.avatar.deleteMany();
  }
  async deletePosts(): Promise<PrismaPromise<Prisma.BatchPayload>> {
    return this.prisma.post.deleteMany();
  }
}
