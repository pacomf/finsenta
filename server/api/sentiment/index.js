'use strict';

var express = require('express');
var keyDataController = require('./keydata.controller');
var queryController = require('./query.controller');
var keyGroupController = require('./keygroup.controller');
var searchResultController = require('./searchresult.controller');
var analysisController = require('./analysis.controller');

var router = express.Router();

router.get('/sentimental', analysisController.sentimentalAnalysis);

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


module.exports = router;