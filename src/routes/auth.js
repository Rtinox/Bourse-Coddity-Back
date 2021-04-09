const router = require('express').Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const format = require('../middlewares/format');
const {
  User: { Model: User },
} = require('../models');

const validate = (body) => {
  const schema = Joi.object({
    pseudo: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }).xor('pseudo', 'email');

  return schema.validate(body);
};

router.get('/', async (req, res) => {
  const { error } = validate(req.params);
  if (error)
    return res
      .status(401)
      .send(format(false, { message: error.details[0].message }));

  const t_user = req.params;
  delete t_user.password;

  const user = await User.findOne(t_user);
  if (!user)
    return res
      .status(401)
      .send(format(false, { message: 'Wrong creditentials !' }));

  if (!(await bcrypt.compare(user.password, req.params.password)))
    return res
      .status(401)
      .send(format(false, { message: 'Wrong creditentials !' }));

  delete user.password;

  const r = {
    ...user,
    jwt: jwt.sign(user, process.env.CODDITY_JWT_TOKEN),
  };

  res.send(format(true, r));
});

module.exports = router;
