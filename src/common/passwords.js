const bcrypt = require('bcrypt');

const hash = async (password) => {
  return await bcrypt.hash(password, parseInt(process.env.CODDITY_SALT_ROUND));
};

const check = (hash, password) => {
  return bcrypt.compare(password, hash);
};

module.exports = { hash, check };
