/* global angular */
angular.module('storm.directives')

// Navigation conditional
.directive('stNavIf', ['Navigation', function(Navigation) {
	return {
		restrict: 'A',

		link: function(scope, element, attr) {

			// Watch for changes in directive
			scope.$watch(attr.stNavIf, function(value) {
				if (value) {
					element.removeAttr('nav-disabled');
				} else {
					element.attr('nav-disabled', '');
				}

				// Render navigation grid
				Navigation.renderGrid();
			});

		}
	};
}]);