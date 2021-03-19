const request = require('supertest');
const _ = require('lodash');
const {
  User: { Model: User },
} = require('../../src/models');
let server;

describe('/users/', () => {
  beforeEach(() => {
    server = require('../../src');
  });
  afterEach(async () => {
    server.close();
    await User.remove({});
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
    it('should create the user if everythin is valid', async () => {
      const user = {
        name: 'Test1',
        email: 'pjgame84@gmail.com',
        password: 'MonSuperMdp;)',
      };

      const res = await request(server).post('/users/new').send(user);

      const users = await User.find({ name: 'Test1' });
      expect(res.status).toBe(200);
      expect(res.body.valid).toBeTruthy();
      expect(res.body.data).toEqual(expect.arrayContaining(users));
    });
  });
});
