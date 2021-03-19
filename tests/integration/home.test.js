const request = require('supertest');
let server;

describe('/', () => {
  beforeEach(() => {
    server = require('../../src');
  });
  afterEach(() => {
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
