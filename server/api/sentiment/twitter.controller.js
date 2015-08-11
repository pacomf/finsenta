var request = require('request');
var config = require('../../tasks/config');
var moment = require('moment');
var TwitterResult = require('./twitterresult.model');
var jsonsafeparse = require('json-safe-parse');

// 'threshold': es el limte para que salte la alerta de 0 a 1. Ej: 0.2 es un 20% de margen, es decir la alerta salta si
//              hay el último analisis tiene un 20% más (o menos) de tweets respecto a la media de los últimos 30 días.
exports.detectTwitterAlert = function(idQuery, keyword, threshold){

	if (config.mockMode === 1){
	    console.log("Mock Mode ENABLE: Analyze Twitter Disable");
	    return;
  	}

	var today = moment();
	var monthAgo = moment().subtract(30, 'days');
	TwitterResult.find({query: idQuery, date: {$gt: monthAgo}}).sort({date: -1}).exec(function (err, results){
		if (results !== null && results !== undefined && results.length > 0){
			var media = 0;
			for (var i = results.length - 1; i >= 1; i--) {
				media += results[i].total;
			};
			if (media > 0)
				media /= results.length;
			var limiteInferior = media - (media*threshold);
			var limiteSuperior = media + (media*threshold);
			var lastAnalysis = results[0].total;
			var lastDate = moment(results[0].date);
			var alert = false;
			if (limiteInferior > lastAnalysis){
				//console.log("Alerta INFERIOR");
				alert = true;
			} else if (limiteSuperior < lastAnalysis){
				//console.log("Alerta SUPERIOR");
				alert = true;
			}
			if (alert){ // Recuperamos 20 tweets analizados sentimentalmente acerca del Query y cuyos twitteros tenga más de 500 followers
				var query = 'q='+keyword+' posted:'+lastDate.format('YYYY-MM-DD')+' followers_count:500'+'&size=1';
				request('https://'+config.userTwitterIBM +':'+config.passTwitterIBM+'@cdeservice.mybluemix.net:443/api/v1/messages/search?'+query, function (error, response, body) {
				    if (!error && response.statusCode == 200) {
				    	var data = jsonsafeparse(body); // NO uso JSON.parse, porque el JSON a parsear tiene campos vacios que detecta como FALLOS
				    	var tweets = data.tweets;
				    	// Info Tweets:
				    	// Texto Tweet: tweets[i].message.body
				    	// URL del Tweet: tweets[i].message.link
				    	// Numero total de FAV: tweets[i].message.favoriteCount
				    	// Numero total de RT: tweets[i].message.retweetCount
				    	// Fecha de Publicacion: tweets[i].message.postedTime
				    	// Nombre del Twittero: tweets[i].message.actor.displayName
				    	// URL Imagen del Twittero: tweets[i].message.actor.image 
				    	// Sentimiento ["POSITIVE" | "NEGATIVE" | "NEUTRAL" | "AMBIVALENT"]: tweets[i].cde.content.sentiment.polarity

				    	//OJO: Si queremos saber el número total de tweets con cada sentimiento
						//countSentimentalTweets(idQuery, keyword);
				     }
				});
			}
		}
	});

}

exports.countTweets = function (idQuery, keyword, done){

	var today = moment();
	var yesterday = moment().subtract(1, 'days');
	var query = 'q='+keyword+' posted:'+yesterday.format('YYYY-MM-DD')+","+today.format('YYYY-MM-DD');
	request('https://'+config.userTwitterIBM +':'+config.passTwitterIBM+'@cdeservice.mybluemix.net:443/api/v1/messages/count?'+query, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	    	var data = JSON.parse(body);
	    	var twitterResult = new TwitterResult();
            twitterResult.date = today;
            twitterResult.total = data.search.results;
            twitterResult.query = idQuery;
            twitterResult.save();
            done();
	     }
	});
}

exports.countSentimentalTweets = function (idQuery, keyword){

	var today = moment();
	var yesterday = moment().subtract(1, 'days');
	var query = 'q='+keyword+' posted:'+yesterday.format('YYYY-MM-DD')+","+today.format('YYYY-MM-DD')+" sentiment:positive";
	var ret = {};
	request('https://'+config.userTwitterIBM +':'+config.passTwitterIBM+'@cdeservice.mybluemix.net:443/api/v1/messages/count?'+query, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	    	var data = JSON.parse(body);
	    	ret.positive = data.search.results;
	    	ret.total = ret.positive;
	    	query = 'q='+keyword+' posted:'+yesterday.format('YYYY-MM-DD')+","+today.format('YYYY-MM-DD')+" sentiment:negative";
	    	request('https://'+config.userTwitterIBM +':'+config.passTwitterIBM+'@cdeservice.mybluemix.net:443/api/v1/messages/count?'+query, function (error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	var data = JSON.parse(body);
			    	ret.negative = data.search.results;
			    	ret.total += ret.negative;
			    	query = 'q='+keyword+' posted:'+yesterday.format('YYYY-MM-DD')+","+today.format('YYYY-MM-DD')+" sentiment:neutral";
			    	request('https://'+config.userTwitterIBM +':'+config.passTwitterIBM+'@cdeservice.mybluemix.net:443/api/v1/messages/count?'+query, function (error, response, body) {
					    if (!error && response.statusCode == 200) {
					    	var data = JSON.parse(body);
					    	ret.neutral = data.search.results;
					    	ret.total += ret.neutral
					    	query = 'q='+keyword+' posted:'+yesterday.format('YYYY-MM-DD')+","+today.format('YYYY-MM-DD')+" sentiment:ambivalent";
					    	request('https://'+config.userTwitterIBM +':'+config.passTwitterIBM+'@cdeservice.mybluemix.net:443/api/v1/messages/count?'+query, function (error, response, body) {
							    if (!error && response.statusCode == 200) {
							    	var data = JSON.parse(body);
							    	ret.ambivalent = data.search.results;
							    	ret.total += ret.ambivalent;
							    	var twitterResult = new TwitterResult();
						            twitterResult.date = today;
						            twitterResult.sentiment = true;
						            twitterResult.total = ret.total;
						            twitterResult.query = idQuery;
						            twitterResult.positive = ret.positive;
						            twitterResult.negative = ret.negative; 
						            twitterResult.neutral = ret.neutral;
						            twitterResult.ambivalent = ret.ambivalent;
						            twitterResult.save();
							     }
							});
					     }
					});
			     }
			});
	     }
	});
}