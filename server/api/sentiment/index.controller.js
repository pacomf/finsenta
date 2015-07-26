'use strict';

var _ = require('lodash');
var Index = require('./index.model');

// Get list of index
exports.index = function(req, res) {
  Index.find(function (err, indexs) {
    if(err) { return handleError(res, err); }
    return res.json(200, indexs);
  });
};

// Get a single index
exports.show = function(req, res) {
  Index.findById(req.params.id, function (err, index) {
    if(err) { return handleError(res, err); }
    if(!index) { return res.send(404); }
    return res.json(index);
  });
};

// Creates a new index in the DB.
exports.create = function(req, res) {
  Index.create(req.body, function(err, index) {
    if(err) { return handleError(res, err); }
    return res.json(201, index);
  });
};

// Updates an existing index in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Index.findById(req.params.id, function (err, index) {
    if (err) { return handleError(res, err); }
    if(!index) { return res.send(404); }
    var updated = _.merge(index, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, index);
    });
  });
};

// Deletes a index from the DB.
exports.destroy = function(req, res) {
  Index.findById(req.params.id, function (err, index) {
    if(err) { return handleError(res, err); }
    if(!index) { return res.send(404); }
    index.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}