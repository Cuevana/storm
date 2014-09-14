/* global angular */
'use strict';
angular.module('storm.services')

.factory('Search', ['$q', '$cacheFactory', '$rootScope', '$state', 'Restangular', 
	function($q, $cacheFactory, $rootScope, $state, Restangular) {
	
	// Caches
	var cache = $cacheFactory('Search');
	var searchData = {};

	return {

		search: function(params, external) {
			// Check if params or string
			if (typeof params === 'object') {
				searchData = params;
			} else {
				searchData = {
					q: params
				};
			}

			// Update query string
			if (external) {
				$rootScope.$emit('updateQueryString', searchData.q);
			}

			// Search state
			$state.go('search', searchData, {reload: true, inherit: false, notify: true});
		},

		get: function(params, page) {
			if (page) { params.page = parseInt(page) || 1; }
			params.suggest = true;

			var searchPromise = $q.defer();

			// Cache key
			var key = JSON.stringify(params);

			// If cached... serve from cache
			var query = cache.get(key);
			if (query) {
				searchPromise.resolve(query);
			} else {
				Restangular.all('search').getList(params).then(function(result) {
					// Cache result
					cache.put(key, result);
					searchPromise.resolve(result);
				}, function(error) {
					searchPromise.reject(error);
				});

			}

			return searchPromise.promise;
		}
	};
}]);