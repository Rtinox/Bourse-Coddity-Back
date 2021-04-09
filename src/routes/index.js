module.exports = (app) => {
  app.use('/', require('./home'));
  app.use('/users/', require('./users'));
  app.use('/auth/', require('./auth'));
  app.use('/articles/', require('./articles'));
};
