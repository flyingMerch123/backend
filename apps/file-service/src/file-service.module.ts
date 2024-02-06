import { Module } from '@nestjs/common';
import { S3Controller } from './features/s3/api/s3.controller';
import { S3Adapter } from './features/s3/adapter/s3.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from './features/s3/domain/s3.entity';
import { SaveAvatarUseCase } from './features/s3/application/use-cases/save-avatar.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { S3Repository } from './features/s3/infrastructure/s3.repository';
import { DeleteAvatarUseCase } from './features/s3/application/use-cases/delete-avatar.use-case';
import { configModule } from '../config/config.module';
import { GlobalConfigService } from '../config/config.service';
import { SavePostImagesUseCase } from './features/s3/application/use-cases/save-post-images.use-case';
import { DeletePostImagesUseCase } from './features/s3/application/use-cases/delete-post-images.use-case';

const useCases = [
  SaveAvatarUseCase,
  DeleteAvatarUseCase,
  SavePostImagesUseCase,
  DeletePostImagesUseCase,
];

@Module({
  imports: [
    configModule,
    CqrsModule,
    MongooseModule.forRoot(process.env.MONGODB_URL, { dbName: 'file_storage' }),
    MongooseModule.forFeature([
      {
        name: File.name,
        schema: FileSchema,
      },
    ]),
  ],
  controllers: [S3Controller],
  providers: [...useCases, GlobalConfigService, S3Adapter, S3Repository],
})
export class FileServiceModule {}
