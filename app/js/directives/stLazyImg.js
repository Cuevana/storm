/* global angular */
angular.module('storm.directives')

.directive('stLazyImg', function() {
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
				element.attr('src', scope.$eval(attr.stLazyImg));
				loaded = true;
			}

			function isElementInViewport() {
				var rect = element[0].getBoundingClientRect();
				var pRect = parentScroll[0].getBoundingClientRect();

				return (
					rect.left >= pRect.left - element.width() * 2 && // Add width*2 to detect if element is partially in viewport
					rect.right <= pRect.right + element.width() // Add width to detect if element is partially in viewport
				);
			}

		}
	};
});