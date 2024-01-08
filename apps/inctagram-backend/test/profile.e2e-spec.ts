import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { appSettings } from '../../../libs/core/app.settings';

describe('ProfileController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app, AppModule);
    await app.init();
    server = app.getHttpServer();
    // await CleanDbService.cleanDb();
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

    // console.log({ t_11: updateFirstUserProfile.body.errorsMessages });
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
  it('13 - PUT:avatar - 204 - create avatar', async () => {
    const { accessToken1 } = expect.getState();

    const createAvatar = await request(server)
      .put('/api/v1/avatar')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        file: {},
      });

    console.log({ t_13: createAvatar.body.errorsMessages });
    expect(createAvatar).toBeDefined();
    expect(createAvatar.status).toEqual(HttpStatus.OK);
    expect(createAvatar.body).toEqual({});
  });

  // тесты на публияный просмотр профиля
});
