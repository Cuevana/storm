/* global angular */
angular.module('storm.directives')

// Keyboard scroll overflow auto element
.directive('stKeyScroll', function() {
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attr) {

			var scrollItem = attr.scrollChild ? element.children() : element;

			// Prevent navigation focus change until scroll reaches top/bottom of element
			scope.scrollUp = function() {
				if (scrollItem.scrollTop() === 0) {
					return true;
				}
				return false;
			};

			scope.scrollDown = function() {
				if (scrollItem.scrollTop() === scrollItem[0].scrollHeight) {
					return true;
				}
				return false;
			};

			function scrollElement(direction) {
				var delta = direction == 'up' ? -30 : 30;
				scrollItem.scrollTop( scrollItem.scrollTop() + delta);
			}

			// Key down event (up and down arrows for scrolling)
			function onKeyDown(e) {
				var keyCode = e.which ? e.which : e.keyCode;

				switch (keyCode) {
					// Up
					case 38:
						// if (e.preventDefault()) e.preventDefault();
						scrollElement('up');
						break;
					// Down
					case 40:
						// if (e.preventDefault()) e.preventDefault();
						scrollElement('down');
						break;
				}
				return false;
			}

			// Watch for focus change to set/unset event listeners
			scope.$watch(function() {
				return element.attr('nav-focus');
			}, function(value) {
				if (value === 'true') {
					angular.element(document).on('keydown', onKeyDown);
				} else {
					angular.element(document).off('keydown', onKeyDown);
				}
			});

			// If destroyed, clean up
			scope.$on('$destroy', function() {
				angular.element(document).off('keydown', onKeyDown);
			});

		}
	};
});