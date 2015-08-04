'use strict';

var Agenda = require('agenda');
var AnalysisController = require('../api/sentiment/analysis.controller');

var UserValue = require('../api/sentiment/uservalue.model');
var KeyGroup = require('../api/sentiment/keygroup.model');
var KeyData = require('../api/sentiment/keydata.model');
var Value = require('../api/sentiment/value.model');
var Query = require('../api/sentiment/query.model');

var config = require('./config');

var U = require('../api/sentiment/utilities');

var async = require('async');

var Jsonfile = require('jsonfile')
 
var fileJSON = './server/tasks/tmp/dataJobs.json';

var dateTweets = null;

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

	if (config.mockMode === 1){
		console.log("Mock Mode ENABLE: Jobs Disable");
		this.loadTwitterMock();
		return;
	}

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
  		loadTwitter();
	})
	
}

var twitter = require('twitter');

var client = new twitter({
  consumer_key: 'DLIgci0tLnFkRbJ8MCdbp1T8g',
  consumer_secret: 'p9OuQWzstr09UFG0i86gH9TpeofnRiYaAKDQBf7PYVC6NWGuD7',
  access_token_key: '526390388-NQfg0jStetPZ7MevxnLcYhweiYs10rouEgVOi0KZ',
  access_token_secret: 'ihm3MHXD7AWj9fbnKgXDd5WxEHJ4V5aGCEvul8iduEzNm'
});

exports.loadTwitterMock = function (){

	var value = "IDR.MC";

	var tweetsMock = [];
	var tMock = {"text":"Esto es un tweet de prueba",
				 "user":{
				 	"profile_image_url":"https://pbs.twimg.com/profile_images/584641368598929408/4TYLDoM5_400x400.jpg",
				 	"name": "Paco Martín",
				 	"screen_name": "pacomartinfdez"
				 },
				 "id_str":"250075927172759552",
				 "created_at":new Date()
				 };


	tweetsMock.push(tMock);
	tweetsMock.push(tMock);

	if (value === "IDR.MC"){
		tweetsMock = [];
		tMock = {"text":"Uuuuuuuuuuuuuuuuuuuuuu",
				 "user":{
				 	"profile_image_url":"https://pbs.twimg.com/profile_images/584641368598929408/4TYLDoM5_400x400.jpg",
				 	"name": "Dr Martín",
				 	"screen_name": "pacomartinfdez"
				 },
				 "id_str":"250075927172759552",
				 "created_at":new Date()
				 };
		 tweetsMock.push(tMock);
		 tweetsMock.push(tMock);

	}

	var tweetsParser=[];
	var auxTweet = {};
	var countMock = 2;

	for (var i = tweetsMock.length - 1; i >= 0; i--) {
		auxTweet.text=tweetsMock[i].text;
		auxTweet.profile_image_url = tweetsMock[i].user.profile_image_url;
		auxTweet.name = tweetsMock[i].user.name;
		auxTweet.screen_name = tweetsMock[i].user.screen_name;
		auxTweet.id_str = tweetsMock[i].id_str;
		auxTweet.created_at = formatDatePretty(tweetsMock[i].created_at);
		tweetsParser.push(auxTweet);
	}

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
		newJson.tweets = tweetsParser;
		newJson.num = countMock;
		U.lastTweetInfo.unshift(newJson);
		index = 0;
	} else {
      	U.lastTweetInfo[index].num += countMock;
		U.lastTweetInfo[index].tweets = U.lastTweetInfo[index].tweets.concat(tweetsParser);
	}
	//console.log(U.lastTweetInfo);

	return;
}

function searchTweets (value, keyword, done){

	client.get('search/tweets', {q: keyword}, function(error, tweets, response){
		if (error){
			console.log("Error Twitter: "+error.name+"|"+error.message+". Tweets: "+tweets);
			done();
			return;
		}
		console.log("Nuevos Tweets para: "+value);

		var tweetsParser=[];
		
		for (var i = tweets.statuses.length - 1; i >= 0; i--) {
			var auxTweet = {};
			auxTweet.text=tweets.statuses[i].text;
			auxTweet.profile_image_url = tweets.statuses[i].user.profile_image_url;
			auxTweet.name = tweets.statuses[i].user.name;
			auxTweet.screen_name = tweets.statuses[i].user.screen_name;
			auxTweet.id_str = tweets.statuses[i].id_str;
			auxTweet.created_at = formatDatePretty(tweets.statuses[i].created_at);
			tweetsParser.push(auxTweet);
		}

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
			newJson.tweets = tweetsParser;
			newJson.num = tweets.search_metadata.count;
			U.lastTweetInfo.unshift(newJson);
			index = 0;
		} else {
          	U.lastTweetInfo[index].num += tweets.search_metadata.count;
			U.lastTweetInfo[index].tweets = tweetsParser;
		}
		done();
	});

}

exports.loadTwitter = function(){

	if (config.mockMode === 1){
		console.log("Mock Mode ENABLE: Twitter Mock");
		this.loadTwitterMock();
		return;
	}

	var agenda = new Agenda();
	agenda.database('localhost:27017/finsenta-jobs', 'finsentaJobs');
	agenda._db._emitter._maxListeners = 0;

	var job;

	agenda.define('analyzeTwitter', function(job, done) {
		var data = job.attrs.data;
  		var nameV = data.nameV;
  		var keyword = data.keyword;
  		searchTweets(nameV, keyword, done);
	});

	var valuesQuery = {};

	UserValue.find({}, function (err, userValues){
		for (var i = userValues.length - 1; i >= 0; i--) {
			var value = userValues[i].value;
			if ((valuesQuery[value] === null) || (valuesQuery[value] === undefined)){
				valuesQuery[value] = [];
			}
			valuesQuery[value] = valuesQuery[value].concat(userValues[i].query);
		}
		for (var key in valuesQuery) {
			Value.findById(key, function (err, v){
				var nameV = v.name;
				Query.find({'_id': {$in: valuesQuery[v._id]}}, function(err, queries){
					if (queries !== undefined){
						for (var j = queries.length - 1; j >= 0; j--) {
							job = agenda.create('analyzeTwitter', {nameV:nameV, keyword:queries[j].queryStr});
							job.repeatEvery('16 minutes').save();
						};
					}
				});
			});
		};
		agenda.define('updateParamsTwitter', function(job, done) {
			//console.log("Seteando numero total de Tweets");
			for (var key in U.lastTweetInfo){
				U.lastTweetInfo[key].num = 0;
			}
			done();
		});

		job = agenda.create('updateParamsTwitter', {});
		job.repeatEvery('1 day').save();
		agenda.start();
	});
}

function formatDatePretty(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        seconds = '' +d.getSeconds(),
        minutes = '' + d.getMinutes(),
        hours = '' + d.getHours();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;
    if (seconds.length < 2) seconds = '0' + seconds
    var dateStr = day+"/"+month+"/"+year+" "+hours+":"+minutes;

    return dateStr;
}
