require('dotenv').config();

const express = require('express');
const app = express();

require('./startup/app')(app);
require('./startup/db')();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

module.exports = server;
