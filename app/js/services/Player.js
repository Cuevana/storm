/* global angular, window */
'use strict';
angular.module('storm.services')

.factory('Player', ['$rootScope', 'History', 'Error', 'Remote', function($rootScope, History, Error, Remote) {

	var playingItem,
		source = {},
		videoUrl = '',
		loading = false;

	function loadingUpdate(status) {
		loading = status;
		// Emit player loading
		$rootScope.$emit('playerLoading', loading);
	}

	function close() {
		// Close video to stop stream
		if (typeof window.destroyVideo === 'function') window.destroyVideo();

		// Emit player active
		$rootScope.$emit('playerActive', false);

		// Clean
		playingItem = null;
		source = {};
		videoUrl = '';

		// Remote
		Remote.activatePlayer(false);
	}

	// Listen for external exit event
	$rootScope.$on('exitPlayer', close);

	return {

		getItem: function() {
			return playingItem;
		},

		getUrl: function() {
			return videoUrl;
		},

		getSubs: function() {
			var subs = [];
			if (playingItem !== null && playingItem !== undefined) {
				for (var i in playingItem.subtitles) {
					// Load subs for selected quality source
					if (playingItem.subtitles[i].def === source.def) {
						subs.push(playingItem.subtitles[i]);
					}
				}
			}
			return subs;
		},

		playItem: function(item, src) {
			playingItem = item;
			source = src;

			// Remote: Set playing item
			Remote.setPlayingItem(playingItem);

			// If url for selected source exists, load torrent
			if (source.url !== null) {
				this.loadUrl(source.url);
			}
		},

		loadUrl: function(url) {
			loadingUpdate(true);

			// Check if url is magnet
			if (/^magnet:/.test(url)) return this.loadTorrent(url);

			// Load torrent file
			var self = this;
			window.readTorrent(url, function(err, torrent) {
				if (err) {
					Error.emit('PLAYER_ERROR','INVALID_FILE', 'TORRENT_NOT_LOADED');
					self.closePlayer();
					return;
				}
				// Load torrent only if still active
				if (source.url === url) {
					self.loadTorrent(torrent);
				}
			});
		},

		loadTorrent: function(torrent) {
			var self = this;

			window.playTorrent(torrent, function(err, href) {
				if (err) {
					Error.emit('PLAYER_ERROR','INVALID_FILE', 'TORRENT_NOT_LOADED');
					self.closePlayer();
				} else {
					// Play
					self.playVideo(href);
					// Push history
					History.add(playingItem);
				}
			}, function(stats) {
				// Emit player progress
				// If still preloading, send playerLoadingProgress
				$rootScope.$emit(stats.started ? 'playerProgress' : 'playerLoadingProgress', stats);

				// If download is stalled, reload
				if (!stats.started && stats.timeout) {
					self.cancelLoading();
					self.loadTorrent(torrent);
				}

			});
		},

		playVideo: function(url) {
			loadingUpdate(false);

			videoUrl = url;

			this.setPlayerActive();
		},

		setPlayerActive: function() {
			// Emit player active
			$rootScope.$emit('playerActive', true);

			// Remote
			Remote.activatePlayer(true);
		},

		cancelLoading: function() {
			loadingUpdate(false);
			this.closePlayer();
		},

		closePlayer: close

	};

}]);