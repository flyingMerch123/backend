import { ExceptionAndResponseHelper } from '../../../../../../../libs/core/exceptionAndResponse';
import { ApproachType } from '../../../../../../../libs/enums';
import { CommandBus } from '@nestjs/cqrs';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUserId } from '../../../infrastructure/decorators/params/current-user-id.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAccessAuthGuard } from '../../../auth/guards/jwt-access-auth.guard';
import { CreatePostCommand } from '../../application/create.post.use.case';
import { CreateDescriptionModel } from '../models/create.description.model';
import { ViewPostModel } from '../models/view.post.model';
import { UpdatePostModel } from '../models/update.post.model';
import { PostQueryRepository } from '../../infrastructure/post.query.repository';
import { UpdatePostCommand } from '../../application/update.post.use.case';
import { DeletePostCommand } from '../../application/delete.post.use.case';
import { BAD_REQUEST_SCHEMA } from '../../../../../../../libs/swagger/schemas/bad-request.schema';
import { DefaultPaginationInput } from '../pagination/pagination.input.model';
import { PaginationViewModel } from '../pagination/pagination.view.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadPhotosModel } from '../models/upload.photos.model';

@ApiTags('Post')
@Controller('post')
@UseGuards(ThrottlerGuard, JwtAccessAuthGuard)
export class PostController extends ExceptionAndResponseHelper {
  constructor(
    private commandBus: CommandBus,
    private postQueryRepository: PostQueryRepository,
  ) {
    super(ApproachType.http);
  }

  //todo - эндпоинт должен быть универсальным для публичного и приватного доступа
  @ApiOperation({
    summary: 'Get my posts',
    description: 'This endpoint is used to getting my posts.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: PaginationViewModel<ViewPostModel[]> })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyPosts(
    @CurrentUserId() userId: number,
    @Query() query: DefaultPaginationInput,
  ): Promise<PaginationViewModel<ViewPostModel>> {
    const getPostsResult = await this.postQueryRepository.getPosts(
      userId,
      query,
    );

    return this.sendExceptionOrResponse(getPostsResult);
  }

  @ApiOperation({
    summary: 'Create post',
    description: 'This endpoint is used to create new post.',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ViewPostModel })
  @ApiBadRequestResponse({
    description: 'If the inputModel has incorrect values.',
    schema: BAD_REQUEST_SCHEMA,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fieldSize: 20 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadPhotosModel })
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @CurrentUserId() userId: number,
    @Body() inputModel: CreateDescriptionModel,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<ViewPostModel> {
    const createPostResult = await this.commandBus.execute(
      new CreatePostCommand(userId, inputModel, files),
    );

    return this.sendExceptionOrResponse(createPostResult);
  }

  @ApiOperation({
    summary: 'Update post',
    description: 'This endpoint is used to update exists post.',
  })
  @ApiBearerAuth()
  @ApiNoContentResponse({
    description: 'Input data is accepted. Post have updated',
  })
  @ApiBadRequestResponse({
    description: 'If the inputModel has incorrect values.',
    schema: BAD_REQUEST_SCHEMA,
  })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiForbiddenResponse({ description: 'It is not your post' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @CurrentUserId() userId: number,
    @Param('id') postId: string,
    @Body() inputModel: UpdatePostModel,
  ): Promise<void> {
    const updatePostResult = await this.commandBus.execute(
      new UpdatePostCommand(userId, postId, inputModel),
    );

    return this.sendExceptionOrResponse(updatePostResult);
  }

  @ApiOperation({
    summary: 'Delete post',
    description: 'This endpoint is used to delete exists post.',
  })
  @ApiBearerAuth()
  @ApiNoContentResponse({
    description: 'Post have deleted',
  })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiForbiddenResponse({ description: 'It is not your post' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @CurrentUserId() userId: number,
    @Param('id') postId: string,
  ): Promise<void> {
    const deletePostResult = await this.commandBus.execute(
      new DeletePostCommand(userId, postId),
    );

    return this.sendExceptionOrResponse(deletePostResult);
  }
}