const router = require('express').Router();
const { auth, format } = require('../middlewares');
const {
  Article: { Model: Article, validate },
} = require('../models');

router.get('/:limit', async (req, res) => {
  const limit = Math.min(req.params.limit, 10);
  const articles = await Article.findMany({}).limit(limit);

  res.send(format(true, articles));
});

router.post('/new', auth('user'), async (req, res) => {
  const { error } = validate(req.body);
  if (error)
    return res.status(400).send(format(false, error.details[0].message));

  const article = await new Article(req.body).save();

  res.send(article);
});

module.exports = router;
