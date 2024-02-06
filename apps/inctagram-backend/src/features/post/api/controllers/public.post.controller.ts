import { ExceptionAndResponseHelper } from '../../../../../../../libs/core/exceptionAndResponse';
import { ApproachType, InternalCode } from '../../../../../../../libs/enums';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { PublicViewPostModel } from '../models/public.view.post.model';
import { PublicViewMainPageModel } from '../models/public.view.main.page.model';
import { PublicPostQueryRepository } from '../../infrastructure/public.post.query.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';

@ApiTags('Public')
@Controller('public/posts')
export class PublicPostController extends ExceptionAndResponseHelper {
  constructor(private publicPostQueryRepository: PublicPostQueryRepository) {
    super(ApproachType.http);
  }

  @ApiOperation({
    summary: 'Get public posts',
    description:
      'This endpoint is used to viewing public posts on the main page',
  })
  @ApiOkResponse({ type: PublicViewMainPageModel })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getPublicPosts(): Promise<PublicViewMainPageModel> {
    const getPostsResult =
      await this.publicPostQueryRepository.getLastPublicPosts();

    return this.sendExceptionOrResponse(
      new ResultDTO(InternalCode.Success, getPostsResult.payload),
    );
  }

  @ApiOperation({
    summary: 'Get public post by id',
    description: 'This endpoint is used to viewing public post by the link',
  })
  @ApiOkResponse({ type: PublicViewPostModel })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPublicPost(
    @Param('id') postId: string,
  ): Promise<PublicViewPostModel> {
    const getPostResult = await this.publicPostQueryRepository.getPublicPost(
      postId,
    );

    return this.sendExceptionOrResponse(
      new ResultDTO(InternalCode.Success, getPostResult.payload),
    );
  }
}
