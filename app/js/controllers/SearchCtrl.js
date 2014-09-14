/* global angular */
'use strict';

angular.module('storm.controllers')

// Search
.controller('SearchCtrl', ['$scope', '$stateParams', 'Search', function($scope, $stateParams, Search) {
	$scope.items = [];
	$scope.loadingPage = false;
	$scope.lastPage = false;

	var page = 1;

	// Load next page
	$scope.nextPage = function() {
		if ($scope.loadingPage || $scope.lastPage) return;
		
		page++;
		$scope.loadingPage = true;
		Search.get($stateParams, page).then(function(result) {
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

	// Do an initial search with the values from the query
	Search.get($stateParams).then(function(result) {
		// Results
		if (result.length > 0) {
			$scope.items = result;
			if (result.meta.current_page === result.meta.last_page) {
				$scope.lastPage = true;
			}
			// Hide no-results
			$scope.noResults = false;
		} else {
			// Show no-results
			$scope.noResults = true;
		}
	}, function() {
		$scope.noResults = true;
	});

}]);
