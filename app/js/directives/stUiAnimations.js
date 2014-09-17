/* global angular, Search directives */
angular.module('storm.directives')

// Check for UI Animations settings and enable/disable
.directive('stUiAnimations', ['$rootScope', function($rootScope) {
	return {
		restrict: 'A',
		link: function(scope, element) {
			// Watch for changes in settings
			$rootScope.$on('settingsChange', function(e, settings) {
				// Animations update
				element[settings.animations ? 'removeClass' : 'addClass']('no-animations');
			});
		}
	};
}]);