require('dotenv').config();

const jwt = require('jsonwebtoken');
const {
  User: { Model: User },
} = require('../../src/models');
let user;

describe('User model', () => {
  beforeAll(() => {
    user = new User({
      pseudo: 'TestPseudo',
      email: 'TestEmail@gmail.com',
      password: 'MyTestPassword',
    });
  });

  it('should return a valid access token with the user info', (done) => {
    const u_jwt = user.getJWT();
    try {
      jwt.verify(u_jwt, process.env.CODDITY_JWT_TOKEN);
    } catch (err) {
      expect(err).toBeNull();
    }

    const infos = jwt.decode(u_jwt, process.env.CODDITY_JWT_TOKEN);
    expect(infos.pseudo).toBe(user.pseudo);
    expect(infos.email).toBe(user.email);
    expect(infos.password).toBeUndefined();

    done();
  });

  it('should return a valid refresh token with the user info', (done) => {
    const u_jwt = user.getRefreshJWT();

    try {
      jwt.verify(u_jwt, process.env.CODDITY_JWT_REFRESH_TOKEN);
    } catch (err) {
      expect(err).toBeNull();
    }

    const infos = jwt.decode(u_jwt, process.env.CODDITY_JWT_REFRESH_TOKEN);
    expect(infos.pseudo).toBe(user.pseudo);
    expect(infos.email).toBe(user.email);
    expect(infos.password).toBeUndefined();

    done();
  });
});
