/* global angular */
'use strict';

angular.module('storm.filters')

.filter('timeToString', function() {
	return function(time) {
		var sec_num = parseInt(time, 10);
		var hours   = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (hours < 10 && hours > 0) { 
			hours = "0" + hours + ':';
		} else {
			hours = '';
		}
		if (minutes < 10) { minutes = "0" + minutes; }
		if (seconds < 10) { seconds = "0" + seconds; }

		time = hours + minutes+':'+seconds;
		return time;
	};
});