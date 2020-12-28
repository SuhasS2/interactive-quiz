'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileUpload = new Schema({
  name: String,
  type: String,
  url: String,
  lastModified: String,
  sizeInBytes: Number,
  bucket: String,
  purpose: String,
  keyName: String,
  user: String,
  status: String,
  recordCount: Number,
  action: String
});

module.exports = mongoose.model('fileUpload', fileUpload);
