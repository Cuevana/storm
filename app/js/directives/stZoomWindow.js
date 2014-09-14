/* global angular */
angular.module('storm.directives')

// Zoom element based on window size to retain proportions
.directive('stZoomResize', ['$window', '$timeout', function($window, $timeout) {
	return {
		restrict: 'A',

		link: function(scope, element, attr) {

			function resize() {
				var viewport = angular.element($window).height();
				// Round zoom decimals to even numbers
				var zoom = Math.floor(Math.round(viewport / attr.stZoomResize * 10) / 2) * 2 / 10;
				element.css('zoom', zoom);
			}

			$timeout(function() {
				resize();
			});

			// Listen window resize
			angular.element($window).on('resize', _.throttle(resize, 250));

			element.on('$destroy', function() {
				angular.element($window).off('resize', resize);
			});
		}
	};
}]);