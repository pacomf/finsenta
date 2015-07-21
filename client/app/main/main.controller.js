'use strict';

angular.module('finsentaApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.awesomeThings = [];
    $scope.quote = [];

    $scope.items = [
      { id: 'ITX.MC', name: 'Inditex' }
    ];
    $scope.selectedOption = $scope.items[0];

    reloadGraph($scope.items[0].id, $scope.items[0].name);

    $scope.changedValue = function (item) {
      $scope.selectedOption = item;
      alert($scope.selectedOption.id);
      reloadGraph($scope.selectedOption.id, $scope.selectedOption.name);
    }

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });

    //var keywordTweets = "inditex"
    //var urlTweet = "https://twitter.com/statuses/"

    //$http.get('/api/things/tweets/'+ keywordTweets).success(function(tweets) {
        //console.log ("Encontre: "+tweets.statuses.length);
        //$scope.tweets = tweets.statuses;
        /*for (var i in tweets.statuses){
          var url = urlTweet+tweets.statuses[i].id_str;
          console.log(tweets.statuses[i].text);
        }*/
    //});


    //var textSentimental = "Hoy es un día muy bonito y me gusta mucho la comida. Estoy muy feliz.";

    /*$http.post('/api/things/alchemy', {'text': textSentimental}).success(function(result) {
        console.log ("Termino: "+result);
    });*/

    /*$http.post('/api/things/rss', {'url': 'url'}).success(function(result) {
        console.log ("Termino: "+result);
    });*/

    function reloadGraph(companyID, companyName) {

    $http.get('/api/things/quote/'+ companyID).success(function(quotes) {


        var lastDate = quotes[quotes.length-1].date;
        var firstDate = quotes[0].date;
        $http.get('/api/sentiment/sentimental', { params: { 'id': '55a2543fd60126250c03b7d0', 'init_date': firstDate, 'end_date': lastDate }}).success(function(sentimentalData) {
            console.log(sentimentalData);
            $scope.sentimentalData = sentimentalData;
            /*for (var i in tweets.statuses){
              var url = urlTweet+tweets.statuses[i].id_str;
              console.log(tweets.statuses[i].text);
            }*/

            var stock = [];
            var positiveActions = [];
            var negativeActions = [];
            var minimumStock = 99999;
            for (var i in quotes){
              stock.push([(new Date(quotes[i].date)).getTime(), quotes[i].close]);
              var score = searchInfoByDate(sentimentalData, new Date(quotes[i].date));
              console.log("Score:");
              console.log(score);
              score = score * 28;
              if (score >= 0) {
                positiveActions.push([(new Date(quotes[i].date)).getTime(), score]);
              } else {
                negativeActions.push([(new Date(quotes[i].date)).getTime(), -score]);
                //negativeActions.push([(new Date(quotes[i].date)).getTime(), quotes[i].close/1.07]);
              }
              if (minimumStock > quotes[i].close){
                minimumStock = quotes[i].close - 5;
              }
            }

            Highcharts.setOptions({
              global : {
                  useUTC : false
              }
            });

            // Create the chart
            $('#container').highcharts('StockChart', {
                chart : {
                    events : {
                        load : function () {

                            // set up the updating of the chart each second
                            /*var stockS = this.series[0];
                            var pAS = this.series[1];
                            var nAS = this.series[2];
                            var i = 1;
                            setInterval(function () {
                                var x = (new Date()).getTime()+(86400000*i++), // current time
                                    y = Math.round(Math.random() * 5);
                                stockS.addPoint([x, y], true, true);
                                pAS.addPoint([x, y/1.05], true, true);
                                nAS.addPoint([x, y/1.1], true, true);
                                // TODO: Ajustar minimumStock si es necesario y actualizar yAxis.min
                            }, 1000);*/
                        }
                    }
                },

                rangeSelector : {
                    inputEnabled: false,
                    selected : 1
                },

                title : {
                    text : companyName + ' Stock'
                },

                xAxis: {
                  title: {
                      text: 'Date'
                  }
                },

                yAxis: {
                    title: {
                        text: 'Stock Cotization'
                    },
                    min: minimumStock
                },

                series : [{
                            name : 'Close',
                            data : stock,
                            tooltip: {
                                valueDecimals: 4
                            }
                          },
                          {
                            type: 'column',
                            name: 'Positive Actions',
                            data: positiveActions,
                            color: '#5fc75f',
                            tooltip: {
                                valueDecimals: 4
                            }
                          },
                          {
                            type: 'column',
                            name: 'Negative Actions',
                            data: negativeActions,
                            color: '#bf2600',
                            tooltip: {
                                valueDecimals: 0
                            }
                          }]
            });
          

        });
    });
    }

    function searchInfoByDate(arr, date) {
      console.log("Dateeee");
      console.log(date);
      for (var i = arr.length - 1; i >= 0; i--) {
        var mDate = new Date(arr[i].date);
        if (areEquals(date, mDate)) {
          console.log("mDate");
          console.log(mDate);
          console.log(arr[i]);
          return arr[i].value;
        }
      };
      return 0;
    }

    function areEquals(date1, date2) {
      var dateOne = new Date(date1);
      dateOne.setHours(0,0,0,0);
      var dateTwo = new Date(date2);
      dateTwo.setHours(0,0,0,0);
      /*console.log("*******");
      console.log(dateOne);
      console.log(dateTwo);
      console.log("*-----*");*/
      if(dateOne.getTime() === dateTwo.getTime()) {
        return true;
      }
      return false;
    }

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    }; 
  });
