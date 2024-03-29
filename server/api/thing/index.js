'use strict';

var express = require('express');
var controller = require('./thing.controller');

var router = express.Router();

router.get('/quote/:id', controller.quote);

module.exports = router;