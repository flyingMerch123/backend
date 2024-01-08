import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostModel } from '../api/models/create.post.model';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';
import { PostRepository } from '../infrastructure/post.repository';
import { ViewPostModel } from '../api/models/view.post.model';

export class CreatePostCommand {
  constructor(public userId: number, public inputModel: CreatePostModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private postRepository: PostRepository) {}

  async execute(command: CreatePostCommand): Promise<ResultDTO<ViewPostModel>> {
    const { userId, inputModel } = command;
    const data = {
      userId,
      description: inputModel.description,
    };

    const createPostResult = await this.postRepository.createPost(data);
    if (createPostResult.hasError()) {
      return new ResultDTO(InternalCode.Internal_Server);
    } else {
      return new ResultDTO(InternalCode.Success, createPostResult.payload);
    }
  }
}
