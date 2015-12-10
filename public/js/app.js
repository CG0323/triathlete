var app = angular.module('TriathleteApp', [
  'ngRoute',
  'TriathleteApp.controllers',
  'TriathleteApp.services'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.
	when("/", {templateUrl: "templates/triathletes-list-view.html", controller: "triathletesController"}).
  when("/:id", {templateUrl: "templates/triathlete-detail-view.html", controller: "triathleteDetailController"}).
	otherwise({redirectTo: '/'});
}]);

