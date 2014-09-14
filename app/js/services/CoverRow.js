/* global angular */
'use strict';
angular.module('storm.services')

.factory('CoverRow', ['$rootScope', '$timeout', function($rootScope, $timeout) {
	return {
		changeCover: function(url) {
			$rootScope.$emit('coverRowChangeCover', url);
		}
	};
}]);