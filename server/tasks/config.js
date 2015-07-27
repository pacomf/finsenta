'use strict';

var ImportController = require('../api/import/import.controller');
var ScheduleController = require('./jobScheduling');

var alchemyLimit = 0;

exports.maxAlchemyLimit = 1000;

exports.alchemyLimit = alchemyLimit;

exports.lastDateAnalysis = null;

exports.init = function(app){

	// IMPORTANTE: PARA RELLENAR LA BBDD, HACER LOS SIGUIENTES PASOS DE FORMA SERIAL (LANZAR HACER UNO PARAR, LANZAR HACER OTRO PARAR...)
	// 1) importData
    // 2) scheduleRss
    // 3) loadJobs


	//ImportController.importData('./import.json');

	// OJO: Cuidado con esto que si hacemos un 'grunt serve' al estar modificando el fichero .json,
	// recargara de forma infinita el sistema. Ejecutar y cuando salga mensajito de Jobs creados, parar.
	//ScheduleController.scheduleRss();

	//ScheduleController.loadJobs();
	ScheduleController.loadTwitter();
}