'use strict';

var _ = require('lodash');
var UserValue = require('./uservalue.model');

// Get list of uservalue
exports.index = function(req, res) {
  UserValue.find(function (err, uservalues) {
    if(err) { return handleError(res, err); }
    return res.json(200, uservalues);
  });
};

// Get a single uservalue
exports.show = function(req, res) {
  UserValue.findById(req.params.id, function (err, uservalue) {
    if(err) { return handleError(res, err); }
    if(!uservalue) { return res.send(404); }
    return res.json(uservalue);
  });
};

// Creates a new uservalue in the DB.
exports.create = function(req, res) {
  UserValue.create(req.body, function(err, uservalue) {
    if(err) { return handleError(res, err); }
    return res.json(201, uservalue);
  });
};

// Updates an existing uservalue in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  UserValue.findById(req.params.id, function (err, uservalue) {
    if (err) { return handleError(res, err); }
    if(!uservalue) { return res.send(404); }
    var updated = _.merge(uservalue, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, uservalue);
    });
  });
};

// Deletes a uservalue from the DB.
exports.destroy = function(req, res) {
  UserValue.findById(req.params.id, function (err, uservalue) {
    if(err) { return handleError(res, err); }
    if(!uservalue) { return res.send(404); }
    uservalue.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}