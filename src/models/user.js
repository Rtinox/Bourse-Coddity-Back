const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const userSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: [true, 'Le pseudo est requis'],
    minlenght: 3,
    maxlenght: 60,
  },
  lastName: {
    type: String,
    minlenght: 3,
    maxlenght: 60,
  },
  firstName: {
    type: String,
    minlenght: 3,
    maxlenght: 60,
  },
  email: {
    type: String,
    required: [true, 'Adresse email requise !'],
    validate: {
      validator: function (v) {
        return emailRegex.test(v);
      },
      message: (props) => `${props.value} n'est pas une adresse mail valide !`,
    },
    minlenght: 5,
    maxlenght: 255,
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis !'],
    minlenght: 5,
    maxlenght: 1024,
  },
  role: {
    type: String,
    default: 'user',
  },
});
userSchema.methods.getJWT = function (cb) {
  const u = _.clone(this.toObject());
  delete u.password;
  return jwt.sign(u, process.env.CODDITY_JWT_TOKEN, { expiresIn: '20m' });
};
userSchema.methods.getRefreshJWT = function (cb) {
  const u = _.clone(this.toObject());
  delete u.password;
  return jwt.sign(u, process.env.CODDITY_JWT_REFRESH_TOKEN);
};

function validate(user) {
  const schema = Joi.object({
    pseudo: Joi.string().min(3).max(60).required(),
    lastName: Joi.string().min(3).max(60),
    firstName: Joi.string().min(3).max(60),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

module.exports = {
  Model: mongoose.model('User', userSchema),
  validate,
};
