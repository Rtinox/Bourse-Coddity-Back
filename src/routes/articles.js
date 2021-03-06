const router = require('express').Router();
const mongoose = require('mongoose');
const { auth, format } = require('../middlewares');
const {
  Article: { Model: Article, validate, searchValidate },
} = require('../models');
const article = require('../models/article');

router.get('/:limit', async (req, res) => {
  const limit = Math.min(req.params.limit, 10);
  const articles = await Article.find({})
    .sort({ created_at: -1 })
    .limit(limit)
    .exec();

  res.send(format(true, articles));
});

router.get('/id/:articleID', async (req, res) => {
  const { articleID } = req.params;
  if (!mongoose.isValidObjectId(articleID))
    return res
      .status(400)
      .send(format(false, { message: 'Invalid article ID !' }));

  const article = await Article.findById(articleID);
  if (!article)
    return res
      .status(404)
      .send(format(false, { message: 'No article found for the given ID !' }));

  res.send(format(true, article));
});

router.post('/search', async (req, res) => {
  const { error } = searchValidate(req.body);
  if (error)
    return res
      .status(400)
      .send(format(false, { message: error.details[0].message }));

  const articles = await Article.find(req.body).exec();

  res.send(format(true, articles));
});

router.post('/new', auth('user'), async (req, res) => {
  const { error } = validate(req.body);
  if (error)
    return res
      .status(400)
      .send(format(false, { message: error.details[0].message }));

  const article = await new Article({
    ...req.body,
    contributors: [req.auth.user._id],
  }).save();

  res.send(format(true, article));
});

router.put('/:articleID', auth('user'), async (req, res) => {
  const { articleID } = req.params;
  if (!mongoose.isValidObjectId(articleID))
    return res
      .status(400)
      .send(format(false, { message: 'Invalid article ID !' }));

  const { error } = validate(req.body);
  if (error)
    return res
      .status(400)
      .send(format(false, { message: error.details[0].message }));

  delete req.body.contributors;

  const article = await Article.findById(articleID);
  if (!article)
    return res
      .status(404)
      .send(format(false, { message: 'No article found for the given ID !' }));

  const { contributors } = article;
  if (!article.contributors.includes(req.auth.user._id))
    contributors.push(req.auth.user._id);
  await article.update({
    ...req.body,
    contributors,
  });

  res.send(format(true, article));
});

module.exports = router;
