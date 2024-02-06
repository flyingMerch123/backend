import {
  HttpStatus,
  INestApplication,
  INestMicroservice,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSettings } from '../../../libs/core/app.settings';
import * as request from 'supertest';
import { FileServiceModule } from '../../file-service/src/file-service.module';
import { getConfiguration } from '../../file-service/config/configuration';
import { TcpOptions, Transport } from '@nestjs/microservices';
import { PrismaService } from '../../../prisma/prisma.service';
import { CleanDbService } from './utils/clean.db.service';
import * as path from 'path';

// class UserService {
//   constructor(repo) {}
//   method1() {}
//   method2() {}
// }
//
// class UserServuceMock extends UserService {
//   constructor(repo) {
//     super(repo);
//   }
//
//   method2() {
//     return File;
//   }
// }

describe('PostController (e2e)', () => {
  let app: INestApplication;
  let fileApp: INestMicroservice;
  let server: INestApplication;

  beforeAll(async () => {
    // подключение основного приложеиня
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // .overrideProvider(FileServiceAdapter) - todo - сделать мок для файлового микросервиса, не тестировать микросервисы в связке
      // .useClass()
      .compile();

    app = moduleFixture.createNestApplication();
    appSettings(app, AppModule);
    await app.init();
    server = app.getHttpServer();

    // todo - разобраться, почему эти тесты требуют предварительного запуска файлового микросервиса вручную
    // возможно прописать запуск тестов в package.json, чтобы они запускались при деплое

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
    // expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);

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

  it('4 - GET:post - 200 - 1st user get himself posts', async () => {
    const { accessToken1 } = expect.getState();

    const getPostsResponse = await request(server)
      .get('/api/v1/post')
      .auth(accessToken1, { type: 'bearer' });

    expect(getPostsResponse).toBeDefined();
    expect(getPostsResponse.status).toEqual(HttpStatus.OK);
    expect(getPostsResponse.body).toEqual({
      pagesCount: 0,
      currentPage: 1,
      pageSize: 8,
      itemsCount: 0,
      items: [],
    });
  });

  it('5 - POST:post - 400 - 1st user try create post without photo', async () => {
    const { accessToken1 } = expect.getState();

    const correctPostInput = {
      description: `correct_description`,
    };

    const createFirstPostsResponse = await request(server)
      .post('/api/v1/post')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        description: correctPostInput.description,
      });

    expect(createFirstPostsResponse).toBeDefined();
    expect(createFirstPostsResponse.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(createFirstPostsResponse.body).toEqual({
      errorsMessages: [
        {
          field: 'files',
          message: 'Count files should be more or equal 1 and less or equal 10',
        },
      ],
    });

    expect.setState({ correctPostInput });
  });
  // it('6 - POST:post - 400 - 1st user try create description more 500 symbols', async () => {
  //   const { accessToken1 } = expect.getState();
  //
  //   const incorrectPostInput = {
  //     description: `description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
  //     description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
  //     description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
  //     description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
  //     description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
  //     description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
  //     description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
  //     description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
  //     description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
  //     description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=!`,
  //   };
  //   const filePath = path.resolve(__dirname, 'files', 'correct_img.jpg');
  //
  //   const createFirstPostsResponse = await request(server)
  //     .post('/api/v1/post')
  //     .auth(accessToken1, { type: 'bearer' })
  //     .field('description', incorrectPostInput.description)
  //     .attach('files', filePath);
  //
  //   expect(createFirstPostsResponse).toBeDefined();
  //   expect(createFirstPostsResponse.status).toEqual(HttpStatus.BAD_REQUEST);
  //   expect(createFirstPostsResponse.body).toEqual({
  //     errorsMessages: [
  //       {
  //         field: 'description',
  //         message:
  //           'description must be shorter than or equal to 500 characters',
  //       },
  //     ],
  //   });
  //
  //   expect.setState({ incorrectPostInput });
  // });

  it('7 - POST:post - 200 - 1st user create 2 posts', async () => {
    const { accessToken1 } = expect.getState();

    // const firstPostInput = {
    //   description: 'first_correct_description',
    // };
    // const secondPostInput = {
    //   description: 'second_correct_description',
    // };

    const filePath = path.resolve(__dirname, 'files', 'correct_img.jpg');

    const createFirstPostsResponse = await request(server)
      .post('/api/v1/post')
      .auth(accessToken1, { type: 'bearer' })
      // .field('description', firstPostInput.description)
      .attach('files', filePath)
      .attach('files', filePath);

    expect(createFirstPostsResponse).toBeDefined();
    expect(createFirstPostsResponse.status).toEqual(HttpStatus.CREATED);
    expect(createFirstPostsResponse.body).toEqual({
      id: expect.any(String),
      description: null,
      createdAt: expect.any(String),
      imageUrl: expect.any(Array),
    });

    const createSecondPostsResponse = await request(server)
      .post('/api/v1/post')
      .auth(accessToken1, { type: 'bearer' })
      // .field('description', secondPostInput.description)
      .attach('files', filePath)
      .attach('files', filePath)
      .attach('files', filePath);

    expect(createSecondPostsResponse).toBeDefined();
    expect(createSecondPostsResponse.status).toEqual(HttpStatus.CREATED);
    expect(createSecondPostsResponse.body).toEqual({
      id: expect.any(String),
      description: null,
      createdAt: expect.any(String),
      imageUrl: expect.any(Array),
    });

    expect.setState({
      firstPost: createFirstPostsResponse.body,
      secondPost: createSecondPostsResponse.body,
    });
  });
  it('8 - GET:post - 200 - 1st user get himself posts', async () => {
    const { accessToken1, firstPost, secondPost } = expect.getState();

    const getPostsResponse = await request(server)
      .get('/api/v1/post')
      .auth(accessToken1, { type: 'bearer' });

    expect(getPostsResponse).toBeDefined();
    expect(getPostsResponse.status).toEqual(HttpStatus.OK);
    expect(getPostsResponse.body).toEqual({
      pagesCount: 1,
      currentPage: 1,
      pageSize: 8,
      itemsCount: 2,
      items: [secondPost, firstPost],
    });
  });

  it('9 - PUT:post - 400 - 1st user try update description more 500 symbols', async () => {
    const { accessToken1, firstPost } = expect.getState();

    const incorrectPostInput = {
      description: `description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
          description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
          description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
          description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
          description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
          description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
          description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
          description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
          description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=
          description 501 symbol =-=-=-=-=-=-=-=-=-=-=-=-=-=!`,
    };

    const updateFirstPostsResponse = await request(server)
      .put(`/api/v1/post/${firstPost.id}`)
      .auth(accessToken1, { type: 'bearer' })
      .send({
        description: incorrectPostInput.description,
      });

    expect(updateFirstPostsResponse).toBeDefined();
    expect(updateFirstPostsResponse.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(updateFirstPostsResponse.body).toEqual({
      errorsMessages: [
        {
          field: 'description',
          message:
            'description must be shorter than or equal to 500 characters',
        },
      ],
    });
  });

  it('10 - PUT:post - 200 - 1st user update 2 posts', async () => {
    const { accessToken1, firstPost, secondPost } = expect.getState();
    const updatedFirstPostInput = {
      description: 'updated_first_correct_description',
    };
    const updatedSecondPostInput = {
      description: 'updated_second_correct_description',
    };

    const updateFirstPostsResponse = await request(server)
      .put(`/api/v1/post/${firstPost.id}`)
      .auth(accessToken1, { type: 'bearer' })
      .send({
        description: updatedFirstPostInput.description,
      });

    expect(updateFirstPostsResponse).toBeDefined();
    expect(updateFirstPostsResponse.status).toEqual(HttpStatus.NO_CONTENT);
    expect(updateFirstPostsResponse.body).toEqual({});

    const updateSecondPostsResponse = await request(server)
      .put(`/api/v1/post/${secondPost.id}`)
      .auth(accessToken1, { type: 'bearer' })
      .send({
        description: updatedSecondPostInput.description,
      });

    expect(updateSecondPostsResponse).toBeDefined();
    expect(updateSecondPostsResponse.status).toEqual(HttpStatus.NO_CONTENT);
    expect(updateSecondPostsResponse.body).toEqual({});

    expect.setState({
      updatedFirstPostInput,
      updatedSecondPostInput,
    });
  });
  it('11 - GET:post - 200 - 1st user get himself posts', async () => {
    const {
      accessToken1,
      firstPost,
      secondPost,
      updatedFirstPostInput,
      updatedSecondPostInput,
    } = expect.getState();

    const getPostsResponse = await request(server)
      .get('/api/v1/post')
      .auth(accessToken1, { type: 'bearer' });

    expect(getPostsResponse).toBeDefined();
    expect(getPostsResponse.status).toEqual(HttpStatus.OK);
    expect(getPostsResponse.body).toEqual({
      pagesCount: 1,
      currentPage: 1,
      pageSize: 8,
      itemsCount: 2,
      items: [
        { ...secondPost, description: updatedSecondPostInput.description },
        { ...firstPost, description: updatedFirstPostInput.description },
      ],
    });
  });

  it('12 - DELETE:post - 400 - 1st user try delete not exist post', async () => {
    const { accessToken1 } = expect.getState();

    const deleteFirstPostResponse = await request(server)
      .delete(`/api/v1/post/b9c4f430-b21a-4a19-81bc-81d3a8a166e5`)
      .auth(accessToken1, { type: 'bearer' });

    expect(deleteFirstPostResponse).toBeDefined();
    expect(deleteFirstPostResponse.status).toEqual(HttpStatus.NOT_FOUND);
    expect(deleteFirstPostResponse.body).toEqual({});
  });
  it('13 - DELETE:post - 200 - 1st user delete 2 posts', async () => {
    const { accessToken1, firstPost, secondPost } = expect.getState();

    const deleteFirstPostResponse = await request(server)
      .delete(`/api/v1/post/${firstPost.id}`)
      .auth(accessToken1, { type: 'bearer' });

    expect(deleteFirstPostResponse).toBeDefined();
    expect(deleteFirstPostResponse.status).toEqual(HttpStatus.NO_CONTENT);
    expect(deleteFirstPostResponse.body).toEqual({});

    const deleteSecondPostResponse = await request(server)
      .delete(`/api/v1/post/${secondPost.id}`)
      .auth(accessToken1, { type: 'bearer' });

    expect(deleteSecondPostResponse).toBeDefined();
    expect(deleteSecondPostResponse.status).toEqual(HttpStatus.NO_CONTENT);
    expect(deleteSecondPostResponse.body).toEqual({});
  });

  afterAll(async () => {
    await app.close();
  });
});
