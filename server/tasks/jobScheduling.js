'use strict';

var Agenda = require('agenda');
var AnalysisController = require('../api/sentiment/analysis.controller');

var UserValue = require('../api/sentiment/uservalue.model');
var KeyGroup = require('../api/sentiment/keygroup.model');
var KeyData = require('../api/sentiment/keydata.model');
var Value = require('../api/sentiment/value.model');

var async = require('async');

var Jsonfile = require('jsonfile')
 
var fileJSON = './server/tasks/tmp/dataJobs.json'

exports.scheduleRss = function (){

	var dataJobs = [];

	KeyData.find({}, function (err, keyDatas){
		async.eachSeries(keyDatas, function(keyData, callbackKD) {
			KeyGroup.find({keyData: keyData._id}, function (err, keyGroups){
				async.eachSeries(keyGroups, function(keyGroup, callbackKG) {
					UserValue.find({keyGroup: keyGroup._id}, function (err, userValues){
						dataJobs.push({keyDataId:keyData._id, urlRss:keyData.keyData, userValues: userValues});	
						callbackKG();					
					})
		          	
		        }, function(err){
		        	callbackKD();
		        });
			})
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

	// TODO, QUITAR
	agenda.purge(function(err, numRemoved) {});

	agenda.define('analyzeRss', function(job, done) {
  		var data = job.attrs.data;
  		console.log("Hola: "+data.urlRss);
  		done();
  		//AnalysisController.readAndProcessRss(data.keyDataId, data.urlRss, data.userValues, done);
	});

	var job;

	Jsonfile.readFile(fileJSON, function(err, obj) {
  		for (var i = obj.length - 1; i >= 0; i--) {
  			job = agenda.create('analyzeRss', {keyDataId:obj[i].keyDataId, urlRss:obj[i].urlRss, userValues: obj[i].userValues});
			job.repeatEvery('10 minutes').save();
			console.log("Job!: "+i);
  		};
  		agenda.start();
  		console.log("Jobs creados!");
	})
	
}