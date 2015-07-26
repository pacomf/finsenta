'use strict';

var express = require('express');
var keyDataController = require('./keydata.controller');
var queryController = require('./query.controller');
var keyGroupController = require('./keygroup.controller');
var searchResultController = require('./searchresult.controller');
var analysisController = require('./analysis.controller');
var uservalueController = require('./uservalue.controller');
var indexController = require('./index.controller');
var valueController = require('./value.controller');

var router = express.Router();

router.get('/sentimental', analysisController.sentimentalAnalysis);

router.get('/tweetInfo/:stock', analysisController.tweetInfo);

// KeyData routes
var keyDataPath = '/keydata';
router.get(keyDataPath, keyDataController.index);
router.post(keyDataPath, keyDataController.create);
router.put(keyDataPath + '/:id', keyDataController.update);
router.patch(keyDataPath + '/:id', keyDataController.update);
router.delete(keyDataPath + '/:id', keyDataController.destroy);

// Query routes
var queryPath = '/query';
router.get(queryPath, queryController.index);
router.post(queryPath, queryController.create);
router.put(queryPath + '/:id', queryController.update);
router.patch(queryPath + '/:id', queryController.update);
router.delete(queryPath + '/:id', queryController.destroy);

// KeyGroup routes
var keyGroupPath = '/keygroup';
router.get(keyGroupPath, keyGroupController.index);
router.post(keyGroupPath, keyGroupController.create);
router.put(keyGroupPath + '/:id', keyGroupController.update);
router.patch(keyGroupPath + '/:id', keyGroupController.update);
router.delete(keyGroupPath + '/:id', keyGroupController.destroy);

// SearchResult routes
var searchResultPath = '/searchresult';
router.get(searchResultPath, searchResultController.index);
router.post(searchResultPath, searchResultController.create);
router.put(searchResultPath + '/:id', searchResultController.update);
router.patch(searchResultPath + '/:id', searchResultController.update);
router.delete(searchResultPath + '/:id', searchResultController.destroy);

// UserValue routes
var uservaluePath = '/uservalue';
router.get(uservaluePath, uservalueController.index);
router.post(uservaluePath, uservalueController.create);
router.put(uservaluePath + '/:id', uservalueController.update);
router.patch(uservaluePath + '/:id', uservalueController.update);
router.delete(uservaluePath + '/:id', uservalueController.destroy);

// Value routes
var valuePath = '/value';
router.get(valuePath, valueController.index);
router.post(valuePath, valueController.create);
router.put(valuePath + '/:id', valueController.update);
router.patch(valuePath + '/:id', valueController.update);
router.delete(valuePath + '/:id', valueController.destroy);

// Index routes
var indexPath = '/index';
router.get(indexPath, indexController.index);
router.post(indexPath, indexController.create);
router.put(indexPath + '/:id', indexController.update);
router.patch(indexPath + '/:id', indexController.update);
router.delete(indexPath + '/:id', indexController.destroy);

module.exports = router;