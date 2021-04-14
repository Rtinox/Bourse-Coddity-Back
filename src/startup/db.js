const mongoose = require('mongoose');

module.exports = async () => {
  await mongoose.connect(
    process.env.DB_HOST,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    (err) => {
      if (err) throw err;
      console.log('Connected to MongoDB database !');
    }
  );
};
