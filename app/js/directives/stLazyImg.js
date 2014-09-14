/* global angular */
angular.module('storm.directives')

.directive('stLazyImg', ['$q', '$timeout', function($q, $timeout) {
	return {
		restrict: 'A',
		link: function(scope, element, attr) {

			var loaded = false;
			var parentContainer = element.parents('ul'),
				parentScroll = element.parents('ul').parent();

			parentContainer.on('transitionend slide', onScroll);

			function onScroll() {
				if (!loaded && isElementInViewport()) {
					loadSrc();
				}
				if (loaded) {
					parentContainer.off('transitionend slide', onScroll);
				}
			}

			function loadSrc() {
				element.attr('src', attr.stLazyImg);
				loaded = true;
			}

			function isElementInViewport() {
				var rect = element[0].getBoundingClientRect();
				var pRect = parentScroll[0].getBoundingClientRect();

				return (
					rect.top >= pRect.top &&
					rect.left >= pRect.left &&
					rect.bottom <= pRect.bottom && 
					rect.right <= pRect.right + element.width() // Detect if element is partially in viewport
				);
			}

		}
	};
}]);