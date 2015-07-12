'use strict';

var _ = require('lodash');
var SearchResult = require('./searchresult.model');

// Get list of searchresult
exports.index = function(req, res) {
  SearchResult.find(function (err, searchresults) {
    if(err) { return handleError(res, err); }
    return res.json(200, searchresults);
  });
};

// Get a single searchresult
exports.show = function(req, res) {
  SearchResult.findById(req.params.id, function (err, searchresult) {
    if(err) { return handleError(res, err); }
    if(!searchresult) { return res.send(404); }
    return res.json(searchresult);
  });
};

// Creates a new searchresult in the DB.
exports.create = function(req, res) {
  SearchResult.create(req.body, function(err, searchresult) {
    if(err) { return handleError(res, err); }
    return res.json(201, searchresult);
  });
};

// Updates an existing searchresult in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  SearchResult.findById(req.params.id, function (err, searchresult) {
    if (err) { return handleError(res, err); }
    if(!searchresult) { return res.send(404); }
    var updated = _.merge(searchresult, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, searchresult);
    });
  });
};

// Deletes a searchresult from the DB.
exports.destroy = function(req, res) {
  SearchResult.findById(req.params.id, function (err, searchresult) {
    if(err) { return handleError(res, err); }
    if(!searchresult) { return res.send(404); }
    searchresult.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}