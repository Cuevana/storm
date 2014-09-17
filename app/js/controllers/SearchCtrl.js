/* global angular */
'use strict';

angular.module('storm.controllers')

// Search
.controller('SearchCtrl', ['$scope', '$stateParams', 'Search', '$q', '$translate', function($scope, $stateParams, Search, $q, $translate) {
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
			// Resolve items and concat
			resolveItems(result).then(function(resolved) {
				$scope.items = $scope.items.concat(resolved);
			});
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
			resolveItems(result).then(function(resolve) {
				$scope.items = resolve;
			});
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

	function resolveItems(items) {
		return $q(function(resolve, reject) {
			var promises = [];
			for (var i = 0, total = items.length;i<total;i++) {
				// Cover url
				items[i].cover_url = items[i].type === 'episode' ? items[i].tvshow.covers.medium : items[i].covers.medium;
				// More text row
				switch (items[i].type) {
					case 'episode':
						items[i].more = items[i].tvshow.name;
						break;
					case 'tvshow':
						promises.push(i);
						(function(i, seasons) {
							$translate(seasons !== 1 ? 'SEASONS_COUNT' : 'SEASON_COUNT', {number: seasons}).then(function(value) {
								items[i].more = value;
								if (promises.length === 1) {
									resolve(items);
								} else {
									promises.pop();
								}
							});
						})(i, items[i].total_seasons);
						break;
					case 'movie':
						items[i].more = items[i].year;
						break;
				}
			}
			if (!promises.length) {
				resolve(items);
			}
		});
	}

}]);
