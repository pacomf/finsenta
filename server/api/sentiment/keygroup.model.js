'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KeyGroup = new Schema({
  keyData:  [ { type : Schema.Types.ObjectId, ref : 'KeyData' } ]
});

module.exports = mongoose.model('KeyGroup', KeyGroup);