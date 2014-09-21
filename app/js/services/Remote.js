/* global angular, require, document, window, win, os, QRCode */
'use strict';

angular.module('storm.services')

.factory('Remote', ['$q', '$rootScope', 'Navigation', 'Search', function($q, $rootScope, Navigation, Search) {

	var express = require('express.io');
	var remote = express().http().io();

	// Wait for remote ready status
	remote.io.route('ready', function(req) {
		// Send initial values to remote
		req.io.emit('navigatable', {
			player: player,
			fullscreen: win.isFullscreen,
			lang: window.selectedLanguage
		});
	});

	// Keyboard events: Keydown
	remote.io.route('keydown', function(req) {
		var e = angular.element.Event('keydown');
		e.which = keys[req.data];
		angular.element(document).trigger(e);
		keepScreenAwake();
	});

	// Keyboard events: Keyup
	remote.io.route('keyup', function(req) {
		var e = angular.element.Event('keyup');
		e.which = keys[req.data];
		angular.element(document).trigger(e);
		keepScreenAwake();
	});

	// Toggle fullscreen
	remote.io.route('toggleFullscreen', function(req) {
		win.toggleFullscreen();
		req.io.emit('fullscreenUpdate', win.isFullscreen);
	});

	// Activate search
	remote.io.route('activateSearch', function(req) {
		if (req.data) {
			// Set menu focus on search
			angular.element(document.querySelector('.main-menu a.search')).trigger('click');
			Navigation.setActiveElement('menu-search');
		} else {
			// Focus on cover row after search close
			Navigation.setActiveElement('main');
		}
		keepScreenAwake();
	});

	// Search
	remote.io.route('search', function(req) {
		Search.search(req.data, true);
		keepScreenAwake();
	});

	// Player button
	remote.io.route('playerButton', function(req) {
		$rootScope.$emit('remotePlayerButton', req.data);
	});

	// Update tracks
	remote.io.route('updateTracks', function(req) {
		$rootScope.$emit('remoteTracksChange', req.data);
	});

	// Volume
	remote.io.route('setVolume', function(req) {
		$rootScope.$emit('remoteVolumeChange', req.data);
	});

	// Toggle mute
	remote.io.route('toggleMute', function() {
		$rootScope.$emit('remoteToggleMute');
	});

	// Exit player
	remote.io.route('exitPlayer', function() {
		$rootScope.$emit('exitPlayer');
	});

	// Set app paths
	remote.use('/app', express.static('./app'));
	remote.use('/bower', express.static('./bower_components'));

	// Serve remote HTML
	remote.get('/', function(req, res) {
		res.sendfile('./app/views/remote.html');
	});

	// Prevent screen from going to sleep when using remote
	function keepScreenAwake() {
		$rootScope.$emit('remoteActive', true);
	}

	var qrcode,
		port = 7771;

	var player = {
		active: false,
		item: {},
		play: false,
		currentTime: 0,
		duration: 0,
		volume: 1,
		tracks: {}
	};

	// Map key codes
	var keys = {
		left: 37,
		up: 38,
		right: 39,
		down: 40,
		enter: 13
	};

	return {
		
		init: function() {
			remote.listen(port);
		},

		getUrl: function() {
			// Get local network IP
			var interfaces = os.networkInterfaces();
			var addresses = [];
			for (var i in interfaces) {
				for (var j in interfaces[i]) {
					var address = interfaces[i][j];
					if (address.family === 'IPv4' && !address.internal) {
						return address.address;
					}
				}
			}
		},

		finalUrl: function() {
			return 'http://'+ this.getUrl() +':' + port;
		},

		generateCode: function() {
			// Remote QR Code
			qrcode = new QRCode('qr-code', {
				text: this.finalUrl(),
				width: 200,
				height: 200,
				colorDark : '#ffffff',
				colorLight : 'transparent',
				correctLevel : QRCode.CorrectLevel.L
			});
		},

		activatePlayer: function(status) {
			player.active = status;
			// Reset item on player exit
			if (!status) player.item = {};
			remote.io.broadcast('playerActive', status);
		},

		setPlayingItem: function(item) {
			player.item = {
				name: item.name,
				subtitle: item.type === 'episode' ? item.tvshow.name : item.year,
				cover: item.type === 'episode' ? item.tvshow.covers.medium : item.covers.medium
			};
			remote.io.broadcast('playingItemUpdate', player.item);
		},

		playStatus: function(status) {
			player.play = status;
			remote.io.broadcast('playStatus', status);
		},

		playProgress: function(currentTime, duration) {
			player.currentTime = currentTime;
			player.duration = duration;
			remote.io.broadcast('playProgress', {currentTime: currentTime, duration: duration});
		},

		setVolume: function(volume, muted) {
			player.volume = volume;
			player.muted = muted;
			remote.io.broadcast('volumeUpdate', {volume: volume, muted: muted});
		},

		setTracks: function(tracks) {
			player.tracks = tracks;
			remote.io.broadcast('tracksUpdate', tracks);
		}
	};
}]);