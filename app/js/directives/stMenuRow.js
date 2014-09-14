/* global angular */
angular.module('storm.directives')

// Menu row
.directive('stMenuRow', ['$location', '$timeout', '$rootScope', 'Navigation', function($location, $timeout, $rootScope, Navigation) {
	return {
		restrict: 'A',
		scope: true,

		link: function(scope, element, attr) {

			var activeParent, activeIndex = 0;

			var items = element.children('li');

			// Listen for activeIndex changes
			scope.$on('activeIndexChange', function(e, value) {
				activeIndex = value;

				// Load submenu if applicable
				loadSubmenu();

				// Load view
				loadView();
			});

			// Select menu default index if set
			if (attr.menuDefaultIndex) {
				activeIndex = parseInt(attr.menuDefaultIndex);
				scope.updateActiveIndex(activeIndex);

				// Reload on load to fix first position for default element
				angular.element(window).on('load', function() {
					scope.updateActiveIndex(activeIndex);
				});
			}

			// Load submenu
			function loadSubmenu() {
				// If child, return
				if (attr.menuParent) return;

				var selectedItem = items.eq(activeIndex).children('a');

				// If element has child menu, set submenu
				var submenu = selectedItem.attr('menu-child') ? selectedItem.attr('menu-child') : null;
				if (scope.updateSubmenu) scope.updateSubmenu(submenu);
			}

			// Load view referenced in href
			function loadView() {
				var selectedItem = items.eq(activeIndex).children('a');

				// If not final menu, return
				if (selectedItem.attr('menu-child') && selectedItem.attr('href') === undefined) return;

				// If child, load only if submenu is active
				if (element.attr('menu-parent') !== undefined && scope.submenu !== element.attr('menu-parent')) return;

				// Go to link
				var url = selectedItem.attr('href');
				if (url) {
					$location.url(url);
				}
			}

			// Watch submenu change to load first child by default
			scope.$watch('submenu', function(value) {
				if (element.attr('menu-parent') !== undefined && value === element.attr('menu-parent')) {
					activeIndex = 0;
					scope.updateActiveIndex(activeIndex);
				}
			});

		}
	};
}]);