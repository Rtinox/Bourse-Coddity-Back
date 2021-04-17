require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express();

require('./env_check');
require('./db')();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

require('../routes')(app);

module.exports = app;
