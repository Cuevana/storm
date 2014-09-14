/* global angular */
angular.module('storm.directives')

// Set background image
.directive('stBackImg', function() {
	return function(scope, element, attrs){
		attrs.$observe('stBackImg', function(value) {
			element.css({
				'background-image': 'url(' + value +')'
			});
		});
	};
});