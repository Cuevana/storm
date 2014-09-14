/* global angular */
angular.module('storm.directives')

.directive('stCoverRow', ['$rootScope', '$timeout', '$state', 'Navigation', 'CoverRow', 'Settings', function($rootScope, $timeout, $state, Navigation, CoverRow, Settings) {
	
	return {
		restrict: 'A',
		templateUrl: '/app/views/directives/st-cover-row.html',

		link: function(scope, element, attr) {

			// Time before cover is loaded (to prevent loading when scrolling)
			var coverTimeout = 300;

			var animations = Settings.get('animations');
			// Cover-row animation duration (default: 300ms)
			var rowAnimation = animations ? 300 : 0;

			// How many items before, do we want to load next page?
			var loadLimit = 7;

			var activeIndex = null,
				firstCover = true;

			// DOM Elements
			var coversElement = element.children('.covers');

			// Detail view vars
			scope.coverUrl = '';
			scope.detail = {
				active: false,
				transition: false,
				item: {}
			};

			// Listen for activeIndex change
			scope.$on('activeIndexChange', function(e, value) {
				activeIndex = value;
				firstCover = false;

				// Update background image from selected item
				$timeout(function() {
					if (scope.items.length > 0 && activeIndex === value) {
						CoverRow.changeCover(scope.items[activeIndex].covers ? scope.items[activeIndex].covers.medium : null || scope.items[activeIndex].tvshow.covers.medium);
					}
				}, firstCover ? 0 : coverTimeout);
			});

			// Check if loading of next page is needed
			scope.checkNext = function() {
				if (typeof scope.nextPage === 'function' && activeIndex >= scope.items.length - loadLimit) {
					scope.nextPage();
				}
			};

			//
			// DETAIL VIEW
			//

			// Show detail view
			scope.showDetailView = function(index) {
				var time = 0;
				if (index >= 0) {
					// Time to delay (if cover is already active, no delay)
					time = activeIndex === index ? 0 : rowAnimation;
					activeIndex = index;

					// Check if more items need to be loaded
					scope.checkNext();

					// Set nav focus in detail view
					$timeout(function() {
						hideCovers();
					}, time);
				} else {
					hideCovers();
				}

				// Update selected item
				scope.detail.item = scope.items[activeIndex];

				if ($state.current.name.indexOf('.') === -1) {
					// Wait for animation
					$timeout(function() {
						$state.go('.' + scope.detail.item.type, {id: scope.detail.item.id}, {reload: false, inherit: true, notify: true});
					}, time);
				}

				return false;
			};

			function hideCovers() {
				scope.detail.active = true;
				scope.detail.transition = animations ? true : false;
			}

			// Hide detail view
			scope.hideDetailView = function() {
				scope.detail.active = false;
				scope.detail.transition = animations ? true : false;
				
				Navigation.setActiveElement('main');
				return false;
			};

			// Covers transition end
			coversElement.on('transitionend', function() {
				scope.$apply(function() {
					scope.detail.transition = false;
				});
			});

			// Watch for state change to close cover row
			$rootScope.$on('$stateChangeStart', function(event, toState) {
				// Close cover row
				if (scope.detail.active && toState.name.indexOf('.') === -1) {
					scope.hideDetailView();
				}
			});

		}
	};
}]);