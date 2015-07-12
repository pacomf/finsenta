'use strict';

var KeyData = require('./keydata.model');
var KeyGroup = require('./keygroup.model');
var Query = require('./query.model');
var SearchResult = require('./searchresult.model');
var UserValue = require('./uservalue.model');
var async = require('async');

var arrayResult = [];

exports.readRss = function (keyDataId, urlRss, value, query){
  var FeedParser = require('feedparser')
  , request = require('request');

  var req = request(urlRss)
  , feedparser = new FeedParser();

  req.on('error', function (error) {
    // handle any request errors
  });
  req.on('response', function (res) {
    var stream = this;

    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

    stream.pipe(feedparser);
  });


  feedparser.on('error', function(error) {
    // always handle errors
  });
  feedparser.on('readable', function() {
    // This is where the action is!
    var stream = this
      , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
      , item;

    while (item = stream.read()) {
      // TODO: Buscar si el analisis de la noticia ya existe en BBDD (value-query-item.link-item.date)
      parseDataRss(keyDataId, item.description, item.link, new Date(item.date), value, query);
    }
  });


}

function parseDataRss(keyDataId, data, url, date, value, query){
  Query.findById(query, function (err, q) {
      var reSearch = new RegExp(q.queryStr, "i");
      if (data.search(reSearch) !== -1){
        //var reCleanText = new RegExp(/<\/?[^>]+(>|$)/, "g");

        var cleanText = data.replace(/<\/?[^>]+(>|$)/g, "");

        SearchResult.findOne({
          'query': q._id,
          'urlResult': url
        }, function(err, resultFound) {
            if (resultFound === null || resultFound === undefined) {
              var AlchemyAPI = require('../../alchemyapi_node/alchemyapi');
              var alchemyapi = new AlchemyAPI();
              alchemyapi.sentiment_targeted("text", cleanText, q.queryStr, {}, function(response) {
                console.log(response);
                console.log("Sentiment: " + response["docSentiment"]["type"]);
                console.log("Score    : " + response["docSentiment"]["score"]);
                // response["docSentiment"]["type"] = [positive, negative, neutral]
                var searchResult = new SearchResult();
                searchResult.value = value;
                searchResult.query = q._id;
                searchResult.keyData = keyDataId;
                searchResult.urlResult = url;
                searchResult.language = response["language"];
                searchResult.score = response["docSentiment"]["score"];
                searchResult.sentimentalResult = response["docSentiment"]["type"];
                searchResult.analysisDate = new Date();
                searchResult.dataDate = date;
                searchResult.save(); 
              });
            } else {
              console.log(resultFound);
              console.log("Sentiment: " + resultFound.sentimentalResult);
              console.log("Score    : " + resultFound.score);
            }
          }
        );
    }
  });


}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}


function getDataByQueryId (callbackB, queryId, initDate, endDate) {

  console.log("Estoy");
  var iDate = new Date(initDate);
  iDate.setHours(0,0,0,0);
  var eDate = new Date(endDate);
  eDate.setHours(0,0,0,0);
  var result = [];
  var days = [];
  var loopTime = iDate;

  while(loopTime < eDate)
  {
      var localTime = new Date(loopTime);
      loopTime.setHours(0,0,0,0);
            days.push(localTime);
      loopTime.setDate(loopTime.getDate() + 1);
      console.log("-----------");
      console.log(loopTime);
      console.log(eDate);
      console.log(days);
      
  }
  console.log(days);
  //use loopDay as you wish
  async.eachSeries(days, function(day, callback) {
      console.log(queryId);
      var lastDate = new Date();
      lastDate.setDate(day.getDate()+1)
      lastDate.setHours(0,0,0,0);

      SearchResult.find({
        "query" : queryId,
        dataDate : {
          "$gte": day,
          "$lt": lastDate
        }
      }, function (err, searchR) {
        if (err) {
          console.log("searchR error");
          callback(err);
        }
        else if (searchR === undefined || searchR === null || searchR.length === 0) {
          console.log("searchR undefined");
          callback();
        } else {
          console.log("SearchR");
          console.log(searchR);
          var data = {};
          data["value"] = 0;
          var num_positives = 0;
          var num_negatives = 0;
          var num_neutrals = 0;
          for (var i = searchR.length - 1; i >= 0; i--) {
            if (searchR[i].sentimentalResult === 'positive') {
              num_positives++;
              data["value"] = data["value"] + Number(searchR[i].score);
            } else if (searchR[i].sentimentalResult === 'negative') {
              num_negatives++;
              data["value"] = data["value"] + Number(searchR[i].score);
            } else {
              num_neutrals++;
            }
            data["date"] = searchR[i].dataDate;
            console.log("datDateeee : " + data["date"]);
          }
          var infoData = {};
          infoData["positives"] = num_positives;
          infoData["negatives"] = num_negatives;
          infoData["neutrals"] = num_neutrals;
          console.log("Info Data: ");
          console.log(infoData);
          data["infoData"] = infoData;
          result.push(data);
          callback();
        }

      });

    }, function(err){
      // if any of the file processing produced an error, err would equal that error
      if( err ) {
        // One of the iterations produced an error.
        // All processing will now stop.
        console.log('A file failed to process');
      } else {
        console.log(result);
        console.log('All files have been processed successfully');
        arrayResult = arrayResult.concat(result);
        //console.log("Pepeeeee");
        //console.log(arrayResult);
        callbackB();
      }
    });
    console.log("Algoooo");

  }

  /**
 * Recibe:
 *    req.query.id = El identificador de lo que queremos mostrar (UserValue or GroupUserValue)
 *    req.query.type = default : 0 -> UserValue;
 *                               1 -> GroupUserValue
 *    req.query.init_date = Fecha de inicio de la búsqueda
 *    req.query.end_date = Fecha de fin de la búsqueda
 */
exports.sentimentalAnalysis = function(req, res) {
  console.log(req.query);
  UserValue.findById(req.query.id, function (err, uservalue) {
    async.eachSeries(uservalue.query, function(query, callback) {
      console.log("Calllll");
      getDataByQueryId(callback, query, req.query.init_date, req.query.end_date);
    }, function(err){
      console.log("--" + arrayResult);
      res.json(200, arrayResult);
    });
  });
}
