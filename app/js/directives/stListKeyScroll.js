/* global angular */
angular.module('storm.directives')

// Scroll list with navigation elements on focus change
.directive('stListKeyScroll', ['$rootScope', '$timeout', function($rootScope, $timeout) {
	return {
		restrict: 'A',
		scope: true,

		link: function(scope, element, attr) {

			var scrollItem = attr.scrollChild ? element.children() : element,
				scrollItems = [];

			// Watch for Navigation focus change
			scope.$on('focusUpdateSuccess', function(e, index) {
				// Run in next digest cycle to wait for attr focus update
				$timeout(function() {
					// Update scrolling items
					scrollItems = element[0].querySelectorAll('[st-navigatable]:not([nav-disabled])');
					// Check if a child is focused
					for (var i = 0, total = scrollItems.length; i<total; i++) {
						if (scrollItems[i].getAttribute('nav-focus') === 'true') {
							// Scroll to element
							if (!isElementInViewport(scrollItems[i])) scrollToElement(scrollItems[i]);
						}
					}
				});
			});

			function isElementInViewport(el) {
				var rect = el.getBoundingClientRect();
				var elRect = element[0].getBoundingClientRect();

				return (
					rect.top >= elRect.top &&
					rect.bottom <= elRect.bottom
				);
			}

			function scrollToElement(el) {
				var parentTop = element[0].getBoundingClientRect().top,
					elTop = el.getBoundingClientRect().top;

				if (elTop > parentTop) {
					element.scrollTop(element.scrollTop() 
						+ (elTop - parentTop - element.height()) 
						+ angular.element(el).outerHeight()
					);
				} else {
					element.scrollTop(element.scrollTop() 
						+ (elTop - parentTop) 
					);
				}
			}

		}
	};
}]);