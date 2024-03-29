'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserValueSchema = new Schema({
  type: String, /* generic or not */
  value: { type : Schema.Types.ObjectId, ref : 'Value' },
  query: [{ type : Schema.Types.ObjectId, ref : 'Query' }],
  keyGroup: { type : Schema.Types.ObjectId, ref : 'KeyGroup' }
});

module.exports = mongoose.model('UserValue', UserValueSchema);