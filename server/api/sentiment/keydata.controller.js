'use strict';

var _ = require('lodash');
var KeyData = require('./keydata.model');

// Get list of keydata
exports.index = function(req, res) {
  KeyData.find(function (err, keydatas) {
    if(err) { return handleError(res, err); }
    return res.json(200, keydatas);
  });
};

// Get a single keydata
exports.show = function(req, res) {
  KeyData.findById(req.params.id, function (err, keydata) {
    if(err) { return handleError(res, err); }
    if(!keydata) { return res.send(404); }
    return res.json(keydata);
  });
};

// Creates a new keydata in the DB.
exports.create = function(req, res) {
  KeyData.create(req.body, function(err, keydata) {
    if(err) { return handleError(res, err); }
    return res.json(201, keydata);
  });
};

// Updates an existing keydata in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  KeyData.findById(req.params.id, function (err, keydata) {
    if (err) { return handleError(res, err); }
    if(!keydata) { return res.send(404); }
    var updated = _.merge(keydata, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, keydata);
    });
  });
};

// Deletes a keydata from the DB.
exports.destroy = function(req, res) {
  KeyData.findById(req.params.id, function (err, keydata) {
    if(err) { return handleError(res, err); }
    if(!keydata) { return res.send(404); }
    keydata.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}