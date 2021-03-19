const bodyParser = require('body-parser');

module.exports = (app) => {
  require('../routes')(app);
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
};
