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

function handleError(res, err) {
  return res.send(500, err);
}

var yahooFinance = require('yahoo-finance');

exports.quote = function(req, res) {
  yahooFinance.historical({
    symbol: req.params.id,
    from: '2015-07-01',
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

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
