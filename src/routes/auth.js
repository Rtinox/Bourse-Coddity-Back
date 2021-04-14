const router = require('express').Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const { format, auth } = require('../middlewares');

const {
  password: { check },
} = require('../common');
const {
  User: { Model: User },
  AuthToken: { Model: AuthToken },
} = require('../models');

const validate = (body) => {
  const schema = Joi.object({
    pseudo: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().required(),
  }).xor('pseudo', 'email');

  return schema.validate(body);
};

router.post('/login', async (req, res) => {
  const { error } = validate(req.body);
  if (error)
    return res
      .status(400)
      .send(format(false, { message: error.details[0].message }));

  const t_user = _.clone(req.body);
  delete t_user.password;

  const user = await User.findOne(t_user);
  if (!user)
    return res
      .status(403)
      .send(format(false, { message: 'Wrong creditentials !' }));

  if (!(await check(user.password, req.body.password)))
    return res
      .status(403)
      .send(format(false, { message: 'Wrong creditentials !' }));

  const accessToken = user.getJWT();
  const refreshToken = user.getRefreshJWT();
  await new AuthToken({ authToken: accessToken, refreshToken }).save();

  res.send(
    format(true, {
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  );
});

router.post('/token', async (req, res) => {
  const { token } = req.body;
  if (!token)
    return res
      .status(400)
      .send(format(false, { message: "No 'token' provided !" }));

  const authToken = await AuthToken.findOne({ refreshToken: token });
  if (!authToken)
    return res.status(404).send(format(false, { message: 'No token found !' }));

  try {
    jwt.verify(token, process.env.CODDITY_JWT_REFRESH_TOKEN);
  } catch (e) {
    return res.status(403).send(format(false, { message: e.message }));
  }

  const user_jwt = jwt.decode(token, process.env.CODDITY_JWT_REFRESH_TOKEN);

  const user = await User.findById(user_jwt._id);
  if (!user)
    return res
      .status(404)
      .send(format(false, { message: 'No user found for the given ID !' }));

  const accessToken = user.getJWT();
  authToken.authToken = accessToken;
  authToken.save();

  res.send(
    format(true, {
      access_token: accessToken,
    })
  );
});

router.get('/logout', [auth('user')], async (req, res) => {
  const authToken = await AuthToken.findOneAndDelete({
    authToken: req.auth.token,
  });
  if (!authToken)
    return res.status(404).send(format(false, { message: 'No token found !' }));

  res.send(format(true, { message: 'Success' }));
});

module.exports = router;
