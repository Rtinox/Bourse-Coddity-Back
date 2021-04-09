const request = require('supertest');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const {
  User: { Model: User },
} = require('../../src/models');
let server;
let jwt;

describe('/users/', () => {
  beforeAll(() => {
    server = require('../../src');
  });
  afterAll(async () => {
    if (server) server.close();
    await User.deleteMany({});
  });

  describe('GET /', () => {
    beforeEach(async (done) => {
      const user = {
        pseudo: 'SuperTestUser',
        email: 'supertestuser@yes.com',
        password: await bcrypt.hash('UnSuperPasswordPourUnSuperUser'),
      };

      await new User(user).save();
      request(server)
        .get('/auth/')
        .send({ pseudo: user.pseudo, password: user.password })
        .then((res) => {
          jwt = res.body.jwt;
          console.log(jwt);
          done();
        });
    });
    it('should the 5 last users', async (done) => {
      const users = [
        {
          pseudo: 'PJGame',
          email: 'pjgame84@gmail.com',
          password: await bcrypt.hash('SuperPasswordSecure-'),
        },
        {
          pseudo: 'Rtinox',
          email: 'jensaisrien@gmail.com',
          password: await bcrypt.hash('jeSuisLeMeilleurDevFront'),
        },
        {
          pseudo: 'PJGame2',
          email: 'jensaisrien2@gmail.com',
          password: await bcrypt.hash('jeSuisLeMeilleurDevFront2'),
        },
        {
          pseudo: 'Rtinox2',
          email: 'jensaisrien22@gmail.com',
          password: await bcrypt.hash('jeSuisLeMeilleurDevFront22'),
        },
        {
          pseudo: 'RandomBody',
          email: 'jesuisunrandom@gmail.com',
          password: await bcrypt.hash('salutcestmoitchoupi'),
        },
        {
          pseudo: 'JamaisFini',
          email: 'canesarretejamais@gmail.com',
          password: await bcrypt.hash('jenaimarre!'),
        },
      ];

      await User.insertMany(users);
      const res = await request(server)
        .get('/users/')
        .set(`Authorization: Bearer ${jwt}`)
        .expect(200)
        .then((res) => {
          expect(res.body.valid).toBeTruthy();
          expect(res.body.data.length).toBe(5);
          done();
        });
    });
  });

  describe('POST /', () => {
    it('should create the user if everything is valid', (done) => {
      const user = {
        pseudo: 'Test1',
        email: 'pjgame84@gmail.com',
        password: 'MonSuperMdp;)',
      };

      return request(server)
        .post('/users/new')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(async (res) => {
          const users = await User.findOne({ pseudo: 'Test1' });
          expect(res.body.valid).toBeTruthy();
          expect(JSON.stringify(users)).toBe(JSON.stringify(res.body.data));
          done();
        })
        .catch((err) => done(err));
    });
  });
});
