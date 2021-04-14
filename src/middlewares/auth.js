const jwt = require('jsonwebtoken');
const format = require('./format');

module.exports = (role) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res
      .status(401)
      .send(format(false, { message: 'No cookies found for auth !' }));

  const token = authHeader.split(' ')[1];

  try {
    const user = jwt.verify(token, process.env.CODDITY_JWT_TOKEN);
    if (user.role != role)
      return res
        .status(401)
        .send(format(false, { message: 'You are not authorized !' }));
    req.auth = { user, token };
    next();
  } catch (e) {
    return res.status(400).send(format(false, e));
  }
};
