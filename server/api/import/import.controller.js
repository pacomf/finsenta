'use strict';

var UserValue = require('../sentiment/uservalue.model');
var KeyGroup = require('../sentiment/keygroup.model');
var KeyData = require('../sentiment/keydata.model');
var Query = require('../sentiment/query.model');
var Value = require('../sentiment/value.model');
var Index = require('../sentiment/index.model');

var async = require('async');

exports.importData = function (file){

	var json = require(file);

	var keydatas = json.keydata;
	var indexData = json.index;
	var values = json.values;

	importIndex(indexData, keydatas, values);	
}

function importIndex(indexData, keydatas, values){
	async.eachSeries(indexData, function(index, callback){
		var name = index.name;
		var description = index.description;
	 	Index.findOne({"name":index.name}, function (err, ind){
	 		if ((ind === null) || (ind === undefined)){
	 			ind = new Index();
	 			ind.name = name;
	 			ind.description = description;
	 			ind.save(function(err, product, numberAffected){
			 		callback();
			 	});
	 		} else {
	 			callback();
	 		}
	 	});
	}, function(err){
		importKeyData(keydatas, values);
	});
}

function importKeyData(keydatas, values){
	async.eachSeries(keydatas, function(keydata, callback){
		var group = keydata.group;
		var url = keydata.url;
		var weight = keydata.weight;
		KeyData.findOne({"keyData": url}, function(err, kd){
			if ((kd === null) || (kd === undefined)){
				var keyd = new KeyData();
				keyd.keyData = url;
				keyd.weight = weight;
				keyd.save();
				kd = keyd;
			}
			KeyGroup.findOne({"type":group}, function(err, kg){
				if ((kg !== null) && (kg !== undefined)){
					 if (!searchObjectInArray(kg.keyData, kd._id)){
					 	kg.keyData.push(kd._id);
					 	kg.save(function(err, product, numberAffected){
					 		callback();
					 	});
					 } else {
					 	callback();
					 }
				} else{
					 var keyg = new KeyGroup();
					 keyg.type = group;
					 keyg.keyData = [];
					 keyg.keyData.push(kd._id);
					 keyg.save(function(err, product, numberAffected){
					 	callback();
					 }); 
				}
			});
		});
	}, function(err){
		importValues(values);
	}); 
}

function importValues(values){
	async.eachSeries(values, function(valueData, callback){
		var name = valueData.name;
		var description = valueData.description;
		var query = valueData.query;
		var index = valueData.index;
		Value.findOne({"name":name}, function (err, value){
			if ((value === null) || (value === undefined)){
				Index.findOne({"name":index}, function (err, ind){
					if ((ind !== null) || (ind !== undefined)){
						value = new Value();
						value.name = name;
						value.description = description;
						value.index = ind._id;
						value.save();
					}
					importUserValue(query, value, callback);
				});
			} else {
				importUserValue(query, value, callback);
			}
		});
	}, function(err){
	    console.log("Datos Importados con éxito");
	});
}

function importUserValue(query, value, callback){
	async.eachSeries(query, function(queryData, callbackQ){
		var group = queryData.keygroup;
		var keywords = queryData.keywords;
		var queryIds = [];
		async.eachSeries(keywords, function(keyword, callbackKS){
			Query.findOne({"queryStr":keyword.name}, function(err, q){
				if ((q !== null) && (q !== undefined)){
					queryIds.push(q._id);
				}
				callbackKS();
			});
		}, function(err){
		    KeyGroup.findOne({"type":group}, function(err, kg){
				if ((kg !== null) && (kg !== undefined)){
					UserValue.find({"value":value._id, "keyGroup": kg._id}, function (err, uvs){
						if (!searchSameQueryInUserValue(uvs, queryIds)){
							var userValue = new UserValue();
							userValue.value = value._id;
							userValue.query = [];
							userValue.keyGroup = kg._id;
							async.eachSeries(keywords, function(keyword, callbackK){
								Query.findOne({"queryStr":keyword.name}, function(err, q){
									if ((q === null) || (q === undefined)){
										q = new Query();
										q.queryStr = keyword.name;
										q.save();
									}
									userValue.query.push(q._id);
									userValue.save(function(err, product, numberAffected){
								 		callbackK();
								 	}); 
								});
							}, function(err){
							    callbackQ();
							}); 
						} else {
							callbackQ();
						}
					});
				} else {
					callbackQ();
				}
			});
		}); 
	}, function(err){
	    callback();
	});
}

function searchObjectInArray(arr, value) {
  for (var i=0; i<arr.length; i++) {
    if (arr[i].toString() === value.toString()){
    	return true;
    }
  }
  return false;
}

function searchSameQueryInUserValue(userValues, queries) {
	if ((userValues === null) || (userValues === undefined)){
		return false;
	}
	for (var k = userValues.length - 1; k >= 0; k--) {
	  var find = 0;
	  for (var i = queries.length - 1; i >= 0; i--) {
	  	for (var j=0; j<userValues[k].query.length; j++) {
		    if (userValues[k].query[j].toString() === queries[i].toString()){
		    	find++;
		    }
		}
	  }
	  // TODO: ¿Controlar tambien que sea el mismo userValue.query que queries?, o sea que no haya query de más en UserValues
	  // Para eso solo añadir otra condicion al if: (queries.length === userValues[k].query.length)
	  if ((find === queries.length) && (queries.length > 0))
	  	return true;
	}
	return false;
}