const router = require('express').Router();
const _ = require('lodash');
const mongoose = require('mongoose');
const { auth, format } = require('../middlewares');
const {
  password: { hash },
} = require('../common');
const {
  User: { Model: User, validate },
} = require('../models');

router.get('/', [auth('user')], async (req, res) => {
  const users = await User.find({}).limit(5);
  return res.send(format(true, users));
});

router.post('/new', async (req, res) => {
  if (req.headers.authorization) {
    if (auth('admin')(req, res, () => {})) {
      // If auth('admin') return something it means the user isn't admin and connected
      return;
    }
  }

  const { error } = validate(req.body);
  if (error) return res.send(400, format(false, error.details[0].message));

  req.body.password = await hash(req.body.password);
  const user = await new User(req.body).save();

  const u = _.clone(user.toObject());
  delete u.password;
  res.send(format(true, u));
});

router.get('/:userId', [auth('user')], async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.userId))
    return res.status(400).send(format(false, { message: 'Invalid userId !' }));

  const user = await User.findById(req.params.userId).select('-password');
  if (!user)
    return res
      .status(404)
      .send(format(false, { message: 'No user found for the provided ID !' }));

  res.send(format(true, user));
});

module.exports = router;
