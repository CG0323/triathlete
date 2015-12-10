angular.module('TriathleteApp.controllers', [])
  .controller('triathletesController', function($scope, dataAPI) {
	  $scope.triathletesGroups = [];
	  dataAPI.getTriathletes().success(function (response) {
      var group = []
      for(var i =0; i<response.length; i++){
        if(group.length == 3){
          $scope.triathletesGroups.push(group);
          group = [];
        }
        group.push(response[i]);
      }
		  if(group.length != 0){
        $scope.triathletesGroups.push(group);
      }
	  });
    $scope.viewDetail = function(id){
      // alert(id);
      window.location.href="#/"+id;  
    }
    $scope.getLevelDesc = function(level){
      if(level == "无"){
        return "运动员";
      } 
      else{
        return level + "运动员";
      }
    }
    
  })
  .controller('triathleteDetailController', function($scope, $routeParams, dataAPI) {
    $scope.id = $routeParams.id;
	  $scope.triathleteResults = [];
	  dataAPI.getTriathleteDetail($scope.id).success(function (response) {
      $scope.triathleteResults = response;
	  });
  });

  