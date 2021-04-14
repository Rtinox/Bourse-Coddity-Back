const Joi = require('joi');
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    minlenght: 1,
    maxlenght: 100,
  },
  text: {
    type: String,
    required: [true, 'Le contenue est requis !'],
    minlenght: 1,
    maxlenght: 1024,
  },
  sources: [
    {
      type: String,
      default: [],
    },
  ],
  contributors: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Les contriuteurs sont requis'],
    },
  ],
});

const validate = (body) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    text: Joi.string().required(),
    sources: Joi.array(),
    contributors: Joi.array().required(),
  });

  return schema.validate(body);
};

module.exports = {
  Model: mongoose.model('Article', articleSchema),
  validate,
};
