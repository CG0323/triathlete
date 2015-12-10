angular.module('TriathleteApp.services', []).
  factory('dataAPI', function($http) {

    var dataAPI = {};

    dataAPI.getTriathletes = function() {
      return $http({
        method: 'get', 
        url: '/api/triathletes'
      });
    };
    
    dataAPI.getTriathleteDetail = function(id){
      return $http({
        method: 'get', 
        url: '/api/triathletes/' + id + '/results'
      });
    };

    return dataAPI;
  });