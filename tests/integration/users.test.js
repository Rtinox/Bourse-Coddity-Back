const request = require('supertest');
const _ = require('lodash');
const mongoose = require('mongoose');
const {
  password: { hash },
} = require('../../src/common');
const {
  User: { Model: User },
  AuthToken: { Model: AuthToken },
} = require('../../src/models');
const app = require('../../src/startup/app');

describe('GET /', () => {
  let req;
  let user;
  let authToken;
  beforeAll(async () => {
    user = await new User({
      pseudo: 'TestUser',
      email: 'testuser@gmail.com',
      password: 'testuserpassword-',
    }).save();
    authToken = await new AuthToken({
      authToken: user.getJWT(),
      refreshToken: user.getRefreshJWT(),
    }).save();
    req = () =>
      request(app)
        .get('/users/')
        .set('Authorization', 'Bearer: ' + authToken.authToken);
  });
  afterAll(async () => {
    await User.deleteMany({});
    await AuthToken.deleteMany({});
  });

  it('should return 401 if not logged in', (done) => {
    return req()
      .unset('Authorization')
      .send({})
      .expect(401)
      .then((res) => {
        expect(res.body.valid).toBe(false);

        done();
      });
  });

  it('should the 5 last users', async (done) => {
    const users = [
      {
        pseudo: 'PJGame',
        email: 'pjgame84@gmail.com',
        password: await hash('SuperPasswordSecure-'),
      },
      {
        pseudo: 'Rtinox',
        email: 'jensaisrien@gmail.com',
        password: await hash('jeSuisLeMeilleurDevFront'),
      },
      {
        pseudo: 'PJGame2',
        email: 'jensaisrien2@gmail.com',
        password: await hash('jeSuisLeMeilleurDevFront2'),
      },
      {
        pseudo: 'Rtinox2',
        email: 'jensaisrien22@gmail.com',
        password: await hash('jeSuisLeMeilleurDevFront22'),
      },
      {
        pseudo: 'RandomBody',
        email: 'jesuisunrandom@gmail.com',
        password: await hash('salutcestmoitchoupi'),
      },
      {
        pseudo: 'JamaisFini',
        email: 'canesarretejamais@gmail.com',
        password: await hash('jenaimarre!'),
      },
    ];

    await User.insertMany(users);
    return req()
      .send()
      .expect(200)
      .then((res) => {
        expect(res.body.valid).toBe(true);
        expect(res.body.data.length).toBe(5);
        done();
      });
  });
});

describe('POST /new', () => {
  let req;
  beforeEach(() => {
    req = request(app)
      .post('/users/new')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/);
  });
  afterAll(async () => {
    await User.deleteMany({});
    await AuthToken.deleteMany({});
  });

  it('should return 401 if the user is logged in', async (done) => {
    const user = await new User({
      pseudo: 'TestUser',
      email: 'testuser@gmail.com',
      password: 'testuserpassword-',
    }).save();
    const authToken = await new AuthToken({
      authToken: user.getJWT(),
      refreshToken: user.getRefreshJWT(),
    }).save();

    return req
      .set('Authorization', 'Bearer: ' + authToken.authToken)
      .send({})
      .expect(401)
      .then((res) => {
        expect(res.body.valid).toBe(false);

        done();
      });
  });

  it('should return 400 if the user is not valid', (done) => {
    const user = {
      foo: 'bar',
    };

    return req
      .send(user)
      .expect(400)
      .then((res) => {
        expect(res.body.valid).toBe(false);

        done();
      });
  });

  it('should create the user if everything is valid', (done) => {
    const user = {
      pseudo: 'Test1',
      email: 'pjgame84@gmail.com',
      password: 'MonSuperMdp;)',
    };

    return req
      .send(user)
      .expect(200)
      .then(async (res) => {
        const users = await User.findOne({ pseudo: 'Test1' });
        expect(res.body.valid).toBeTruthy();
        expect(users).toBeDefined();
        expect(res.body.data.pseudo).toBe(user.pseudo);
        expect(res.body.data.email).toBe(user.email);
        expect(res.body.data.password).toBeUndefined();
        done();
      })
      .catch((err) => done(err));
  });

  it('should return 200 & create the user if the user is logged in as admin', async (done) => {
    const user = await new User({
      pseudo: 'TestUser',
      email: 'testuser@gmail.com',
      password: 'testuserpassword-',
      role: 'admin',
    }).save();
    const authToken = await new AuthToken({
      authToken: user.getJWT(),
      refreshToken: user.getRefreshJWT(),
    }).save();

    const userSend = {
      pseudo: 'Test1',
      email: 'pjgame84@gmail.com',
      password: 'MonSuperMdp;)',
    };

    return req
      .set('Authorization', 'Bearer: ' + authToken.authToken)
      .send(userSend)
      .expect(200)
      .then(async (res) => {
        const users = await User.findOne({ pseudo: 'Test1' });
        expect(res.body.valid).toBeTruthy();
        expect(users).toBeDefined();
        expect(res.body.data.pseudo).toBe(userSend.pseudo);
        expect(res.body.data.email).toBe(userSend.email);
        expect(res.body.data.password).toBeUndefined();
        done();
      });
  });
});

describe('GET /:userId', () => {
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
    req = request(app);
  });
  afterAll(async () => {
    await User.deleteMany({});
    await AuthToken.deleteMany({});
  });

  it('should return 401 if the user is not connected', (done) => {
    return req
      .get('/users/123')
      .send()
      .expect(401)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return 400 if the userId isnt valid', (done) => {
    return req
      .get('/users/123')
      .set('Authorization', 'Bearer: ' + authToken.authToken)
      .send()
      .expect(400)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return 404 if the user doesnt exists', (done) => {
    return req
      .get('/users/' + new mongoose.Types.ObjectId())
      .set('Authorization', 'Bearer: ' + authToken.authToken)
      .send()
      .expect(404)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return 200 & the user', async (done) => {
    const new_user = await new User({
      pseudo: 'TestUser',
      email: 'testuser@gmail.com',
      password: 'userpassword-',
    }).save();
    return req
      .get('/users/' + new_user._id)
      .set('Authorization', 'Bearer: ' + authToken.authToken)
      .send()
      .expect(200)
      .then((res) => {
        expect(res.body.valid).toBe(true);
        expect(res.body.data.pseudo).toBe(new_user.pseudo);
        expect(res.body.data.email).toBe(new_user.email);
        expect(res.body.data.password).toBeUndefined();
        done();
      });
  });
});
