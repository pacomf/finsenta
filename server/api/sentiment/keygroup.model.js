'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KeyGroup = new Schema({
  type : String,
  keyData:  [ { type : Schema.Types.ObjectId, ref : 'KeyData' } ]
});

module.exports = mongoose.model('KeyGroup', KeyGroup);