'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Index = new Schema({
  name: String
});

module.exports = mongoose.model('Index', Index);