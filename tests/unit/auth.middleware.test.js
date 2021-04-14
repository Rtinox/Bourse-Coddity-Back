require('dotenv').config();

const jwt = require('jsonwebtoken');
const { auth } = require('../../src/middlewares');

describe('Auth Middleware', () => {
  const req = {};
  const res = {};
  let next;
  beforeEach(() => {
    req.headers = {};
    res.status = jest.fn((code) => res);
    res.send = jest.fn((data) => res);
    next = jest.fn();
  });
  it('should set 401 if no auth header', () => {
    auth('test')(req, res, next);

    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status.mock.calls[0][0]).toBe(401);

    expect(res.send.mock.calls.length).toBe(1);
    expect(res.send.mock.calls[0][0].valid).toBe(false);

    expect(next.mock.calls.length).toBe(0);
  });

  it('should set 400 if the token isnt valid', () => {
    req.headers.authorization = 'TestUnvalidToken';

    const r = auth('test')(req, res, next);

    expect(r).toBeDefined();

    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status.mock.calls[0][0]).toBe(400);

    expect(res.send.mock.calls.length).toBe(1);
    expect(res.send.mock.calls[0][0].valid).toBe(false);

    expect(next.mock.calls.length).toBe(0);
  });

  it('should set 401 if the user doent have the right role', () => {
    const user = { _id: 'ATestID', pseudo: 'ATestPseudo', role: 'user' };
    req.headers.authorization =
      'Bearer: ' + jwt.sign(user, process.env.CODDITY_JWT_TOKEN);

    const r = auth('admin')(req, res, next);

    expect(r).toBeDefined();

    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status.mock.calls[0][0]).toBe(401);

    expect(res.send.mock.calls.length).toBe(1);
    expect(res.send.mock.calls[0][0].valid).toBe(false);

    expect(next.mock.calls.length).toBe(0);
  });

  it('should call next & set req.auth if everything is ok', () => {
    const user = { _id: 'ATestID', pseudo: 'ATestPseudo', role: 'user' };
    req.headers.authorization =
      'Bearer: ' + jwt.sign(user, process.env.CODDITY_JWT_TOKEN);

    const r = auth('user')(req, res, next);

    expect(r).toBeUndefined();

    expect(res.status.mock.calls.length).toBe(0);

    expect(res.send.mock.calls.length).toBe(0);

    expect(next.mock.calls.length).toBe(1);
  });
});
