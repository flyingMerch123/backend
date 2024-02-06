import {
  HttpStatus,
  INestApplication,
  INestMicroservice,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { appSettings } from '../../../libs/core/app.settings';
import { FileServiceModule } from '../../file-service/src/file-service.module';
import { TcpOptions, Transport } from '@nestjs/microservices';
import { getConfiguration } from '../../file-service/config/configuration';
import { PrismaService } from '../../../prisma/prisma.service';
import { CleanDbService } from './utils/clean.db.service';
import * as path from 'path';

describe('ProfileController (e2e)', () => {
  let app: INestApplication;
  let fileApp: INestMicroservice;
  let server: any;

  beforeAll(async () => {
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
    await cleanDb.deleteAvatars();
    // await cleanDb.deleteProfiles();
  });

  it('1 - POST:auth/registration - 204 - register 1st & 2nd users', async () => {
    const firstUser = {
      login: `userName3`,
      email: `email3@gmail.com`,
      password: 'Qwertyuiop1!3',
    };
    const secondUser = {
      login: `userName2`,
      email: `email2@gmail.com`,
      password: 'Qwerty2!',
    };

    // const firstUser = {
    //   login: `login${randomUUID().slice(0, 6)}`,
    //   email: `${randomUUID().slice(0, 6)}@gmail.com`,
    //   password: 'q',
    // };

    // const registerFirstUserResponse = await request(server)
    //   .post('/api/v1/auth/registration')
    //   .send({
    //     login: firstUser.login,
    //     email: firstUser.email,
    //     password: firstUser.password,
    //   });
    // expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);
    //
    // const registerSecondUserResponse = await request(server)
    //   .post('/api/v1/auth/registration')
    //   .send({
    //     login: secondUser.login,
    //     email: secondUser.email,
    //     password: secondUser.password,
    //   });
    // expect(registerSecondUserResponse.status).toEqual(HttpStatus.NO_CONTENT);

    expect.setState({ firstUser, secondUser });
  });
  // it('2 - POST:auth/registration-confirmation - 204 - confirm email', async () => {
  //   const registerFirstUserResponse = await request(server)
  //     .post('/auth/registration-confirmation')
  //     .send({ code: '' });
  //   // откуда забирать confirmationCode?
  //
  //   expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);
  // });
  it('3 - POST:auth/login - 200 - login 1st & 2nd users', async () => {
    const { firstUser, secondUser } = expect.getState();

    const loginFirstUserResponse = await request(server)
      .post('/api/v1/auth/login')
      .set('user-agent', 'device-1')
      .send({
        email: firstUser.email,
        password: firstUser.password,
      });

    expect(loginFirstUserResponse.status).toEqual(HttpStatus.OK);
    expect(loginFirstUserResponse.body).toEqual({
      accessToken: expect.any(String),
    });
    const accessToken1 = loginFirstUserResponse.body.accessToken;

    const loginSecondUserResponse = await request(server)
      .post('/api/v1/auth/login')
      .set('user-agent', 'device-2')
      .send({
        email: secondUser.email,
        password: secondUser.password,
      });

    expect(loginSecondUserResponse.status).toEqual(HttpStatus.OK);
    expect(loginSecondUserResponse.body).toEqual({
      accessToken: expect.any(String),
    });
    const accessToken2 = loginSecondUserResponse.body.accessToken;

    expect.setState({ accessToken1, accessToken2 });
  });
  // it('4 - GET:profile - 200 - getting raw profile', async () => {
  //   const { firstUser, accessToken } = expect.getState();
  //
  //   const registerFirstUserResponse = await request(server)
  //     .get('/api/v1/profile')
  //     .auth(accessToken, { type: 'bearer' });
  //
  //   expect(registerFirstUserResponse.status).toEqual(HttpStatus.OK);
  //   expect(registerFirstUserResponse.body).toEqual({
  //     userName: firstUser.login,
  //     firstName: null,
  //     lastName: null,
  //     dateOfBirth: null,
  //     city: null,
  //     country: null,
  //     aboutMe: null,
  //   });
  // });

  // негативные тесты на валидацию данных
  it('5 - PUT:profile - 400 - try to update profile without firstName', async () => {
    const { firstUser, accessToken1 } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        userName: firstUser.login,
        lastName: 'correctLastName',
        // firstName: '123',
      });

    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.BAD_REQUEST);
  });
  it('6 - PUT:profile - 400 - try to update profile without lastName', async () => {
    const { firstUser, accessToken1 } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        userName: firstUser.login,
        // lastName: '123',
        firstName: 'correctFistName',
      });

    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.BAD_REQUEST);
  });
  it('7 - PUT:profile - 400 - try to update profile with incorrect format of dateOfBirth', async () => {
    const { firstUser, accessToken1 } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        userName: firstUser.login,
        lastName: 'correctLastName',
        firstName: 'correctFistName',
        dateOfBirth: 'invalid_type_of_data',
      });

    // console.log({ t_7: registerFirstUserResponse.body.errorsMessages });
    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(registerFirstUserResponse.body.errorsMessages[0].field).toEqual(
      'dateOfBirth',
    );
  });

  // позитивные тесты на текстовые поля
  it('8 - PUT:profile - 204 - update profile with correct data', async () => {
    const { firstUser, accessToken1 } = expect.getState();

    const correctUpdateFirstProfile = {
      lastName: 'firstCorrectLastName',
      firstName: 'firstCorrectFistName',
      dateOfBirth: new Date().toISOString(),
      city: 'firstCorrect_City',
      country: 'firstCorrect_Country',
      aboutMe: 'firstCorrect_About_me',
    };

    const registerFirstUserResponse = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        userName: firstUser.login,
        lastName: correctUpdateFirstProfile.lastName,
        firstName: correctUpdateFirstProfile.firstName,
        dateOfBirth: correctUpdateFirstProfile.dateOfBirth,
        city: correctUpdateFirstProfile.city,
        country: correctUpdateFirstProfile.country,
        aboutMe: correctUpdateFirstProfile.aboutMe,
      });

    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);

    expect.setState({ correctUpdateFirstProfile });
  });
  it('9 - PUT:profile - 204 - update profile with empty fields', async () => {
    const { firstUser, accessToken1, correctUpdateFirstProfile } =
      expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        userName: firstUser.login,
        firstName: correctUpdateFirstProfile.firstName,
        lastName: correctUpdateFirstProfile.lastName,
        // dateOfBirth: '',
        city: '',
        country: '',
        aboutMe: '',
      });

    // console.log({ t_9: registerFirstUserResponse.body.errorsMessages });
    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('10 - PUT:profile - 204 - update userName', async () => {
    const { accessToken1, correctUpdateFirstProfile } = expect.getState();

    const updateFirstUserProfile = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        userName: 'otherUserName',
        firstName: correctUpdateFirstProfile.firstName,
        lastName: correctUpdateFirstProfile.lastName,
        // dateOfBirth: '',
        city: '',
        country: '',
        aboutMe: '',
      });

    expect(updateFirstUserProfile).toBeDefined();
    expect(updateFirstUserProfile.status).toEqual(HttpStatus.NO_CONTENT);

    const getFirstUserProfile = await request(server)
      .get('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' });

    expect(getFirstUserProfile.status).toEqual(HttpStatus.OK);
    expect(getFirstUserProfile.body).toEqual({
      userName: 'otherUserName',
      firstName: correctUpdateFirstProfile.firstName,
      lastName: correctUpdateFirstProfile.lastName,
      dateOfBirth: expect.any(String),
      city: '',
      country: '',
      aboutMe: '',
      avatarUrl: null,
    });
  });

  // негативный тест на попытку обновить занятый кем-то userName
  it('11 - PUT:profile - 400 - 1st try update userName busy with 2nd user', async () => {
    const { accessToken1, secondUser, correctUpdateFirstProfile } =
      expect.getState();

    const updateFirstUserProfile = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        userName: secondUser.login,
        firstName: correctUpdateFirstProfile.firstName,
        lastName: correctUpdateFirstProfile.lastName,
        // dateOfBirth: '',
        city: '',
        country: '',
        aboutMe: '',
      });

    expect(updateFirstUserProfile).toBeDefined();
    expect(updateFirstUserProfile.status).toEqual(HttpStatus.BAD_REQUEST);

    const getFirstUserProfile = await request(server)
      .get('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' });
    expect(getFirstUserProfile.status).toEqual(HttpStatus.OK);
    expect(getFirstUserProfile.body).toEqual({
      userName: 'otherUserName',
      firstName: correctUpdateFirstProfile.firstName,
      lastName: correctUpdateFirstProfile.lastName,
      dateOfBirth: expect.any(String),
      city: '',
      country: '',
      aboutMe: '',
      avatarUrl: null,
    });
  });

  // тесты на работу с аватаром
  it('12 - GET:avatar - 404 - no avatar yet', async () => {
    const { accessToken1 } = expect.getState();

    const getAvatar = await request(server)
      .get('/api/v1/avatar')
      .auth(accessToken1, { type: 'bearer' });

    expect(getAvatar).toBeDefined();
    expect(getAvatar.status).toEqual(HttpStatus.NOT_FOUND);
    expect(getAvatar.body).toEqual({});
  });
  it('13 - PUT:avatar/upload - 204 - create avatar', async () => {
    const { accessToken1 } = expect.getState();

    const filePath = path.resolve(__dirname, 'files', 'correct_img.jpg');

    const createAvatar = await request(server)
      .put('/api/v1/avatar/upload')
      .auth(accessToken1, { type: 'bearer' })
      .attach('avatar', filePath);

    expect(createAvatar).toBeDefined();
    expect(createAvatar.status).toEqual(HttpStatus.NO_CONTENT);
    expect(createAvatar.body).toEqual({});

    const getAvatar = await request(server)
      .get('/api/v1/avatar')
      .auth(accessToken1, { type: 'bearer' });

    expect(getAvatar).toBeDefined();
    expect(getAvatar.status).toEqual(HttpStatus.OK);
    expect(getAvatar.body).toEqual({
      avatarUrl: expect.any(String),
    });
  });
  it('14 - DELETE:avatar - 204 - delete avatar', async () => {
    const { accessToken1 } = expect.getState();

    const deleteAvatar = await request(server)
      .delete('/api/v1/avatar')
      .auth(accessToken1, { type: 'bearer' });

    expect(deleteAvatar).toBeDefined();
    expect(deleteAvatar.status).toEqual(HttpStatus.NO_CONTENT);
    expect(deleteAvatar.body).toEqual({});

    const getAvatar = await request(server)
      .get('/api/v1/avatar')
      .auth(accessToken1, { type: 'bearer' });

    expect(getAvatar).toBeDefined();
    expect(getAvatar.status).toEqual(HttpStatus.NOT_FOUND);
    expect(getAvatar.body).toEqual({});
  });

  afterAll(async () => {
    await app.close();
  });
});
