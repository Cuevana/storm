/* global angular */
'use strict';
angular.module('storm.services')

.factory('Movie', ['$q', '$cacheFactory', 'pouchdb', 'Restangular', function($q, $cacheFactory, pouchdb, Restangular) {
	
	var db = pouchdb.create('movies');
	var cache = $cacheFactory('movies');

	return {
		get: function(id) {
			var getPromise = $q.defer();

			// Serve from DB else, from API
			db.get(id).then(function(item) {
				getPromise.resolve(item);
			}).catch(function() {
				Restangular.one('movies', id).get().then(function(result) {
					// Save to DB
					// Don't save if it doesn't have subtitles or sources
					if (result.originalElement.subtitles.length > 0 && result.originalElement.sources.length > 0) {
						var item = angular.extend(result.originalElement, {_id : id});
						db.put(item);
					}
					getPromise.resolve(result.originalElement);
				}, function(response) {
					getPromise.reject(false);
				});
			});

			return getPromise.promise;
		},

		getView: function(view, page) {
			var getPromise = $q.defer();

			// Default page: 1
			page = page !== null ? page : 1;

			// Cache key
			var key = view+'&page='+page;

			// If cached... serve from cache
			var query = cache.get(key);
			if (query) {
				getPromise.resolve(query);
			} else {
				Restangular.all('movies/' + view).getList({ page: page }).then(function(result) {
					// Cache result
					cache.put(key, result);
					// Resolve promise
					getPromise.resolve(result);
				}, function(response) {
					getPromise.reject(false);
				});
			}
			return getPromise.promise;
		}
	};

}]);