const request = require('supertest');
const _ = require('lodash');
const {
  User: { Model: User },
} = require('../../src/models');
let server;

describe('/users/', () => {
  beforeAll(() => {
    server = require('../../src');
  });
  afterAll(async () => {
    if (server) server.close();
    await User.deleteMany({});
  });

  describe('GET /', () => {
    it('should the 5 last users', async () => {
      const users = [
        {
          pseudo: 'PJGame',
          email: 'pjgame84@gmail.com',
          password: 'SuperPasswordSecure-',
        },
        {
          pseudo: 'Rtinox',
          email: 'jensaisrien@gmail.com',
          password: 'jeSuisLeMeilleurDevFront',
        },
        {
          pseudo: 'PJGame2',
          email: 'jensaisrien2@gmail.com',
          password: 'jeSuisLeMeilleurDevFront2',
        },
        {
          pseudo: 'Rtinox2',
          email: 'jensaisrien22@gmail.com',
          password: 'jeSuisLeMeilleurDevFront22',
        },
        {
          pseudo: 'RandomBody',
          email: 'jesuisunrandom@gmail.com',
          password: 'salutcestmoitchoupi',
        },
        {
          pseudo: 'JamaisFini',
          email: 'canesarretejamais@gmail.com',
          password: 'jenaimarre!',
        },
      ];

      await User.insertMany(users);

      const res = await request(server).get('/users/');
      expect(res.status).toBe(200);
      expect(res.body.valid).toBeTruthy();
      expect(res.body.data.length).toBe(5);
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
