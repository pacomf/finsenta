'use strict';

var KeyData = require('./keydata.model');
var KeyGroup = require('./keygroup.model');
var Query = require('./query.model');
var SearchResult = require('./searchresult.model');
var UserValue = require('./uservalue.model');

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

        //var cleanText = data.replace(reCleanText, "");
        var AlchemyAPI = require('../../alchemyapi_node/alchemyapi');
        var alchemyapi = new AlchemyAPI();
        alchemyapi.sentiment("text", cleanText, {}, function(response) {
          console.log("Sentiment: " + response["docSentiment"]["type"]);
          // response["docSentiment"]["type"] = [positive, negative, neutral]
          var searchResult = new SearchResult();
          searchResult.value = value;
          searchResult.query = q._id;
          searchResult.keyData = keyDataId;
          searchResult.urlResult = url;
          searchResult.sentimentalResult = response["docSentiment"]["type"];
          searchResult.analysisDate = new Date();
          searchResult.dataDate = date;
          searchResult.save();
        });

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