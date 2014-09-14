/* global angular */
'use strict';
angular.module('storm.services')

.factory('Util', ['$timeout', '$q', function($timeout, $q) {
	// The service is actually this function, which we call with the func
	// that should be debounced and how long to wait in between calls
	return {
		debounce: function(func, wait, immediate) {
			var timeout;
			// Create a deferred object that will be resolved when we need to
			// actually call the func
			var deferred = $q.defer();
			return function() {
				var context = this, args = arguments;
				var later = function() {
					timeout = null;
					if(!immediate) {
						deferred.resolve(func.apply(context, args));
						deferred = $q.defer();
					}
				};
				var callNow = immediate && !timeout;
				if ( timeout ) {
					$timeout.cancel(timeout);
				}
				timeout = $timeout(later, wait);
				if (callNow) {
					deferred.resolve(func.apply(context,args));
					deferred = $q.defer();
				}
				return deferred.promise;
			};
		}
	};
}]);