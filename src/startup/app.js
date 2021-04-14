require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const app = express();

require('./env_check');
require('./db')();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('../routes')(app);

module.exports = app;
