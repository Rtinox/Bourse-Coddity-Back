const router = require('express').Router
const { home: homeRouter } = require('../middlewares');

router.get('/', [homeRouter], (req, res) => {
    res.send("Salut !");
});

module.exports = router;