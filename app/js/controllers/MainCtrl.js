/* global angular, window, win, process, Offline */
'use strict';

angular.module('storm.controllers')

// Main
.controller('MainCtrl', ['$scope', '$rootScope', '$timeout', 'Navigation', 'Player', 'Remote', 'Error', 'Settings', 
	function($scope, $rootScope, $timeout, Navigation, Player, Remote, Error, Settings) {

	// Search
	$scope.search = {
		q: null
	};

	// Check for welcome message the first time
	$scope.welcome = Settings.get('welcome');
	if ($scope.welcome) {
		angular.element(window).on('load', function() {
			Navigation.setActiveElement('welcome-close');
		});
	}

	// Check for blur settings
	$scope.blurBackground = Settings.get('blur');

	// Watch for changes in settings
	$rootScope.$on('settingsChange', function(e, settings) {
		// Blur update
		$scope.blurBackground = settings.blur;
	});

	// Initialize navigation
	angular.element(window).on('load', function() {
		Navigation.init();
	});

	// Initialize remote
	Remote.init();

	// Listen for cover change
	$rootScope.$on('coverRowChangeCover', function(e, value) {
		$scope.coverUrl = value;
	});

	// Listen for player activation / deactivation
	$rootScope.$on('playerActive', function(e, value) {
		$scope.playerActive = value;
		Navigation.setActiveElement(value ? 'play-pause' : ['detail-view', 'play-forrrent'], true);
	});

	// Listen for player loading
	$rootScope.$on('playerLoading', function(e, value) {
		$scope.cleanProgress();
		$scope.playerLoading = value;

		// Navigation focus to cancel button
		if (value) Navigation.setActiveElement('cancel-loading', true);
	});

	// Listen for player loading progress
	$rootScope.$on('playerLoadingProgress', function(e, value) {
		$scope.$apply(function() {
			$scope.playerProgress = value;
		});
	});

	$scope.cancelPreloading = function() {
		Player.cancelLoading();
		$scope.cleanProgress();
		Navigation.setActiveElement(['detail-view', 'play-torrent'], true);
	};

	$scope.cleanProgress = function() {
		$scope.playerProgress = {
			percent: 0, 
			active: 0, 
			peers: 0
		};
	};

	// Listen for errors
	Error.on('PLAYER_ERROR', function(error) {
		$scope.$apply(function() {
			$scope.error = error;
			$scope.error.status = true;
		});
		$scope.cancelPreloading();
	});

	// Close error alert
	$scope.closeError = function() {
		$scope.error.status = false;
		Navigation.setActiveElement(['detail-view', 'play-torrent'], true);
	};

	// Close offline alert
	$scope.closeOffline = function() {
		$scope.offline = false;
		Navigation.setActiveElement(['menu', 'main', 'play-pause'], true);
	};

	// Close welcome alert
	$scope.closeWelcome = function() {
		$scope.welcome = false;
		Settings.set('welcome', false);
		Navigation.setActiveElement(['menu', 'main'], true);
	};

	// Watch for state change and change cover-row loading to prevent navigation issues
	$rootScope.$on('$stateChangeStart', function(event, toState) {
		if (toState.waitUntilLoad) {
			$scope.loadingState = true;
			// Render grid
			$timeout(function() {
				Navigation.renderGrid();
			});
		}
	});

	$rootScope.$on('$stateChangeSuccess', function() {
		$scope.loadingState = false;

		// Render grid
		$timeout(function() {
			Navigation.renderGrid();
		});
	});

	// Remote active
	$rootScope.$on('remoteActive', function(e, status) {
		$scope.remoteActive = status;
	});

	// Full screen events
	$scope.fullScreenMode = false;
	
	win.on('enter-fullscreen', function() {
		$scope.$apply(function() {
			$scope.fullScreenMode = true;
		});
		win.focus();
	});

	win.on('leave-fullscreen', function() {
		$scope.$apply(function() {
			$scope.fullScreenMode = true;
		});
		win.focus();
	});

	// Check for offline/online state change
	Offline.on('down', function() {
		$scope.offline = true;
		Navigation.setActiveElement('offline-close', true);
	});
	Offline.on('up', function() {
		$scope.closeOffline();
	});

}]);
