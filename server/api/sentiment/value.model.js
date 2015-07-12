'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Value = new Schema({
  name: String,
  description: String,
  index: { type : Schema.Types.ObjectId, ref : 'Index' },
});

module.exports = mongoose.model('Value', Value);