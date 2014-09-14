/* global angular */
'use strict';

angular.module('storm')

// Restangular config
.config(['RestangularProvider', function(RestangularProvider) {

	// API endpoint
	RestangularProvider.setBaseUrl('http://api.cuevana.tv');

	// Indicate the server that we want to wrap the response code into the json
	// response. CORS dont like non 200
	RestangularProvider.setDefaultHeaders({"Wrap-Status": true});

	// Response interceptor
	RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
		var extractedData = {};

		// Because of CORS, we need to wrap the error status into a field
		if (data.hasOwnProperty('_http_status') && data._http_status !== 200 ) {
			deferred.reject(data);
		}

		// Look for getList operations with pagination
		if (operation === 'getList' && data.data !== undefined) {
			var meta = {
				total: data.total,
				per_page: data.per_page,
				current_page: data.current_page,
				last_page: data.last_page,
				from: data.from,
				to: data.to
			};
			// Object data
			extractedData = data.data;
			// Pagination data
			extractedData.meta = meta;
		} else {
			extractedData = data;
		}
		return extractedData;
	});

	// Response extractor
	RestangularProvider.setResponseExtractor(function(response) {
		var newResponse = response;
		if (angular.isArray(response)) {
			for (var key in newResponse) {
				newResponse[key].originalElement = angular.copy(newResponse[key]);
			}
		} else {
			newResponse.originalElement = angular.copy(response);
		}

		return newResponse;
	});

}]);