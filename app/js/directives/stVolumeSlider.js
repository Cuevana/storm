angular.module('storm.directives')

// Volume slider bar
.directive('stVolumeSlider', ['$q', '$timeout', 'Navigation', function($q, $timeout, Navigation) {
	return {
		restrict: 'AE',
		templateUrl: '/app/views/directives/st-volume-slider.html',

		link: function(scope, element, attr) {

			var videoReady = false,
				mouseOnSlider = false,
				hideTimeout = 3000;

			scope.volumePercent = scope.config.volume * 100;

			var volumeIcon = document.querySelector('[nav-title="volume-icon"]');

			// Get default volume
			scope.$watch(attr.defaultVolume, function(value) {
				if (value === undefined) return;
				update();
			});

			// Wait for player scope...
			scope.$watch('video', function() {
				videoReady = true;
			});

			// Watch for focus on volume icon
			scope.$watch(function() {
				return volumeIcon.getAttribute('nav-focus');
			}, function(value) {
				scope.toggleVolumeSlider(value);
			});

			// Hover on volume icon
			angular.element(volumeIcon).hover(function() {
				mouseOnSlider = true;
				scope.toggleVolumeSlider(true);
			}, function() {
				mouseOnSlider = false;
				$timeout(function() {
					if (!mouseOnSlider) {
						scope.toggleVolumeSlider(false);
					}
				}, hideTimeout);
			});

			// Hover on slider
			element.hover(function() {
				mouseOnSlider = true;
			}, function() {
				mouseOnSlider = false;
				$timeout(function() {
					if (!mouseOnSlider) {
						scope.toggleVolumeSlider(false);
					}
				}, hideTimeout);
			});

			scope.toggleVolumeSlider = function(value) {
				scope.openVolumeSlider = typeof value === 'boolean' ? value : value === 'true' ? true : false;

				if (scope.openVolumeSlider) {
					// Set left position
					var div = element.children(), icon = document.querySelector('[nav-title="volume-icon"]');
					div.css('left', 
						(icon.getBoundingClientRect().left + angular.element(icon).outerWidth()/2)
						- div.outerWidth()/2
					);
				}
				return false;
			};

			scope.volumeUp = function() {
				if (scope.config.volume < 1) {
					scope.config.volume += 0.05;
				}
				update();
			};

			scope.volumeDown = function() {
				if (scope.config.volume > 0) {
					scope.config.volume -= 0.05;
				}
				update();
			};

			scope.toggleMute = function() {
				if (videoReady) scope.video.toggleMute();
			};

			scope.seekVolume = function($event) {
				var zoom = parseFloat(angular.element('body').css('zoom')) || 1;
				var percentage = ($event.offsetY / $event.currentTarget.offsetHeight) / zoom;
				if (percentage > 1) {
					percentage = 1;
				} else if (percentage < 0) {
					percentage = 0;
				}

				scope.config.volume = 1 - percentage;
				update();
			};

			function update() {
				if (!videoReady) return;
				scope.volumePercent = scope.config.volume * 100;
				scope.video.setVolume(scope.config.volume);
			}

		}
	};
}]);