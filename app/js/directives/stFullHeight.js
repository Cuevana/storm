/* global angular, window */
angular.module('storm.directives')

// Make element height extend to bottom
.directive('stFullHeight', ['$timeout', function($timeout) {
	return {
		restrict: 'A',

		link: function(scope, element) {

			function resize() {
				var style = window.getComputedStyle(element[0]);
				var zoom = parseFloat(angular.element('body').css('zoom')) || 1;
				// Resize and take into account zoom
				element.css('height', (
					window.innerHeight -
					((element[0].getBoundingClientRect().top 
							+ (parseInt(style.marginTop) || 0) 
							+ (parseInt(style.marginBottom) || 0)
					) * zoom)
				) / zoom + 'px');

			}

			$timeout(function() {
				resize();
			});

			var resizeEvent = _.throttle(resize, 250);

			// Listen window resize
			angular.element(window).on('resize',resizeEvent);

			element.on('$destroy', function() {
				angular.element(window).off('resize', resizeEvent);
			});
		}
	};
}]);