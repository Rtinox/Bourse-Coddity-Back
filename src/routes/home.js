const router = require('express').Router();
const { home: homeMiddleware } = require('../middlewares');

router.get('/', [homeMiddleware], (req, res) => {
  res.send('Hello World !');
});

module.exports = router;
