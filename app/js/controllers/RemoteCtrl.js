/* global angular */
'use strict';

angular.module('storm.controllers')

.controller('RemoteCtrl', ['$scope', 'Remote', 'Navigation', function($scope, Remote, Navigation) {

	Remote.generateCode();

	$scope.url = Remote.finalUrl();

}]);