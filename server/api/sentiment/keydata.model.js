'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KeyData = new Schema({
  keyData: String
});

module.exports = mongoose.model('KeyData', KeyData);