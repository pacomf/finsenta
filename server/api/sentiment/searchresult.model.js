'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SearchResult = new Schema({
  value: { type : Schema.Types.ObjectId, ref : 'Value' },
  query: { type : Schema.Types.ObjectId, ref : 'Query' },
  keyData: { type : Schema.Types.ObjectId, ref : 'KeyData' },
  urlResult: String,
  language: String,
  sentimentalResult: String,
  score: Number,
  analysisDate: Date,
  dataDate: Date 
});

module.exports = mongoose.model('SearchResult', SearchResult);