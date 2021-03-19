module.exports = (app) => {
  app.use('/', require('./home'));
  app.use('/users/', require('./users'));
};
