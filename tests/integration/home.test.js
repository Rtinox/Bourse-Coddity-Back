const request = require('supertest');
const app = require('../../src/startup/app');

describe('/', () => {
  describe('GET /', () => {
    it('should return hello world', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toBe('Hello World !');
    });
  });
});
