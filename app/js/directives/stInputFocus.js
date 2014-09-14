/* global angular */
angular.module('storm.directives')

.directive('stInputFocus', ['$timeout', 'Navigation', function($timeout, Navigation) {
	return {
		require: 'ngModel',
		restrict: 'A',

		link: function(scope, element, attr, ngModelCtrl) {

			var parent = element.parent();

			function onKeyUp(e) {
				var keyCode = e.which ? e.which : e.keyCode;

				if (keyCode === 27) {
					clear();
				}
			}

			function clear() {
				ngModelCtrl.$setViewValue(null);
				ngModelCtrl.$render();
			}

			function doSearch(value) {
				if (value !== null && value !== undefined) {
					Search.search(value);
				}
			}

			element.on('keyup', _.throttle(onKeyUp, 250, {
				trailing: false
			}));

			// Focus property
			element.on('focus', function() {
				element.focused = true;
				Navigation.setActiveElement(parent.attr('nav-title'));
			});
			element.on('blur', function() {
				element.focused = false;
			});

			// Watch for parent nav-focus to focus input
			scope.$watch(function() {
				return parent.attr('nav-focus');
			}, function(value) {
				$timeout(function(){
					if (value === 'true') {
						element.focus();
					} else if (element.focused) {
						element.blur();
					}
				});
			});
		}
	};
}]);