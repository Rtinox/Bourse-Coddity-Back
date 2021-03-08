require("dotenv").config();

const express = require("express");
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World !");
});

require('./routes')(app);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) throw err;
  console.log("Connected to MongoDB database !");
});