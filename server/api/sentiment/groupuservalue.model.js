'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GroupUserValue = new Schema({
  type: String, /* generic or not */
  userValues: [{ type : Schema.Types.ObjectId, ref : 'UserValue' }]
});

module.exports = mongoose.model('GroupUserValue', GroupUserValue);