'use strict';

var ImportController = require('../api/import/import.controller');
var ScheduleController = require('./jobScheduling');

var alchemyLimit = 0;

exports.maxAlchemyLimit = 1000;

exports.alchemyLimit = alchemyLimit;

exports.lastDateAnalysis = null;

exports.mockMode = 0;

exports.userTwitterIBM = '6d6ef7ab1e0144c720edbc5a40520f77';
exports.passTwitterIBM = 'klPS0QAtKS';

exports.init = function(app){

	// IMPORTANTE: PARA RELLENAR LA BBDD, HACER LOS SIGUIENTES PASOS DE FORMA SERIAL (LANZAR HACER UNO PARAR, LANZAR HACER OTRO PARAR...)
	// 1) importData
    // 2) scheduleRss
    // 3) loadJobs (Tambien cargar Twitter)

	// Para poner el Modo Mock, y no hacer llamadas a servicios web externos con peticiones limitadas (1=activado)
	this.mockMode = 1;


	//ImportController.importData('./import.json');

	// OJO: Cuidado con esto que si hacemos un 'grunt serve' al estar modificando el fichero .json,
	// recargara de forma infinita el sistema. Ejecutar y cuando salga mensajito de Jobs creados, parar.
	//ScheduleController.scheduleRss();

	ScheduleController.loadJobs();

	// Pruebas Twitter Insights
	//console.log("Pruebas con TWITTER");
	//ScheduleController.loadTwitterIBM();
	//var TwitterController = require('../api/sentiment/twitter.controller');
	//TwitterController.detectTwitterAlert("55b56069088f7fc40a0c7f7e", "google", 0.2);
}

