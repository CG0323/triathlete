angular.module('TriathleteApp.controllers', ['tc.chartjs'])
  .controller('triathletesController', function ($scope, dataAPI) {
    $scope.triathletesGroups = [];
    dataAPI.getTriathletes().success(function (response) {
      var group = []
      for (var i = 0; i < response.length; i++) {
        if (group.length == 3) {
          $scope.triathletesGroups.push(group);
          group = [];
        }
        group.push(response[i]);
      }
      if (group.length != 0) {
        $scope.triathletesGroups.push(group);
      }
    });
    $scope.viewDetail = function (id) {
      window.location.href = "#/" + id;
    }
    $scope.getLevelDesc = function (level) {
      if (level == "无") {
        return "运动员";
      }
      else {
        return level + "运动员";
      }
    }

  })
  .controller('triathleteDetailController', function ($scope, $routeParams, dataAPI) {
    $scope.id = $routeParams.id;
    $scope.triathleteResults = [];
    dataAPI.getTriathleteDetail($scope.id).success(function (response) {
      $scope.triathleteResults = response;
      var strength = analyzeStrength(response);
      // Chart.js Data
      $scope.data = {
        labels: ['游泳', 'T1', '自行车', 'T2', '跑步'],
        datasets: [
          {
            // label: 'My First dataset',
            fillColor: 'rgba(73,90,128,0.3)',
            strokeColor: 'rgba(73,90,128,1)',
            pointColor: 'rgba(73,90,128,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(73,90,128,1)',
            data: [strength.swim, strength.t1, strength.bike, strength.t2, strength.run]
          },
          {
            // label: 'My First dataset',
            fillColor: 'rgba(0,0,0,0)',
            strokeColor: 'rgba(0,0,0,0)',
            pointColor: 'rgba(0,0,0,0)',
            pointStrokeColor: 'rgba(0,0,0,0)',
            pointHighlightFill: 'rgba(0,0,0,0)',
            pointHighlightStroke: 'rgba(0,0,0,0)',
            data: [100, 100, 100, 100, 100]
          }
        ]
      };
    });
    
    

    // Chart.js Options
    $scope.options = {

      // Sets the chart to be responsive
      responsive: true,

      //Boolean - Whether to show lines for each scale point
      scaleShowLine: true,

      //Boolean - Whether we show the angle lines out of the radar
      angleShowLineOut: true,

      //Boolean - Whether to show labels on the scale
      scaleShowLabels: false,

      // Boolean - Whether the scale should begin at zero
      scaleBeginAtZero: true,

      //String - Colour of the angle line
      angleLineColor: 'rgba(0,0,0,.1)',

      //Number - Pixel width of the angle line
      angleLineWidth: 1,
      //String - Point label font declaration
      pointLabelFontFamily: '"Arial"',

      //String - Point label font weight
      pointLabelFontStyle: 'normal',

      //Number - Point label font size in pixels
      pointLabelFontSize: 10,

      //String - Point label font colour
      pointLabelFontColor: '#666',

      //Boolean - Whether to show a dot for each point
      pointDot: true,

      //Number - Radius of each point dot in pixels
      pointDotRadius: 3,

      //Number - Pixel width of point dot stroke
      pointDotStrokeWidth: 1,

      //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
      pointHitDetectionRadius: 20,

      //Boolean - Whether to show a stroke for datasets
      datasetStroke: false,
      //Number - Pixel width of dataset stroke
      datasetStrokeWidth: 2,

      //Boolean - Whether to fill the dataset with a colour
      datasetFill: true,
    };

    function analyzeStrength(results) {
      var target_results = results.filter(function (result) {
        return (result.sub_group.indexOf("全程") >= 0);
      });
      if (target_results.length > 0) {
        return analyzeStandardResults(target_results);
      };

      target_results = results.filter(function (result) {
        return (result.sub_group.indexOf("长距离") >= 0);
      });
      if (target_results.length > 0) {
        return analyzeLongDistanceResults(target_results);
      };

      target_results = results.filter(function (result) {
        return (result.sub_group.indexOf("半程") >= 0);
      });
      if (target_results.length > 0) {
        return analyzeHalfDistanceResults(target_results);
      };
    }

    function getSecondsFromString(input) {
      var tmp1 = "2015-01-01T" + input;
      var date1 = Date.parse(tmp1);
      if(isNaN(date1)){
        console.log(date1 + '========');
        return 9999999;
      }
      var tmp2 = "2015-01-01T00:00:00";
      var date2 = Date.parse(tmp2);
      return ((date1 - date2) / 1000);
    }

    function getScore(input, score_40_str, score_100_str) {
      console.log(input);
      var score_40 = getSecondsFromString(score_40_str);
      var score_100 = getSecondsFromString(score_100_str);
      if (input >= score_40) {
        return 40;
      };
      if (input <= score_100) {
        return 100;
      }
      return 100 - 60 * (input - score_100) / (score_40 - score_100);
    }
    function analyzeStandardResults(results) {
      var strength = {};
      var best = getBest(results);
      console.log(best);
      strength.swim = getScore(best.swim, "01:00:00", "00:20:00");
      strength.bike = getScore(best.bike, "01:50:00", "00:58:00");
      strength.run = getScore(best.run, "01:30:00", "00:38:00");
      strength.t2 = getScore(best.t2, "00:03:00", "00:00:40");
      strength.t1 = getScore(best.t1, "00:06:00", "00:00:59");
      return strength;
    }

    function analyzeLongDistanceResults(results) {
      var strength = {};
      var best = getBest(results);

      strength.swim = getScore(best.swim, "02:00:00", "00:40:00");
      strength.bike = getScore(best.bike, "03:40:00", "02:10:00");
      strength.run = getScore(best.run, "03:00:00", "01:18:00");
      strength.t2 = getScore(best.t2, "00:03:00", "00:00:40");
      strength.t1 = getScore(best.t1, "00:06:00", "00:00:59");
      return strength;
    }

    function analyzeHalfDistanceResults(results) {
      var strength = {};
      var best = getBest(results);

      strength.swim = getScore(best.swim, "00:30:00", "00:12:00");
      strength.bike = getScore(best.bike, "00:50:00", "00:30:00");
      strength.run = getScore(best.run, "00:45:00", "00:18:00");
      strength.t2 = getScore(best.t2, "00:03:00", "00:00:40");
      strength.t1 = getScore(best.t1, "00:06:00", "00:00:59");
      return strength;
    }

    function getBest(results) {
      var best = {};
      best.swim = 99999999999;
      best.t1 = 999999999;
      best.bike = 99999999999;
      best.t2 = 999999999;
      best.run = 99999999999;
      for (var i = 0; i < results.length; i++) {
        var result = results[i];
        best.swim = Math.min(best.swim, getSecondsFromString(result.swim));
        best.t1 = Math.min(best.t1, getSecondsFromString(result.t1));
        best.bike = Math.min(best.bike, getSecondsFromString(result.bike));
        best.t2 = Math.min(best.t2, getSecondsFromString(result.t2));
        best.run = Math.min(best.run, getSecondsFromString(result.run));
      };
      return best;
    }
  });

  