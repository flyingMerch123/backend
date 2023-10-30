import { GlobalConfigService } from './config/config.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from '../../../libs/filters/exception.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(GlobalConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
      exceptionFactory: (errors) => {
        const customErrors = errors.map((err) => {
          return {
            field: err.property,
            messages: Object.values(err.constraints),
          };
        });
        throw new BadRequestException(customErrors);
      },
    }),
  );
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
  app.enableCors();
  app.use(cookieParser());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(configService.getPort('users'));
}
bootstrap();
