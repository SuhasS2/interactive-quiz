const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const routes = require('./routes');
const port = 5000;
const url = process.env.MONGODB_URL;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, res) => {
  if (err) {
    console.log(err);
  } else {
    console.log('connected to data base');
  }
});

const app = express();

app.use(cors());
app.use(bodyParser.json());
const router = express.Router();
routes.init(router);

app.use('/api', router);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});