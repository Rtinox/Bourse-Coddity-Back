const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  authToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
});

module.exports = {
  Model: mongoose.model('AuthToken', tokenSchema),
};
