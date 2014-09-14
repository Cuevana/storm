// 
// Cuevana Storm Remote
// v0.1

var Remote = function() {
	io = io.connect();
	var lang = {};

	// Elements
	var playerControls = $('.player-controls'),
		playingItem = $('.playing-item'),
		playPauseButton = $('.play-pause'),
		fullscreenButton = $('.toggle-fullscreen'),
		currentTimeElement = $('.current-time'),
		totalTimeElement = $('.total-time'),
		volumeHandle = $('.volume-track .handle'),
		volumeTrack = $('.volume-track .bar .track'),
		volumeTrackSpan = volumeTrack.find('span'),
		muteButton = $('.toggle-mute');

	// Emit ready event.
	io.emit('ready');

	// Listen for navigatable status
	io.on('navigatable', function(data) {
		// Set language
		setLang(data.lang);

		// Set navigation
		setNavigation();

		// Set initial params
		togglePlayerControls(data.player.active);
		setActiveItem(data.player.item);
		setPlayStatus(data.player.play);
		setFullscreen(data.fullscreen);
		setPlayProgress(data.player.currentTime, data.player.duration);
		setTracks(data.player.tracks);
		setVolume(data.player.volume, data.player.muted);
	});

	// Listen for fullscreen toggle
	io.on('fullscreenUpdate', function(value) {
		setFullscreen(value);
	});

	// Listen for player activation
	io.on('playerActive', function(status) {
		togglePlayerControls(status);
	});

	// Listen for playing item update
	io.on('playingItemUpdate', function(data) {
		setActiveItem(data);
	});

	// Listen for play/pause status
	io.on('playStatus', function(status) {
		setPlayStatus(status);
	});

	// Listen for play progress
	io.on('playProgress', function(progress) {
		setPlayProgress(progress.currentTime, progress.duration);
	});

	// Listen for volume update
	io.on('volumeUpdate', function(player) {
		setVolume(player.volume, player.muted);
	});

	// Listen for tracks update
	io.on('tracksUpdate', function(tracks) {
		setTracks(tracks);
	});

	io.on('disconnect', function() {
		$('.popup').removeClass('show');
		$('.disconnected').addClass('show');
		$('.remote').addClass('blur');
	});

	var lastCurrentTime, 
		lastDuration,
		isPressed = false,
		tracks = [],
		volume = 1;

	function togglePlayerControls(status) {
		// status = true;
		$('body')[status ? 'addClass' : 'removeClass']('show-player');
		$('body')[status ? 'addClass' : 'removeClass']('show-playing-item');
	}

	function setActiveItem(item) {
		if (item.name !== undefined) {
			$('body').addClass('show-playing-item');
			playingItem.find('img').attr('src', item.cover);
			playingItem.find('.title').text(item.name);
			playingItem.find('.more').text(item.subtitle);
		}
	}

	function setNavigation() {
		// Set nav-buttons events
		$('.nav-controls > span').each(function() {
			$(this).on('touchstart', function(e) {
				e.stopPropagation();
				isPressed = true;
				pressKey(this.getAttribute('data-key'));
			}).on('touchend', function(e) {
				e.stopPropagation();
				isPressed = false;
				io.emit('keyup', this.getAttribute('data-key'));
			});
		});

		// Fullscreen toggle
		$('.toggle-fullscreen').click(function() {
			io.emit('toggleFullscreen');
		});

		// Search toggle
		$('.toggle-search, .search a.close').click(function() {
			toggleSearch();
		});

		// Subtitles toggle
		$('.toggle-subs, .subtitles a.close').click(function() {
			toggleSubtitlesMenu();
		});

		// Mute toggle
		muteButton.click(function() {
			io.emit('toggleMute');
		});

		// Search submit
		$('#q').on('keyup', function(e) {
			e.preventDefault();
			io.emit('search', this.value);
		});

		// Player buttons
		playerControls.find('[data-action]').each(function() {
			$(this).click(function() {
				io.emit('playerButton', this.getAttribute('data-action'));
			});
		});

		// Volume track
		var activeVolumeSlider = false,
			volumeTrackLeft = 0,
			volumeTrackRight = 0;

		volumeHandle.on('touchstart', function() {
			activeVolumeSlider = true;
			var rect = volumeTrack[0].getBoundingClientRect();
			volumeTrackLeft = rect.left;
			volumeTrackRight = rect.right;
		});

		// Reconnect
		$('.reconnect').click(function() {
			// Check if app is alive
			$.get(window.location.href, function() {
				// Reload an reconnect
				window.location.reload(true);
			}).fail(function() {
				alert(lang.REMOTE_RECONNECT_FAIL);
			});
		});

		// Exit player
		$('.close-player').click(function() {
			if (confirm(lang.CLOSE_VIDEO_ALERT)) {
				io.emit('exitPlayer');
			}
		});

		$('body').on('touchmove', function(e) {
			// Prevent scrolling
			e.preventDefault();

			// Slide volume
			if (activeVolumeSlider) {
				var pos = (e.originalEvent.touches[0].pageX - volumeTrackLeft) * 100 / volumeTrack.width();
				if (e.originalEvent.touches[0].pageX < volumeTrackLeft) {
					pos = 0;
				} else if (e.originalEvent.touches[0].pageX > volumeTrackRight) {
					pos = 100;
				}
				updateVolumeTrack(pos);
				// Emit to app
				io.emit('setVolume', pos / 100);
			}
		}).on('touchend', function() {
			activeVolumeSlider = false;
		});
	}

	function pressKey(key) {
		if (!isPressed) return;
		io.emit('keydown', key);

		// If user is still pressing, call again
		setTimeout(function() {
			pressKey(key);
		}, 200);
	}

	function toggleSearch() {
		var searchLayer = $('.search'), isVisible = searchLayer.hasClass('show');
		searchLayer[isVisible ? 'removeClass' : 'addClass']('show');
		$('.remote')[isVisible ? 'removeClass' : 'addClass']('blur');

		io.emit('activateSearch', !isVisible);
	}

	function toggleSubtitlesMenu() {
		var subsLayer = $('.subtitles'), isVisible = subsLayer.hasClass('show');
		subsLayer[isVisible ? 'removeClass' : 'addClass']('show');
		$('.remote')[isVisible ? 'removeClass' : 'addClass']('blur');
		updateSubtitlesMenu();
	}

	function setPlayStatus(status) {
		playPauseButton[status ? 'addClass' : 'removeClass']('playing');
	}

	function setPlayProgress(currentTime, duration) {
		if (lastCurrentTime !== currentTime) {
			currentTimeElement.html(timeToString(currentTime));
			lastCurrentTime = currentTime;
		}
		if (lastDuration !== duration) {
			totalTimeElement.html(timeToString(duration));
			lastDuration = duration;
		}
	}

	function setFullscreen(value) {
		fullscreenButton[value ? 'addClass' : 'removeClass']('full');
	}

	function updateVolumeTrack(pos) {
		volumeTrackSpan.width(pos + '%');
		volumeHandle.css('left', pos + '%');
	}

	function setVolume(vol, muted) {
		volume = vol;
		updateVolumeTrack(vol * 100);
		// Mute
		muteButton[muted ? 'addClass' : 'removeClass']('muted');
	}

	function setTracks(list) {
		tracks = list;
		updateSubtitlesMenu();
	}

	function updateSubtitlesMenu() {
		var tracksList = $('.tracks-list');
		tracksList.empty();
		for (var i in tracks) {
			tracksList.append('<li class="'+ (tracks[i].selected ? 'selected' : '') +'"><i class="icon icon-comment"></i><span>'+lang[tracks[i].lang]+'</span></li>');
		}
		// Click 
		tracksList.children('li').each(function(index) {
			$(this).on('click', function() {
				selectTrack(index);
			});
		});
	}

	function selectTrack(index) {
		// Remove previous selected
		for (var i in tracks) {
			if (tracks[i].selected) {
				tracks[i].selected = false;
			}
		}
		tracks[index].selected = true;
		// Notify app
		io.emit('updateTracks', tracks);
	}

	function timeToString(time) {
		var sec_num = parseInt(time, 10);
		var hours   = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (hours < 10 && hours > 0) { 
			hours = "0" + hours + ':';
		} else {
			hours = '';
		}
		if (minutes < 10) { minutes = "0" + minutes; }
		if (seconds < 10) { seconds = "0" + seconds; }

		time = hours + minutes+':'+seconds;
		return time;
	}

	function setLang(selectedLang) {
		// Get language file
		$.get('/app/locales/' + selectedLang + '.json', function(list) {
			lang = list;

			applyLangTags(list);
		});
	}

	function applyLangTags(list) {
		// Get items with translate attribute
		$('[translate]').each(function() {
			$this = $(this);
			var key = $this.text();
			if (list.hasOwnProperty(key)) {
				$this.text(list[key]);
			}
		});

		// Placeholders
		$('[placeholder-translate]').each(function() {
			$this = $(this);
			var key = $this.attr('placeholder-translate');
			if (list.hasOwnProperty(key)) {
				$this.attr('placeholder', list[key]);
			}
		});
	}
};

$(document).ready(function() {
	var remote = new Remote();
});