import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSettings } from '../../../../libs/core/app.settings';
import { FileServiceModule } from '../../../file-service/src/file-service.module';
import { getConfiguration } from '../../../file-service/config/configuration';
import { TcpOptions, Transport } from '@nestjs/microservices';
import { CleanDbService } from './clean.db.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { INestApplication, INestMicroservice } from '@nestjs/common';

let app: INestApplication;
let fileApp: INestMicroservice;
let server: INestApplication;

export const beforeAll = async () => {
  // подключение основного приложеиня
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  appSettings(app, AppModule);
  await app.init();
  server = app.getHttpServer();

  // подключение файлового микросервиса
  const fileModuleFixture: TestingModule = await Test.createTestingModule({
    imports: [FileServiceModule],
  }).compile();

  const config = getConfiguration();
  fileApp = fileModuleFixture.createNestMicroservice({
    transport: Transport.TCP,
    options: {
      host: config.services.file.host,
      port: +config.services.file.port,
    },
  } as TcpOptions);
  await fileApp.init();

  // очистка БД
  const cleanDb = new CleanDbService(new PrismaService());
  await cleanDb.deletePosts();
};
