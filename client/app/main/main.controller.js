'use strict';

angular.module('finsentaApp')
  .controller('MainCtrl', function ($scope, $http, $filter) {
    $scope.awesomeThings = [];
    $scope.quote = [];
    $scope.items = [];
    $scope.searchresults = [];

    // Recargamos la lista de posibles valores
    $http.get('/api/sentiment/value').success(function(values) {
      $scope.items = values;
      $scope.selectedOption = $scope.items[0];
      reloadGraph($scope.items[0].name, $scope.items[0].description);
    });

    $scope.changedValue = function (item) {
      $scope.selectedOption = item;
      reloadGraph(item.name, item.description);
    }

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

    $('#loaderSpinner').removeClass('spinner');
    $('.loader-overlay').removeClass('loaded');

    setTimeout(function() {
        $('#loaderSpinner').addClass('spinner');
    }, 200);
    

    // Obtenemos las noticias (searchresults)
    $http.get('/api/sentiment/searchresult').success(function(values) {
      $scope.searchresults = values;
      $scope.positiveresults = $filter('filter')($scope.searchresults, { sentimentalResult : 'positive' , value: $scope.selectedOption._id});
      $scope.neutralresults = $filter('filter')($scope.searchresults, { sentimentalResult : 'neutral' , value: $scope.selectedOption._id});
      $scope.negativeresults = $filter('filter')($scope.searchresults, { sentimentalResult : 'negative', value: $scope.selectedOption._id});
    });

    $http.get('/api/sentiment/tweetInfo/'+ companyID).success(function(info) {
      $scope.tweets = info.tweets;
      $scope.numTweets = (info.num !== undefined) ? info.num : 0;

      if(!$scope.$$phase) {
        $scope.$apply(function() {
            setTimeout(function() {
              animateNumber();
              liveTile();
            }, 1500);
        });
      } else {
          setTimeout(function() {
            animateNumber();
            liveTile();
          }, 1500);
      }
      
    });


    $http.get('/api/things/quote/'+ companyID).success(function(quotes) {
        var lastDate = quotes[quotes.length-1].date;
        var firstDate = quotes[0].date;
        $http.get('/api/sentiment/sentimental', { params: { 'valueName': companyID, 'init_date': firstDate, 'end_date': lastDate }}).success(function(sentimentalData) {

            $scope.sentimentalData = sentimentalData;

            var stock = [];
            var positiveActions = [];
            var negativeActions = [];
            var neutralActions = [];
            var holderActions = [];
            var minimumStock = 99999;
            var maximumStock = 0;

            var maxValues = 1

            for (var j in quotes) {
              if (quotes[j].close < minimumStock) {
                minimumStock = quotes[j].close;
              }
              if (quotes[j].close > maximumStock) {
                maximumStock = quotes[j].close;
              }

              var newSearch = searchInfoDataByDate(sentimentalData, new Date(quotes[j].date));
              if (newSearch !== undefined) {
                if ((newSearch.neutrals + newSearch.positives + newSearch.negatives) > maxValues) {
                  maxValues = newSearch.neutrals + newSearch.positives + newSearch.negatives;
                }
              }  

            };

            for (var i in quotes){

              stock.push([(new Date(quotes[i].date)).getTime(), quotes[i].close]);

              var valueNeutrals = 0;
              var valuePositives = 0;
              var valueNegatives = 0;

              var newSearch = searchInfoDataByDate(sentimentalData, new Date(quotes[i].date));
              if (newSearch !== undefined) {
                valueNeutrals = newSearch.neutrals;
                valuePositives = newSearch.positives;
                valueNegatives = newSearch.negatives; 
              }  

              var scoreP = searchPositiveScoreByDate(sentimentalData, new Date(quotes[i].date));
              var scoreN = searchNegativeScoreByDate(sentimentalData, new Date(quotes[i].date));

              console.log("MV: "+maxValues+"|MS: "+maximumStock+"|Close: "+quotes[i].close+"|S-VP: "+scoreP+"-"+valuePositives+"|S-VN: "+scoreN+"-"+valueNegatives+"|N: "+valueNeutrals);
              var ret = calculateValueWeighted(maxValues, minimumStock, maximumStock, quotes[i].close, (scoreP+valuePositives), (scoreN+valueNegatives), valueNeutrals);
              console.log("Hola: "+ret.positives+":"+ret.negatives+":"+ret.neutrals);
              
              

              positiveActions.push([(new Date(quotes[i].date)).getTime(), ret.positives]);
              negativeActions.push([(new Date(quotes[i].date)).getTime(), ret.negatives]);
              neutralActions.push([(new Date(quotes[i].date)).getTime(), ret.neutrals]);
              holderActions.push([(new Date(quotes[i].date)).getTime(), minimumStock]);
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

                          $('.loader-overlay').addClass('loaded');

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
                    enabled: false
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
                    min: minimumStock-1,
                    max: maximumStock+1
                },

                plotOptions: {
                    column: {
                        stacking: 'normal'
                    }
                },

                series : [
                          {
                            type: 'column',
                            name: 'Positive Actions',
                            data: positiveActions,
                            color: '#67a689',
                            tooltip: {
                                valueDecimals: 2
                            }
                          },
                          {
                            type: 'column',
                            name: 'Neutral Actions',
                            data: neutralActions,
                            color: '#9ac8f4',
                            tooltip: {
                                valueDecimals: 2
                            }
                          },
                          {
                            type: 'column',
                            name: 'Negative Actions',
                            data: negativeActions,
                            color: '#c75757',
                            tooltip: {
                                valueDecimals: 2
                            }
                          },
                          {
                            showInLegend: false, 
                            type: 'column',
                            data: holderActions,
                            color: "rgba(255,255,255,0)",
                            enableMouseTracking: false
                          },
                          {
                            name : 'Close',
                            data : stock,
                            tooltip: {
                                valueDecimals: 4
                            }
                          }
                          ]
            });
        });
      });
  }

    /*function searchInfoByDate(arr, date) {
      for (var i = arr.length - 1; i >= 0; i--) {
        var mDate = new Date(arr[i].date);
        if (areEquals(date, mDate)) {
          return arr[i].value;
        }
      }
    }*/

    function searchPositiveScoreByDate(arr, date) {
      if (arr != null) { 
        for (var i = arr.length - 1; i >= 0; i--) {
          var mDate = new Date(arr[i].date);
          if (areEquals(date, mDate)) {
            return arr[i].value_positives;
          }
        };
      }
      return 0;
    }

    function searchNegativeScoreByDate(arr, date) {
      if (arr != null) { 
        for (var i = arr.length - 1; i >= 0; i--) {
          var mDate = new Date(arr[i].date);
          if (areEquals(date, mDate)) {
            return arr[i].value_negatives;
          }
        };
      }
      return 0;
    }

    function searchInfoDataByDate(arr, date) {
      if (arr != null) { 
        for (var i = arr.length - 1; i >= 0; i--) {
          var mDate = new Date(arr[i].date);
          if (areEquals(date, mDate)) {
            return arr[i].infoData;
          }
        };
      }
      return undefined;
    }

    function calculateValueWeighted(maxValues, minStock, maxStock, stock, pos, neg, neu){
      var ret = {};
      var totalValue = pos+neg+neu;
      var weightValue = totalValue/maxValues;
      var range = maxStock-minStock;
      if (pos === 0){
        ret.positives = 0;
      } else {
        ret.positives = ((pos/totalValue)*range)*weightValue;
      }
      if (neg === 0){
        ret.negatives = 0;
      } else {
        ret.negatives = ((neg/totalValue)*range)*weightValue;
      }
      if (neu === 0){
        ret.neutrals = 0;
      } else {
        ret.neutrals = ((neu/totalValue)*range)*weightValue;
      }
        
      return ret;
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
