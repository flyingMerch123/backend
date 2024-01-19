import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../infrastructure/post.repository';
import { PostQueryRepository } from '../infrastructure/post.query.repository';
import { InternalCode, Services } from '../../../../../../libs/enums';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { lastValueFrom } from 'rxjs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export class DeletePostCommand {
  constructor(public userId: number, public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postRepository: PostRepository,
    private postQueryRepository: PostQueryRepository,
    @Inject(Services.FileService) private client: ClientProxy,
  ) {}

  async execute(command: DeletePostCommand): Promise<any> {
    const { userId, postId } = command;
    const post = await this.postQueryRepository.getPost(postId);
    console.log({ del_post_use_case: post.payload.fileId });

    // если этого поста нет - 404
    if (!post) return new ResultDTO(InternalCode.NotFound);

    // если этот пост не принадлежит ему - 403
    if (post.payload.userId !== userId)
      return new ResultDTO(InternalCode.Forbidden);

    // удаляем сам пост и ссылки на картинки картинки из postgres
    const deletePostResult = await this.postRepository.deletePost(postId);
    if (deletePostResult.hasError()) return deletePostResult as ResultDTO<null>;

    try {
      // удаляем информацию о картинках из s3 и mongo
      await lastValueFrom(
        this.client.send(
          { cmd: 'delete_post_images' },
          { fileId: post.payload.fileId },
        ),
      );

      return new ResultDTO(InternalCode.Success);
    } catch (e) {
      return new ResultDTO(InternalCode.Internal_Server);
    }
  }
}
