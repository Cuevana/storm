var gui = require('nw.gui');

var isMaximized = false;

var Player = function() {
	t = this,
	t.win = gui.Window.get(),

	t.videoId = 0,

	t.config = {
		video: {
			def: '720',
			lang: 'EN'
		},
		subtitles: {
			show: true,
			size: 30,
			color: '#FFFFFF',
			lang: 'ES'
		}
	},

	t.init = function() {

		// Load config
		t.loadConfig();

		// Check if window exists
		t.checkVideoId();

		// Load data from cache
    	if (videoData != null) {
    		var href = videoData.url, subtitles = videoData.subtitles, source = videoData.source;
    	} else {
    		alert(i18n.__('VIDEO_LOAD_ERROR'));
    		t.closeVideo();
    		t.win.close(true);
    		return;
    	}

		// Set title
		if (mainWindow.window.isWin) {
			var toolbar = $('#toolbar');

			toolbar.find('span').html(videoData.title);

			toolbar.find('.min').click(function() {
				t.win.minimize();
			})
			toolbar.find('.max').click(function() {
				isMaximized ? t.win.unmaximize() : t.win.maximize();
			})
			toolbar.find('.close').click(function() {
				t.win.close();
			})
			$('body').addClass('isWindows');

			// Resize player with toolbar
			$('#video-player').height($(window).height()-toolbar.outerHeight());
			$(window).resize(function() {
				$('#video-player').height($(window).height()-toolbar.outerHeight());
			})
		} else if (mainWindow.window.isMac) {
			$('body').addClass('isMac');
		}

    	t.win.on('close', function() {
			if (confirm(i18n.__('CLOSE_VIDEO_ALERT'))) {
				t.closeVideo();
				this.close(true);
			} else {
				this.focus();
			}
    	})

		var player_container = $('#video-player').show();

    	player_container.empty();

		var tracks = '';
		for (var i in subtitles) {
			if (subtitles[i].def == source.def) {
				tracks += '<track kind="subtitles" src="' + subtitles[i].url + '" srclang="'+subtitles[i].lang.toLowerCase()+'" label="'+(mainWindow.window.languages[subtitles[i].lang]!='undefined'?mainWindow.window.languages[subtitles[i].lang]:subtitles[i].lang)+'" charset="ISO-8859-1" '+((subtitles[i].lang == t.config.subtitles.lang)?'default':'')+' />';
			}
		}

    	$('<video id="player" width="100%" height="100%" preload autoplay><source src="'+href+'" type="video/mp4" />'+tracks+'</video>').appendTo(player_container);

	    var video = $('video');

	    video.mediaelementplayer({
			videoVolume: 'horizontal',
			features: ['playpause','current','progress','duration','fullscreen','volume','tracks','videofit','torrentinfo','fontawesome', 'customtracks'],
			success : function(mediaElement, domObject, player) {
        		t.mePlayer = player;
        		// TODO: Move me into a mediaelement plugin?
				player.container.bind('controlsshown', function() {
					player.container.css('cursor', 'auto')
				})
				player.container.bind('controlshidden', function() {
					player.container.css('cursor', 'none')
				})
			}
		});

	    // Loading info event
		t.loadVideoStats();

    	// Player events

    	// Draggable video window
    	var player_area = player_container.find('.mejs-layers, video');

    	player_area.canDragWindow();

    	// Click event (fullscreen)
    	player_area.dblclick(function(e) {
    		e.preventDefault();
    		t.win.toggleKioskMode();
    	});
    	player_container.find('.mejs-fullscreen-button').on('click', function() {
    		t.win.toggleKioskMode();
    	});

    	// Keyboard events
    	$(document).off('keydown.playercontrol').on('keydown.playercontrol', function(e) {
			if (e.preventDefault) e.preventDefault();
    		var key = e.keyCode;
    		switch (key) {
    			// Esc
    			case 27:
    				// Quit fullscreen
    				t.win.leaveKioskMode();
    				break;
    			// F
    			case 70:
    				t.win.toggleKioskMode();
    				break;
    		}
    	});

    	// Window events
    	t.win.on('enter-fullscreen', function() {
			$('body').addClass('fullscreen-mode')
			t.win.focus();
		})
		t.win.on('leave-fullscreen', function() {
			$('body').removeClass('fullscreen-mode')
			t.win.focus();
		})
		t.win.on('maximize', function () {
			isMaximized = true;
		});
		t.win.on('unmaximize', function () {
		    isMaximized = false;
		});

	}

	// Config
	t.loadConfig = function() {
		if (localStorage.getItem('config') != null) {
			t.config = JSON.parse(localStorage.getItem('config'));
		} else {
			localStorage.setItem('config', JSON.stringify(t.config));
		}
	}

	// Save config
	t.saveConfig = function() {
		localStorage.setItem('config', JSON.stringify(t.config));
	}

	// Video id
	t.checkVideoId = function() {
		t.videoId = mainWindow.window.videos_last_id;
	}

	t.loadVideoStats = function() {
		var infodiv = $('#mejs-torrent-info');
		mainWindow.window.$(mainWindow.window.document).on('videoLoading'+t.videoId, function(event, percent, speed, active, seeds) {
			infodiv.html(seeds>0 ? speed+'/s - '+active+' '+i18n.__('OF')+' '+seeds+' '+i18n.__('SEEDS') : i18n.__('LOOKING_FOR_SEEDS'));
		});
	}

    // Close video
    t.closeVideo = function() {
    	for (var i in mainWindow.window.windows) {
    		if (mainWindow.window.windows[i] == t.win) {
		    	mainWindow.window.windows.splice(i, 1);
		    	break;
		    }
	    }
    	mainWindow.window.$(mainWindow.window.document).trigger('closeVideo'+t.videoId);
    	$(document).off('keypress.playercontrol');
    	t.win.close();
    }

	// Initialize
	t.init();

}

var player;

// Drag the window by a specific element
(function( $ ){

  $.fn.canDragWindow = function() {

    return this.each(function(ix, element){

      // Since the -drag CSS property fucks up the touch events, this is a hack so we can drag the window by the video anyway.
      var mouseIsDown = false;
      var previousPos = {};

      // TODO: This breaks under multiple screens on Windows (it won't go outside the screen it's on)
      $(element).mousedown(function(event){
        // Only move with the left mouse button
        if( event.button != 0 ){ return; }
        mouseIsDown = true;
        previousPos = {x: event.screenX, y: event.screenY};
      }).mouseup(function(event){
        mouseIsDown = false;
      }).mousemove(function(event){

        var thisPos = {x: event.screenX, y: event.screenY};
        var distance = {x: thisPos.x - previousPos.x, y: thisPos.y - previousPos.y};
        previousPos = thisPos;

        if( mouseIsDown && !window.player.win.isKioskMode ){
        	event.preventDefault();
          	window.moveBy(distance.x, distance.y);
        }
      });

    });

  };

})( jQuery );
