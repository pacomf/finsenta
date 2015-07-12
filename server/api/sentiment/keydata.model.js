'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KeyData = new Schema({
  keyData: String,
  weight: Number
});

module.exports = mongoose.model('KeyData', KeyData);