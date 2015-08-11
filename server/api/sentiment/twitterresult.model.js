'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TwitterResult = new Schema({
  query: { type : Schema.Types.ObjectId, ref : 'Query' },
  date: Date,
  total: Number,
  sentiment: { type: Boolean, default: false },
  positive: Number,
  negative: Number,
  neutral: Number,
  ambivalent: Number,
});

module.exports = mongoose.model('TwitterResult', TwitterResult);