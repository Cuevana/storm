/* global angular */
'use strict';

angular.module('storm')

.config(function($sceDelegateProvider) {
	$sceDelegateProvider.resourceUrlWhitelist([
		'self',
		'http://*.cuevana.tv/**'
   ]);
 });