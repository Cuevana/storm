/* global angular */
'use strict';

angular.module('storm.controllers')

.controller('SettingsCtrl', ['$scope', 'Settings', function($scope, Settings) {

	// Watch for settings update
	$scope.$watch(function() {
		return Settings.getAll();
	}, function(value) {
		$scope.settings = Settings.getAll();
	}, true);

}]);