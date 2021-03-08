const router = require('express').Router

router.get('/', (req, res) => {
    res.send("Salut !");
});

module.exports = router;