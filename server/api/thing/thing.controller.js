/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Thing = require('./thing.model');

// Get list of things
exports.index = function(req, res) {
  Thing.find(function (err, things) {
    if(err) { return handleError(res, err); }
    return res.json(200, things);
  });
};

// Get a single thing
exports.show = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    return res.json(thing);
  });
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  Thing.create(req.body, function(err, thing) {
    if(err) { return handleError(res, err); }
    return res.json(201, thing);
  });
};

// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Thing.findById(req.params.id, function (err, thing) {
    if (err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    var updated = _.merge(thing, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, thing);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    thing.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}

var yahooFinance = require('yahoo-finance');
var twitter = require('twitter');
var trends = require('node-google-search-trends');

var client = new twitter({
  consumer_key: 'DLIgci0tLnFkRbJ8MCdbp1T8g',
  consumer_secret: 'p9OuQWzstr09UFG0i86gH9TpeofnRiYaAKDQBf7PYVC6NWGuD7',
  access_token_key: '526390388-NQfg0jStetPZ7MevxnLcYhweiYs10rouEgVOi0KZ',
  access_token_secret: 'ihm3MHXD7AWj9fbnKgXDd5WxEHJ4V5aGCEvul8iduEzNm'
});

exports.quote = function(req, res) {
  yahooFinance.historical({
    symbol: req.params.id,
    from: '2014-01-01',
    to: formatDate(new Date()),
    // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
  }, function (err, quotes) {
    if(err) { return handleError(res, err); }

    return res.json(200, quotes);
  });

  /*var stocks = require('yahoo-finance-stream')({ frequency: 5000 });

    stocks.watch("AAPL"); // No funciona en IBEX, no se por que (problema de Yahoo)

    stocks.on('data', function(stock) {
      console.log('%s: %d', stock.symbol, stock.bid);
    });*/
    
};

exports.twitter = function(req, res){
    /*client.stream('statuses/filter', {track: req.params.keyword},  function(stream){
      stream.on('data', function(tweet) {
        console.log(tweet.text);
      });

      stream.on('error', function(error) {
        console.log(error);
      });
    });*/

    client.get('search/tweets', {q: req.params.keyword}, function(error, tweets, response){
      return res.json(200, tweets);
    });

    
}

exports.alchemy = function(req, res){
  var text = req.body.text;
  var AlchemyAPI = require('../../alchemyapi_node/alchemyapi');
  var alchemyapi = new AlchemyAPI();
  alchemyapi.sentiment("text", text, {}, function(response) {
    console.log("Sentiment: " + response["docSentiment"]["type"]);
    // response["docSentiment"]["type"] = [positive, negative, neutral]
    return res.json(200, 'ok');
  });
}

exports.rss = function(req, res){
  readRss('http://www.elblogsalmon.com/index.xml', "acs", "grecia");
}

function readRss(urlRss, value, query){
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
      parseDataRss(item.description, item.link, new Date(item.date), urlRss, value, query);
    }
  });
}

function parseDataRss(data, url, date, urlRss, value, query){
  console.log("Buscando...");
  var reSearch = new RegExp(query, "i");
  if (data.search(reSearch) !== -1){
    //var reCleanText = new RegExp(/<\/?[^>]+(>|$)/, "g");
    console.log("------ AQUI -----------");
    console.log(data);
    var cleanText = data.replace(/<\/?[^>]+(>|$)/g, "");
    console.log(cleanText);
    //var cleanText = data.replace(reCleanText, "");

  }
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