/* global angular */
angular.module('storm.directives')

// Make element navigatable
.directive('stNavigatable', ['$compile', '$parse', '$timeout', 'Navigation', function($compile, $parse, $timeout, Navigation) {
	return {
		restrict: 'A',

		link: function(scope, element, attr) {

			var focus, 
				order,
				events = attr.navOn ? $parse(attr.navOn) : null;

			// Listen when grid renders to update item order
			scope.$on('navigationRenderGrid', function() {
				order = Navigation.getElementOrder(element, scope, events);
			});

			// Listen for focus change
			scope.$on('navigationFocus', function(event, value) {
				var setFocus = (order === value) ? true : false;

				// Avoid DOM manipulation if not needed
				if (focus === setFocus) return;

				// Save new focus
				focus = setFocus;

				// Change focus attr
				$timeout(function() {
					element[0].setAttribute('nav-focus', setFocus);
					// Emit focus update
					scope.$emit('focusUpdateSuccess');
				});
			});

			// If element has focus on destroy, remove focus
			scope.$on('$destroy', function() {
				if (focus) {
					$timeout(function() {
						Navigation.renderGrid(true);
					});
				}
			});

		}
	};
}]);