'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Query = new Schema({
  queryStr: String
});

module.exports = mongoose.model('Query', Query);