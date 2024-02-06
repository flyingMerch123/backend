import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../infrastructure/post.repository';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { PostQueryRepository } from '../infrastructure/post.query.repository';
import { InternalCode } from '../../../../../../libs/enums';
import { CreateDescriptionModel } from '../api/models/create.description.model';

export class UpdatePostCommand {
  constructor(
    public userId: number,
    public postId: string,
    public inputModel: CreateDescriptionModel,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postRepository: PostRepository,
    private postQueryRepository: PostQueryRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<ResultDTO<null>> {
    const { userId, postId, inputModel } = command;
    const post = await this.postQueryRepository.getPost(postId);

    // если этого поста нет - 404
    if (!post || post.code === 0) return new ResultDTO(InternalCode.NotFound);

    // если этот пост не принадлежит ему - 403
    if (post.payload.userId !== userId)
      return new ResultDTO(InternalCode.Forbidden);

    // обновляем пост
    const updatePostResult = await this.postRepository.updatePost(
      postId,
      inputModel,
    );
    if (updatePostResult.hasError()) {
      return new ResultDTO(InternalCode.Internal_Server);
    } else {
      return new ResultDTO(InternalCode.Success);
    }
  }
}
