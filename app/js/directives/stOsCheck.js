/* global angular, Search directives */
angular.module('storm.directives')

// Check OS and add class to body
.directive('stOsCheck', function() {
	return {
		restrict: 'A',
		link: function(scope, element) {
			var className = '';
			if (process.platform === 'darwin') {
				className = 'is-mac';
			} else if (process.platform === 'win32') {
				className = 'is-win';
			} else if (process.arch === 'ia32' || process.arch === 'x64') {
				className = 'is-linux';
			}
			element.addClass(className);
		}
	};
});