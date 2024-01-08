import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { PublicViewProfileModel } from '../models/public.view.profile.model';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { ApproachType, InternalCode } from '../../../../../../../libs/enums';
import { ExceptionAndResponseHelper } from '../../../../../../../libs/core/exceptionAndResponse';
import { PublicProfileQueryRepository } from '../../infrastructure/public.profile.query.repository';
import { DefaultPaginationInput } from '../../../post/api/pagination/pagination.input.model';

@ApiTags('Public')
@Controller('public/profile')
export class PublicProfileController extends ExceptionAndResponseHelper {
  constructor(private publicQueryRepository: PublicProfileQueryRepository) {
    super(ApproachType.http);
  }

  @ApiOperation({
    summary: 'Get public profile',
    description: 'This endpoint is used to getting public profile by link',
  })
  @ApiOkResponse({ type: PublicViewProfileModel })
  @ApiNotFoundResponse()
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @Get(':userName')
  @HttpCode(HttpStatus.OK)
  async getPublicProfile(
    @Param('userName') userName: string,
    @Query() query: DefaultPaginationInput,
  ): Promise<PublicViewProfileModel> {
    //todo - должен ли тут быть аватар? по ТЗ непонятно
    const getProfileResult = await this.publicQueryRepository.getPublicProfile(
      userName,
      query,
    );

    return this.sendExceptionOrResponse(
      new ResultDTO(InternalCode.Success, getProfileResult.payload),
    );
  }
}
