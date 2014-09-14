/* global angular */
'use strict';

angular.module('storm.controllers')

.controller('RowListCtrl', ['$scope', '$state', '$stateParams', '$injector', 'list', function($scope, $state, $stateParams, $injector, list) {
	
	$scope.items = [];
	$scope.loadingPage = false;
	$scope.lastPage = false;

	var page = 1;

	// Set resolved list
	if (typeof list === 'object') {
		$scope.items = list;
		if (list.meta.current_page === list.meta.last_page) {
			$scope.lastPage = true;
		}
	}

	// Get service dynamically from current state
	var service = $injector.get($state.current.service);

	// Load next page
	$scope.nextPage = function() {
		if ($scope.loadingPage || $scope.lastPage) return false;
		
		page++;
		$scope.loadingPage = true;
		service.getView($stateParams.view, page).then(function(result) {
			$scope.loadingPage = false;
			$scope.items = $scope.items.concat(result);
			if (result.meta.current_page === result.meta.last_page) {
				$scope.lastPage = true;
			}
		}, function() {
			// Error
			$scope.loadingPage = false;
		});
	};

}]);