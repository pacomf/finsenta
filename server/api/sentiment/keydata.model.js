'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KeyData = new Schema({
  keyData: String,
  weight: Number // TODO: Para que el peso sea configurable por usuarios ¿Sacarlo a otra tabla que relaciones el KeyData con el User?
});

module.exports = mongoose.model('KeyData', KeyData);