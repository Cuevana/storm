/* global angular */
'use strict';

angular.module('storm')

.config(['localStorageServiceProvider', function(localStorageServiceProvider) {
	localStorageServiceProvider.setPrefix('Storm');
}]);