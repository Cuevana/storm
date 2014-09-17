/* global angular */
angular.module('storm.directives')

// Zoom element based on window size to retain proportions
.directive('stZoomResize', ['$timeout', function($timeout) {
	return {
		restrict: 'A',

		link: function(scope, element, attr) {

			// Make screen 80% of available size (for HiDPI)
			var screen = window.screen,
				width  = screen.availWidth * 0.8,
				height = screen.availHeight * 0.8;

			// Min height
			if (height < 700) height = 700;

			var ScreenResolution = {
				get SD() {
					return window.screen.width < 1280 || window.screen.height < 720;
				},
				get HD() {
					return window.screen.width >= 1280 && window.screen.width < 1920 || window.screen.height >= 720 && window.screen.height < 1080;
				},
				get FullHD() {
					return window.screen.width >= 1920 && window.screen.width < 2000 || window.screen.height >= 1080 && window.screen.height < 1600;
				},
				get UltraHD() {
					return window.screen.width >= 2000 || window.screen.height >= 1600;
				},
				get QuadHD() {
					return window.screen.width >= 3000 || window.screen.height >= 1800;
				},
				get Standard() {
					return window.devicePixelRatio <= 1;
				},
				get Retina() {
					return window.devicePixelRatio > 1;
				}
			};

			window.resizeTo(width, height);
			window.moveTo((screen.availWidth  - width)  / 2,
						  (screen.availHeight - height) / 2);

			// Zoom after resize to maintain ratio
			function resize() {
				var viewport = angular.element(window).height();
				// Round zoom decimals to even numbers
				var zoom = Math.floor(Math.round(viewport / attr.stZoomResize * 10) / 2) * 2 / 10;
				element.css('zoom', zoom);
			}

			angular.element(window).on('load', function() {
				resize();
			});

			// Listen window resize
			angular.element(window).on('resize', _.throttle(resize, 250));

			element.on('$destroy', function() {
				angular.element(window).off('resize', resize);
			});
		}
	};
}]);