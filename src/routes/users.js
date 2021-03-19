const router = require('express').Router();
const _ = require('lodash');
const { auth, format } = require('../middlewares');
const {
  User: { Model: User, validate },
} = require('../models');

router.get('/', [auth], async (req, res) => {
  const users = await User.find({}).limit(5);
  return res.send(format(true, users));
});

router.post('/new', async (req, res) => {
  // TODO: Check if user isn't authed
  const { error } = validate(req.body);
  if (error) return res.send(400, format(false, error.details[0].message));

  const user = new User(req.body).save();

  res.send(format(true, user));
});

router.get('/:userId', [auth], async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user)
    return res.send(404, format(false, 'No user found for the provided ID !'));

  res.send(format(true, user));
});

module.exports = router;
