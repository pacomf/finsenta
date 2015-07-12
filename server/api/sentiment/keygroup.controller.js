'use strict';

var _ = require('lodash');
var KeyData = require('./keygroup.model');

// Get list of keygroup
exports.index = function(req, res) {
  KeyData.find(function (err, keygroups) {
    if(err) { return handleError(res, err); }
    return res.json(200, keygroups);
  });
};

// Get a single keygroup
exports.show = function(req, res) {
  KeyData.findById(req.params.id, function (err, keygroup) {
    if(err) { return handleError(res, err); }
    if(!keygroup) { return res.send(404); }
    return res.json(keygroup);
  });
};

// Creates a new keygroup in the DB.
exports.create = function(req, res) {
  KeyData.create(req.body, function(err, keygroup) {
    if(err) { return handleError(res, err); }
    return res.json(201, keygroup);
  });
};

// Updates an existing keygroup in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  KeyData.findById(req.params.id, function (err, keygroup) {
    if (err) { return handleError(res, err); }
    if(!keygroup) { return res.send(404); }
    var updated = _.merge(keygroup, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, keygroup);
    });
  });
};

// Deletes a keygroup from the DB.
exports.destroy = function(req, res) {
  KeyData.findById(req.params.id, function (err, keygroup) {
    if(err) { return handleError(res, err); }
    if(!keygroup) { return res.send(404); }
    keygroup.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}