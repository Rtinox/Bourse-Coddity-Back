const format = require('./format');

module.exports = (req, res, next) => {
  if (!req.signedCookies.coddity_jwt_token)
    return res
      .status(401)
      .send(format(false, { message: 'No cookies found for auth !' }));
  next();
};
