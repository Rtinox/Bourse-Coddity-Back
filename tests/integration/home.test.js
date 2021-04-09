const request = require('supertest');
let server;

describe('/', () => {
  beforeAll(() => {
    server = require('../../src');
  });
  afterAll(() => {
    if (!server) return;
    server.close();
  });

  describe('GET /', () => {
    it('should return hello world', async () => {
      const res = await request(server).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toBe('Hello World !');
    });
  });
});
