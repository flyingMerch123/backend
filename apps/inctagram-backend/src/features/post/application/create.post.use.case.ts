import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode, Services } from '../../../../../../libs/enums';
import { PostRepository } from '../infrastructure/post.repository';
import { ViewPostModel } from '../api/models/view.post.model';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';

export class CreatePostCommand {
  constructor(
    public userId: number,
    // public inputModel: CreateDescriptionModel,
    public files: Express.Multer.File[],
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postRepository: PostRepository,
    @Inject(Services.FileService) private client: ClientProxy,
  ) {}

  async execute(command: CreatePostCommand): Promise<ResultDTO<ViewPostModel>> {
    try {
      const { userId, files } = command;

      const postId = randomUUID();

      // сохраняем фотографии в s3 и получаем ссылки для поля imageUrl: string[]
      // todo - вынести в отдельный адаптер по работе с другим микросервисом
      const savePostImagesResult = await lastValueFrom(
        this.client.send(
          { cmd: 'save_post_images' },
          { files: files, userId: userId, postId: postId },
        ),
      );

      // создаем post и postImages
      const postData = {
        id: postId,
        userId,
        // description: inputModel.description,
      };
      const createPostResult = await this.postRepository.createPost(
        postData,
        savePostImagesResult,
      );

      return new ResultDTO(InternalCode.Success, createPostResult.payload);
    } catch (e) {
      return new ResultDTO(InternalCode.Internal_Server);
    }
  }
}
