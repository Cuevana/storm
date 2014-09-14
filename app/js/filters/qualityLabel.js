/* global angular */
'use strict';

angular.module('storm.filters')

.filter('qualityLabel', function() {
	return function(value) {
		return (value === '720' || value === '1080') ? 'HD' : 'SD';
	};
});