/* global angular */
angular.module('storm.directives')

// Slide row
.directive('stSlideRow', ['$timeout', 'Util', 'Navigation', 'Settings', function($timeout, Util, Navigation, Settings) {
	return {
		restrict: 'A',
		scope: true,

		link: function(scope, element, attr) {

			var boxItems = element.children('li').not('.no-item'), 
				activeIndex = 0,
				animations = Settings.get('animations'),
				rowAnimation = animations ? 300 : 0,
				focus = false;

			// Go to previous item from active
			function prev() {
				if (activeIndex > 0) {
					activeIndex -= 1;
					return selectItemByIndex(activeIndex);
				}
				return false;
			}

			// Go to next item from active
			function next() {
				if (activeIndex < boxItems.length - 1) {
					activeIndex += 1;
					return selectItemByIndex(activeIndex);
				}
				return false;
			}

			// External activeIndex update
			scope.updateActiveIndex = function(value) {
				if (value === undefined || value === null) return;
				activeIndex = parseInt(value) || 0;
				selectItemByIndex(activeIndex);
			};

			// Select an item in the row by index
			function selectItemByIndex(index) {
				// Clean classes
				boxItems.removeClass('selected');

				if (boxItems.length > 0 && index >= 0 && index < boxItems.length) {
					angular.element(boxItems[index]).addClass('selected');

					// Set left position
					var menu_left = element[0].getBoundingClientRect().left, 
						item_left = boxItems[index].getBoundingClientRect().left;

					// Slide transition
					element.css('transform', 'translateX('+ (-(item_left - menu_left)) +'px) translateZ(0)');

					// Trigger slide event
					element.trigger('slide');

					// Need to run in a new digest cycle to support no animations					
					$timeout(function() {
						// Emit change
						scope.$emit('activeIndexChange', activeIndex);
					});
				}
			}

			var pressTimeout;

			// Key down event (left and right arrows for scrolling)
			function onKeyDown(e) {
				var keyCode = e.which ? e.which : e.keyCode;
				
				// If animations are active, add class to element to handle transitions appropiately
				if (animations && (keyCode === 37 || keyCode === 39)) {
					pressTimeout = $timeout(function() {
						element.addClass('no-transition');
					}, rowAnimation);
				}

				switch (keyCode) {
					// Left
					case 37:
						if (e.preventDefault()) e.preventDefault();
						prev();
						break;
					// Right
					case 39:
						if (e.preventDefault()) e.preventDefault();
						next();
						break;
				}
			}

			// Key up event
			function onKeyUp(e) {
				var keyCode = e.which ? e.which : e.keyCode;

				// If animations are active, remove class to element to handle transitions appropiately
				if (animations && (keyCode === 37 || keyCode === 39)) {
					if (e.preventDefault()) e.preventDefault();
					$timeout(function() {
						$timeout.cancel(pressTimeout);
						element.removeClass('no-transition');
					}, rowAnimation - 100);
				}
			}

			function layoutUpdate() {
				boxItems = element.children('li').not('.no-item');

				if (!boxItems.length) return;

				// Set width to fit one row
				var totalWidth = 0;
				for (var i=0, ti = boxItems.length;i<ti;i++) {
					totalWidth += angular.element(boxItems[i]).outerWidth();
				}
				element.width(totalWidth * 2);

				// Add click event for item selection
				if (attr.slideClickable) {
					var aItems = boxItems.children('a'), total = aItems.length;
					for (var i=0;i<total;i++) {
						(function(item, index) {
							angular.element(item).off('click.slide-row').on('click.slide-row', function(e) {
								e.preventDefault();
								// Update index
								scope.updateActiveIndex(index);
								// Focus navigation on container element
								Navigation.setActiveElement(attr.navTitle);
							});
						})(aItems[i], i);
					}
				}

				// If selected index doesn't exist, reset
				selectItemByIndex((activeIndex >= boxItems.length) ? 0 : activeIndex);
			}

			function onScroll(e) {
				if (e.preventDefault()) e.preventDefault();
				var delta = (e.originalEvent.detail<0 || e.originalEvent.wheelDelta>0) ? 1 : -1;

				if (delta > 0) {
					next();
				} else if (delta < 0) {
					prev();
				}

				// If navigation focus isn't set on container, set it
				Navigation.setActiveElement(attr.navTitle);
			}

			function init() {
				// If scrollable, set events
				if (attr.scrollable === 'true') {
					var friction = parseInt(attr.scrollFriction) || 200;
					var wheelEvent = _.throttle(onScroll, friction, {
						trailing: false
					});
					// Get mouse wheel event
					element.on('wheel', wheelEvent);
				}
			}

			// Watch for focus change to set/unset event listeners
			scope.$watch(function() {
				return element.attr('nav-focus');
			}, function(value) {
				if (value === 'true') {
					angular.element(document).on('keydown', onKeyDown);
					angular.element(document).on('keyup', onKeyUp);
				} else {
					angular.element(document).off('keydown', onKeyDown);
					angular.element(document).off('keyup', onKeyUp);
				}
			});

			// If destroyed, clean up
			scope.$on('$destroy', function() {
				angular.element(document).off('keydown', onKeyDown);
				angular.element(document).off('keyup', onKeyUp);
				if (attr.scrollable === 'true') {
					element.off('wheel', wheelEvent);
				}
			});

			// Watch for updates in scope to update items
			scope.$watch(function() {
				return element.children('li').length;
			}, function() {
				layoutUpdate();
			});

			init();
		}
	};
}]);