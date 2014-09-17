/* global angular */
angular.module('storm.directives')

.directive('stPlayerControls', ['$timeout', '$rootScope', 'Navigation', function($timeout, $rootScope, Navigation) {
	return {
		require: 'ngModel',
		restrict: 'AE',

		link: function(scope, element, attr, ngModelCtrl) {

			var visibleTimeout = 3000, 
				timeoutPromise,
				doc = angular.element(document);

			// Wait for player scope...
			var videoWatch = scope.$watch('video', function() {
				
				// Check when playing state changes
				scope.video.on('play pause', function(e) {
					if (e.target.paused) {
						showLayout();
					} else {
						hideLayout();
					}
				});

				// Delete watch
				videoWatch();
			});

			// Key down event (up and down arrows for scrolling)
			function onKeyDown(e) {
				var keyCode = e.which ? e.which : e.keyCode;

				// Space bar (play/pause)
				if (keyCode === 32) {
					scope.player.playPause();
				// Hide if esc key
				} else if (keyCode === 27) {
					hideLayout();
					// Exit fullscreen
					if (win.isFullscreen) win.leaveFullscreen();
				} else {
					showLayout();
				}
			}

			function onMouseMove(e) {
				showLayout();
				scope.$apply();
			}

			function showLayout() {
				var hidden = !ngModelCtrl.$modelValue ? true : false;

				// Show layout
				ngModelCtrl.$setViewValue(true);
				ngModelCtrl.$render();

				// If layout was hidden, focus navigation on play/pause button
				if (hidden) {
					// Run after digest cycle
					$timeout(function() {
						setProgressBar();
						Navigation.setActiveElement('play-pause', true);
					});
				}

				// Show cursor
				angular.element('body').css('cursor','auto');

				// Cancel promise
				$timeout.cancel(timeoutPromise);

				// Set timeout
				timeoutPromise = $timeout(function() {
					hideLayout();
				}, visibleTimeout);
			}

			function hideLayout() {
				// Hide layout
				ngModelCtrl.$setViewValue(false);
				// Hide cursor
				angular.element('body').css('cursor','none');
			}

			//
			// PROGRESS BAR
			//

			function setProgressBar() {
				var progressBar = angular.element('.progress-bar');
				progressBar.on('mouseenter', function() {
					scope.showTimeLabel = true;
				}).on('mouseout', function() {
					scope.showTimeLabel = false;
				}).on('mousemove', function(e) {
					var zoom = parseFloat(angular.element('body').css('zoom')) || 1;
					var percentage = (e.offsetX / e.target.offsetWidth) / zoom;
					scope.timeLabelLeft = percentage * 100;

					var seekTime = scope.player.duration * percentage;
					scope.timeLabel = isNaN(seekTime) ? 0 : seekTime;
				});
			}

			scope.seekPercentage = function($event) {
				var zoom = parseFloat(angular.element('body').css('zoom')) || 1;
				var percentage = ($event.offsetX / $event.currentTarget.offsetWidth) / zoom;
				if (percentage > 1) {
					percentage = 0;
				}

				scope.player.seek(scope.player.duration * percentage);
			};

			//
			// PLAYER CONTROLS
			//

			scope.playBackward = function() {
				var time = scope.player.currentTime - scope.config.skipSeconds;
				scope.player.seek( time > 0 ? time : 0 );
			};

			scope.playForward = function() {
				var time = scope.player.currentTime + scope.config.skipSeconds;
				scope.player.seek( time < scope.player.duration ? time : 0 );
			};

			scope.togglePause = function() {
				scope.player.playPause();
			};

			scope.fullScreen = function() {
				win.toggleFullscreen();
				scope.playerFullScreen = true;
			};

			scope.prevButton = function() {
				var buttons = getPlayerButtons(), total = buttons.length-1, prevIndex = null;
				for (var i=0;i<=total;i++) {
					if (buttons[i].getAttribute('nav-focus') === 'true') {
						if (i > 0) {
							prevIndex = i - 1;
							break;
						}
					}
				}
				scope.closeMenus();
				if (prevIndex === null) return;
				Navigation.setActiveElement(buttons[prevIndex].getAttribute('nav-title'));
			};

			scope.nextButton = function() {
				var buttons = getPlayerButtons(), total = buttons.length-1, nextIndex = null;
				for (var i=0;i<=total;i++) {
					if (buttons[i].getAttribute('nav-focus') === 'true') {
						if (i < total) {
							nextIndex = i + 1;
							break;
						}
					}
				}
				scope.closeMenus();
				if (nextIndex === null) return;
				Navigation.setActiveElement(buttons[nextIndex].getAttribute('nav-title'));
			};

			scope.selectCloseButton = function() {
				Navigation.setActiveElement('close-button');
			};

			scope.closeMenus = function() {
				scope.openTracksMenu = false;
			};

			function getPlayerButtons() {
				return angular.element(document.querySelectorAll('.player-controls [st-navigatable]:not([nav-disabled])'));
			}

			// Listen to remote player button events
			$rootScope.$on('remotePlayerButton', function(e, button) {
				switch (button) {
					case 'playpause':
						scope.togglePause();
						break;
					case 'backward':
						scope.playBackward();
						break;
					case 'forward':
						scope.playForward();
						break;
				}
			});

			// Attach listeners
			doc.on('keydown', onKeyDown);
			doc.on('mousemove', onMouseMove);

			// If destroyed, clean up
			scope.$on('$destroy', function() {
				doc.off('keydown', onKeyDown);
				doc.off('mousemove', onMouseMove);

				// Show cursor before destroying
				angular.element('body').css('cursor','auto');
			});

		}
	};
}]);