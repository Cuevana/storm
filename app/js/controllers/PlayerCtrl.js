/* global angular, document */
'use strict';

angular.module('storm.controllers')

// Player
.controller('PlayerCtrl', ['$scope', '$rootScope', '$timeout', '$sce', 'Player', 'Settings', 'Navigation', 'Remote', 
	function($scope, $rootScope, $timeout, $sce, Player, Settings, Navigation, Remote) {

	$scope.playerLayer = true;

	// Get playing item
	$scope.item = Player.getItem();

	// Get subtitles
	$scope.tracks = Player.getSubs();

	// Set video url
	$scope.videoUrl = $sce.trustAsResourceUrl(Player.getUrl());

	// Player settings
	$scope.config = Settings.get('player');

	// Save player settings when changed
	$scope.$watch('config', function(value) {
		Settings.set('player', value);
	}, true);

	$scope.playerCloseAlert = false;
	$scope.playerFullScreen = false;

	$scope.showClosePlayer = function() {
		$scope.playerCloseAlert = true;
		$scope.player.pause();
		// Focus navigation
		$timeout(function() {
			Navigation.setActiveElement('player-close-alert', true);
		});
	};

	$scope.hideClosePlayer = function() {
		$scope.playerCloseAlert = false;
		// Focus navigation
		$timeout(function() {
			Navigation.setActiveElement('close-button', true);
		});
	};

	$scope.closePlayer = function() {
		// If full screen toggled inside player, leave full-screen when closing
		if ($scope.playerFullScreen && win.isFullscreen) win.leaveFullscreen();
		Player.closePlayer();
	};

	// Wait for player scope
	var watchPlayer = $scope.$watch(function() {
		return angular.element(document.querySelector('video')).scope();
	}, function(value) {
		if (value !== undefined) {
			$scope.player = value.video;

			// Emit play/pause status to remote
			$scope.player.on('play pause', function(e) {
				Remote.playStatus(!e.target.paused);
			});

			// Emit playing progress to remote
			$scope.player.on('timeupdate', function(e) {
				Remote.playProgress(e.target.currentTime, e.target.duration);
			});

			$scope.player.on('volumechange', function(e) {
				Remote.setVolume(e.target.volume, e.target.muted);
			});

			// Delete watch
			watchPlayer();
		}
	});

	// Listen to player progress
	$rootScope.$on('playerProgress', function(e, stats) {
		$scope.$apply(function() {
			$scope.progress = stats;
		});
	});

	//
	// REMOTE EVENTS
	// 

	// Listen to track change to notify Remote
	$scope.$watch('tracks', function(value) {
		Remote.setTracks(value);
	}, true);

	// Listen to volume change to notify Remote
	$scope.$watch('config.volume', function(value) {
		Remote.setVolume(value);
	});

	// Watch for subtitle selection from remote
	$rootScope.$on('remoteTracksChange', function(e, tracks) {
		$scope.tracks = tracks;
	});

	// Watch for volume change from remote
	$rootScope.$on('remoteVolumeChange', function(e, volume) {
		$scope.config.volume = volume;
	});

	// Watch for mute toggle from remote
	$rootScope.$on('remoteToggleMute', function() {
		$scope.player.toggleMute();
	});

	$scope.$on('$destroy', function() {
		// Destroy video player before scope destroy
		// If not, video element is not really destroyed
		angular.element(document.querySelector('video')).remove();
	});

}]);
