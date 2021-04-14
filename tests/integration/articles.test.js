const request = require('supertest');
const mongoose = require('mongoose');
const _ = require('lodash');
const app = require('../../src/startup/app');
const {
  Article: { Model: Article },
  User: { Model: User },
  AuthToken: { Model: AuthToken },
} = require('../../src/models');

describe('GET /articles/:limit', () => {
  let req;
  beforeEach(() => {
    req = request(app);
  });
  afterEach(async () => {
    await Article.deleteMany({});
  });

  it('should return the 3 latest articles', async (done) => {
    const articles = [
      {
        title: 'TestArticle1',
        text: 'TextForArticle1',
        contributors: [mongoose.Types.ObjectId()],
      },
      {
        title: 'TestArticle2',
        text: 'TextForArticle2',
        contributors: [mongoose.Types.ObjectId()],
      },
      {
        title: 'TestArticle3',
        text: 'TextForArticle3',
        contributors: [mongoose.Types.ObjectId()],
      },
      {
        title: 'TestArticle4',
        text: 'TextForArticle4',
        contributors: [mongoose.Types.ObjectId()],
      },
    ];

    await Article.insertMany(articles);

    return req
      .get('/articles/3')
      .send()
      .expect(200)
      .then((res) => {
        expect(res.body.valid).toBe(true);
        expect(res.body.data.length).toBe(3);

        done();
      });
  });
});

describe('GET /articles/id/:articleID', () => {
  let req;
  beforeEach(() => {
    req = (id) =>
      request(app)
        .get('/articles/id/' + id)
        .send();
  });
  afterEach(async () => {
    await Article.deleteMany({});
  });

  it('should return 400 if the id isnt valid', (done) => {
    return req('test')
      .expect(400)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return 404 if the article doesnt exists', (done) => {
    return req(mongoose.Types.ObjectId())
      .expect(404)
      .then((res) => {
        expect(res.body.valid).toBe(false);
        done();
      });
  });

  it('should return the article', async (done) => {
    const article = await new Article({
      title: 'TestArticle1',
      text: 'TextForArticle1',
      contributors: [mongoose.Types.ObjectId()],
    }).save();

    return req(article._id)
      .expect(200)
      .then((res) => {
        expect(res.body.valid).toBe(true);

        const { data: r_article } = res.body;
        expect(r_article.title).toBe(article.title);
        expect(r_article.text).toBe(article.text);

        done();
      });
  });
});

describe('POST /articles/new', () => {
  let req;
  let user;
  let authToken;
  beforeEach(async () => {
    user = await new User({
      pseudo: 'TestUser',
      email: 'testuser@gmail.com',
      password: 'testuserpassword-',
    }).save();
    authToken = await new AuthToken({
      authToken: user.getJWT(),
      refreshToken: user.getRefreshJWT(),
    }).save();
    req = request(app)
      .post('/articles/new')
      .set('Authorization', 'Bearer: ' + authToken.authToken)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/);
  });
  afterEach(async () => {
    await Article.deleteMany({});
    await User.deleteMany({});
    await AuthToken.deleteMany({});
  });

  it('should return 401 if not logged in', (done) => {
    return req
      .unset('Authorization')
      .send({})
      .expect(401)
      .then((res) => {
        expect(res.body.valid).toBe(false);

        done();
      });
  });

  it('should return 400 if the body is bad', (done) => {
    return req
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.valid).toBe(false);

        done();
      });
  });

  it('should return 200 & the article if success', (done) => {
    const article = {
      title: 'TestArticle',
      text: 'TextTestArticle',
      contributors: [new mongoose.Types.ObjectId()],
    };
    return req
      .send(article)
      .expect(200)
      .then((res) => {
        expect(res.body.valid).toBe(true);
        expect(res.body.data._id).toBeDefined();
        expect(res.body.data.title).toBe(article.title);
        expect(res.body.data.text).toBe(article.text);

        done();
      });
  });
});

describe('PUT /:articleID', () => {
  let req;
  let user;
  let authToken;
  beforeEach(async () => {
    user = await new User({
      pseudo: 'TestUser',
      email: 'testuser@gmail.com',
      password: 'testuserpassword-',
    }).save();
    authToken = await new AuthToken({
      authToken: user.getJWT(),
      refreshToken: user.getRefreshJWT(),
    }).save();
    req = (id) =>
      request(app)
        .put('/articles/' + id)
        .set('Authorization', 'Bearer: ' + authToken.authToken)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);
  });
  afterEach(async () => {
    await Article.deleteMany({});
    await User.deleteMany({});
    await AuthToken.deleteMany({});
  });

  it('should return 401 if the user isnt logged in', (done) => {
    return req('abc')
      .unset('Authorization')
      .send({})
      .expect(401)
      .then((res) => {
        expect(res.body.valid).toBe(false);

        done();
      });
  });

  it('should return 400 if invalid article ID', (done) => {
    return req('abc')
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.valid).toBe(false);

        done();
      });
  });

  it('should return 400 if the request isnt valid', (done) => {
    return req(new mongoose.Types.ObjectId())
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.valid).toBe(false);

        done();
      });
  });

  it('should return 404 if the article doesnt exists', (done) => {
    return req(new mongoose.Types.ObjectId())
      .send({
        title: 'TestArticle',
        text: 'TextTestArticle',
        contributors: [new mongoose.Types.ObjectId()],
      })
      .expect(404)
      .then((res) => {
        expect(res.body.valid).toBe(false);

        done();
      });
  });

  it('should return 200 & the updated article if success', async (done) => {
    const article = await new Article({
      title: 'TestArticle',
      text: 'TextTestArticle',
      contributors: [new mongoose.Types.ObjectId()],
    }).save();
    const a = _.clone(article.toObject());
    a.title = 'EditedTestArticle';

    return req(article._id)
      .send({ title: a.title, text: a.text, contributors: a.contributors })
      .expect(200)
      .then((res) => {
        expect(res.body.valid).toBe(true);
        expect(res.body.data.title).toBe(article.title);

        done();
      });
  });
});
