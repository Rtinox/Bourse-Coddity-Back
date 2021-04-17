const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../../src/startup/app');
const {
  password: { hash },
} = require('../../src/common');
const {
  User: { Model: User },
  AuthToken: { Model: AuthToken },
} = require('../../src/models');

describe('POST /login', () => {
  let req;
  beforeAll(() => {
    req = () =>
      request(app)
        .post('/auth/login')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);
  });
  afterAll(async () => {
    await User.deleteMany({});
    await AuthToken.deleteMany({});
  });

  it('should return an 400 if pseudo and/or email and password is not provided', (done) => {
    return req()
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return an 400 if password is not provided', (done) => {
    return req()
      .send({ pseudo: 'Hello' })
      .expect(400)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return an 400 if pseudo or email is not provided', (done) => {
    return req()
      .send({ password: 'Hello' })
      .expect(400)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return an 400 if pseudo and email is provided', (done) => {
    return req()
      .send({ pseudo: 'Hello', email: 'hello@gmail.com', password: 'Hello' })
      .expect(400)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return an 400 if email is invalid', (done) => {
    return req()
      .send({ email: 'hello', password: 'Hello' })
      .expect(400)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return an 403 if user doesnt exists', (done) => {
    return req()
      .send({ pseudo: 'hello', password: 'Hello' })
      .expect(403)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return an 403 if password doesnt match', async (done) => {
    const user = {
      pseudo: 'hello',
      email: 'hello@gmail.com',
      password: await hash('HelloDifferent'),
    };

    await new User(user).save();

    return req()
      .send({ pseudo: 'hello', password: 'Hello' })
      .expect(403)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return an access_token & refresh_token', async (done) => {
    const user = {
      pseudo: 'hello',
      email: 'hello@gmail.com',
      password: await hash('HelloDifferent'),
    };

    await new User(user).save();

    return req()
      .send({ pseudo: 'hello', password: 'HelloDifferent' })
      .expect(200)
      .then(async (res) => {
        const { access_token, refresh_token } = res.body.data;
        expect(res.body.valid).toBe(true);
        expect(access_token).toBeDefined();
        expect(refresh_token).toBeDefined();

        await jwt.verify(
          access_token,
          process.env.CODDITY_JWT_TOKEN,
          (err, user_d) => {
            expect(err).toBeNull();
            expect(user_d).toBeDefined();
            expect(user_d.pseudo).toBe(user.pseudo);
            expect(user_d.email).toBe(user.email);
          }
        );

        await jwt.verify(
          refresh_token,
          process.env.CODDITY_JWT_REFRESH_TOKEN,
          (err, user_d) => {
            expect(err).toBeNull();
            expect(user_d).toBeDefined();
            expect(user_d.pseudo).toBe(user.pseudo);
            expect(user_d.email).toBe(user.email);
          }
        );

        done();
      })
      .catch((err) => done(err));
  });
});

describe('POST /token', () => {
  let req;
  beforeEach(() => {
    req = request(app)
      .post('/auth/token')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/);
  });
  afterAll(async () => {
    await User.deleteMany({});
    await AuthToken.deleteMany({});
  });

  it('should return 400 if no refresh token is provided', (done) => {
    return req
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it("should return 404 if the token doesn't exists", (done) => {
    return req
      .send({ token: 'RandomTokenEvenNotValid' })
      .expect(404)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return 403 if the token is not valid', async (done) => {
    const auth = {
      authToken: 'aNotValidToken',
      refreshToken: 'aNotValidRefreshToken',
    };
    await new AuthToken(auth).save();

    return req
      .send({ token: auth.refreshToken })
      .expect(403)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return 404 if the user doesnt exists', async (done) => {
    const user = { _id: new mongoose.Types.ObjectId() };
    const auth = {
      authToken: jwt.sign(user, process.env.CODDITY_JWT_TOKEN),
      refreshToken: jwt.sign(user, process.env.CODDITY_JWT_REFRESH_TOKEN),
    };
    await new AuthToken(auth).save();

    return req
      .send({ token: auth.refreshToken })
      .expect(404)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return a new acces_token', async (done) => {
    const user = await new User({
      pseudo: 'TestPseudo',
      email: 'TestEmail@gmail.com',
      password: 'TestPassword',
    }).save();
    const auth = {
      authToken: user.getJWT(),
      refreshToken: user.getRefreshJWT(),
    };
    await new AuthToken(auth).save();

    return req
      .send({ token: auth.refreshToken })
      .expect(200)
      .then((res) => {
        expect(res.body.valid).toBe(true);
        expect(res.body.data.access_token).toBeDefined();
        try {
          const user_jwt = jwt.decode(
            res.body.data.access_token,
            process.env.CODDITY_JWT_TOKEN
          );
          expect(user_jwt.pseudo).toBe(user.pseudo);
          expect(user_jwt.email).toBe(user.email);
          expect(user_jwt.password).toBeUndefined();
        } catch (e) {
          console.log(e);
          expect(e).toBeNull();
        }

        done();
      });
  });
});

describe('GET /logout', () => {
  let req;
  let user;
  let authToken;
  beforeEach(async () => {
    user = await new User({
      pseudo: 'TestUser',
      email: 'testuser@gmail.com',
      password: 'testuserpassword-',
    }).save();
    authToken = await new AuthToken({
      authToken: user.getJWT(),
      refreshToken: user.getRefreshJWT(),
    }).save();
    req = request(app)
      .get('/auth/logout')
      .set('Authorization', 'Bearer: ' + authToken.authToken);
  });
  afterAll(async () => {
    await User.deleteMany({});
    await AuthToken.deleteMany({});
  });

  it('should return 404 if the token doesnt exists', async (done) => {
    await authToken.remove();

    return req
      .send()
      .expect(404)
      .then((res) => {
        expect(res.body.valid).toBe(false);

        done();
      });
  });

  it('should return 200 if logout successed !', (done) => {
    return req
      .send()
      .expect(200)
      .then((res) => {
        expect(res.body.valid).toBe(true);
        expect(res.body.data.message).toBe('Success');

        done();
      });
  });
});
