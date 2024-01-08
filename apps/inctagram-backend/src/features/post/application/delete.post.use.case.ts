import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../infrastructure/post.repository';
import { PostQueryRepository } from '../infrastructure/post.query.repository';
import { InternalCode } from '../../../../../../libs/enums';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';

export class DeletePostCommand {
  constructor(public userId: number, public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postRepository: PostRepository,
    private postQueryRepository: PostQueryRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<any> {
    const { userId, postId } = command;
    const post = await this.postQueryRepository.getPost(postId);

    // если этого поста нет - 404
    if (!post) return new ResultDTO(InternalCode.NotFound);

    // если этот пост не принадлежит ему - 403
    if (post.payload.userId !== userId)
      return new ResultDTO(InternalCode.Forbidden);

    const deletePostResult = await this.postRepository.deletePost(postId);
    if (deletePostResult.hasError()) {
      return new ResultDTO(InternalCode.Internal_Server);
    } else {
      return new ResultDTO(InternalCode.Success);
    }
  }
}
