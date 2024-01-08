import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ApproachType } from '../../../../../../libs/enums';
import { JwtAccessAuthGuard } from '../../auth/guards/jwt-access-auth.guard';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { SaveAvatarCommand } from '../application/use-cases/save-avatar.use-case';
import { ExceptionAndResponseHelper } from '../../../../../../libs/core/exceptionAndResponse';
import { AvatarQueryRepository } from '../infrastructure/avatar-query.repository';
import { DeleteAvatarCommand } from '../application/use-cases/delete-avatar.use-case';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Avatar')
@Controller('avatar')
export class AvatarController extends ExceptionAndResponseHelper {
  constructor(
    private commandBus: CommandBus,
    private avatarRepository: AvatarQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @ApiOperation({ summary: 'Get avatar' })
  @ApiBearerAuth()
  @Get()
  @UseGuards(JwtAccessAuthGuard)
  async getAvatar(
    @CurrentUserId() userId: number,
  ): Promise<{ avatarUrl: string }> {
    const avatarResult = await this.avatarRepository.findAvatar(userId);

    return this.sendExceptionOrResponse(avatarResult);
  }

  @ApiOperation({ summary: 'Upload avatar' })
  @ApiNoContentResponse({
    description: 'Img is accepted.',
  })
  @ApiBearerAuth()
  @Put('upload')
  @UseGuards(JwtAccessAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar Img',
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAvatar(
    @CurrentUserId() userId: number,
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<void> {
    const saveResult = await this.commandBus.execute(
      new SaveAvatarCommand(file, userId),
    );

    return this.sendExceptionOrResponse(saveResult);
  }

  @ApiOperation({ summary: 'Delete avatar' })
  @ApiBearerAuth()
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuard)
  async deleteAvatar(@CurrentUserId() userId: number): Promise<void> {
    const deleteResult = await this.commandBus.execute(
      new DeleteAvatarCommand(userId),
    );

    return this.sendExceptionOrResponse(deleteResult);
  }
}
