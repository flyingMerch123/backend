import { NestFactory } from '@nestjs/core';
import { FileServiceModule } from './file-service.module';
import {
  MicroserviceOptions,
  RpcException,
  TcpOptions,
  Transport,
} from '@nestjs/microservices';
import { getConfiguration } from '../config/configuration';
import { ValidationPipe } from '@nestjs/common';
import { RpcExceptionFilter } from '../../../libs/filters/rpc.exception.filter';

async function bootstrap() {
  const config = getConfiguration();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FileServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: config.services.file.host,
        port: +config.services.file.port,
      },
    } as TcpOptions,
  );

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
        throw new RpcException(customErrors);
      },
    }),
  );
  app.useGlobalFilters(new RpcExceptionFilter());

  await app.listen();
}

bootstrap();
