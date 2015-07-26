'use strict';

var Agenda = require('agenda');
var AnalysisController = require('../api/sentiment/analysis.controller');

var UserValue = require('../api/sentiment/uservalue.model');
var KeyGroup = require('../api/sentiment/keygroup.model');
var KeyData = require('../api/sentiment/keydata.model');
var Value = require('../api/sentiment/value.model');
var Query = require('../api/sentiment/query.model');

var U = require('../api/sentiment/utilities');

var async = require('async');

var Jsonfile = require('jsonfile')
 
var fileJSON = './server/tasks/tmp/dataJobs.json';

exports.scheduleRss = function (){

	var dataJobs = [];

	KeyData.find({}, function (err, keyDatas){
		async.eachSeries(keyDatas, function(keyData, callbackKD) {
			dataJobs.push({keyDataId:keyData._id, urlRss:keyData.keyData});	
			callbackKD();
        }, function(err){
        	// Lo hago asi porque hay conflictos en algo de Mongoose
        	// El conflicto es entre la libreria Agenda y [la app propia o la libreria Async] (todas usan Mongoose)
			Jsonfile.writeFile(fileJSON, dataJobs, function (err) {
				console.log("Jobs calculados");
			});
        });
	});

}

exports.loadJobs = function(){
	var agenda = new Agenda();
	agenda.database('localhost:27017/finsenta-jobs', 'finsentaJobs');
	agenda._db._emitter._maxListeners = 0;

	// TODO, QUITAR
	agenda.purge(function(err, numRemoved) {});

	agenda.define('analyzeRss', function(job, done) {
  		var data = job.attrs.data;
  		AnalysisController.readAndProcessRss(data.keyDataId, data.urlRss, done);
	});

	var job;

	Jsonfile.readFile(fileJSON, function(err, obj) {
  		for (var i = obj.length - 1; i >= 0; i--) {
  			job = agenda.create('analyzeRss', {keyDataId:obj[i].keyDataId, urlRss:obj[i].urlRss});
			job.repeatEvery('10 minutes').save();
  		};
  		agenda.start();
  		console.log("Jobs creados!");
	})
	
}

var twitter = require('twitter');

var client = new twitter({
  consumer_key: 'DLIgci0tLnFkRbJ8MCdbp1T8g',
  consumer_secret: 'p9OuQWzstr09UFG0i86gH9TpeofnRiYaAKDQBf7PYVC6NWGuD7',
  access_token_key: '526390388-NQfg0jStetPZ7MevxnLcYhweiYs10rouEgVOi0KZ',
  access_token_secret: 'ihm3MHXD7AWj9fbnKgXDd5WxEHJ4V5aGCEvul8iduEzNm'
});

function searchTweets (value, keyword, done){

	return;
	client.get('search/tweets', {q: keyword}, function(error, tweets, response){
		if (error){
			console.log("Error Twitter: "+error.name+"|"+error.message);
			done();
			return;
		}
		console.log("Nuevos Tweets para: "+value);
		var index = -1;
		for (var i = U.lastTweetInfo.length - 1; i >= 0; i--) {
			if (U.lastTweetInfo[i].value === value){
				index = i;
				break;
			}
		}
		if (index === -1){
			var newJson = {};
			newJson.value = value;
			newJson.tweets = tweets.statuses;
			newJson.num = tweets.search_metadata.count;
			U.lastTweetInfo.unshift(newJson);
			index = 0;
		} else {
          	U.lastTweetInfo[index].num += tweets.search_metadata.count;
			U.lastTweetInfo[index].tweets = tweets.statuses;
		}
		done();
	});

}

exports.loadTwitter = function(){
	var agenda = new Agenda();
	agenda.database('localhost:27017/finsenta-jobs', 'finsentaJobs');
	agenda._db._emitter._maxListeners = 0;

	agenda.define('analyzeTwitter', function(job, done) {
  		var value = job.attrs.value;
  		var keyword = job.attrs.keyword;
  		searchTweets(value, keyword, done);
	});

	var job;
	var valuesQuery = {};

	UserValue.find({}, function (err, userValues){
		for (var i = userValues.length - 1; i >= 0; i--) {
			var value = userValues[i].value;
			valuesQuery[value] = userValues[i].query;
			Value.findById(value, function (err, v){
				Query.find({_id: {$in: valuesQuery[v._id]}}, function(err, queries){
					for (var j = queries.length - 1; j >= 0; j--) {
						job = agenda.create('analyzeTwitter', {value:v.name, keyword:queries[j].queryStr});
						job.repeatEvery('16 minutes').save();
					};
				});
			});
		};
		agenda.start();
	});
}