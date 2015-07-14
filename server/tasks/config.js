'use strict';

var ImportController = require('../api/import/import.controller');
var ScheduleController = require('./jobScheduling');

exports.init = function(app){
	//console.log("Importando Datos...");
	//ImportController.importData('./import.json');

	console.log("Lanzando Tareas...");
	//ScheduleController.scheduleRss();
	ScheduleController.loadJobs();
}