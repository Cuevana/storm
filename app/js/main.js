var request = require('request'),
	http = require('http'),
	fs = require('fs'),
	path = require('path'),
    os = require('os'),
    moment = require('moment'),
    gui = require('nw.gui');

// Window
var win = gui.Window.get();
win.title = 'Cuevana Storm';
var windows = [];

// API endpoint
var endpoint = 'http://api.cuevana.tv';

// App version
var version = '0.1b';

// Platform 
var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var isLinux = (!isWin && !isMac);
var isMaximized = false;

// App extra variables
var videoData = {};
var languages = {
	'ES': i18n.__('SPANISH'),
	'EN': i18n.__('ENGLISH'),
	'PT': i18n.__('PORTUGUESE')
}
var genres = [
	{ key: '1', name: i18n.__('GENRE_DRAMA')},
	{ key: '2', name: i18n.__('GENRE_COMEDY')},
	{ key: '3', name: i18n.__('GENRE_THRILLER')},
	{ key: '4', name: i18n.__('GENRE_HORROR')},
	{ key: '5', name: i18n.__('GENRE_ACTION')},
	{ key: '6', name: i18n.__('GENRE_SCIFI')},
	{ key: '7', name: i18n.__('GENRE_ANIMATION')},
	{ key: '8', name: i18n.__('GENRE_FAMILY')},
	{ key: '9', name: i18n.__('GENRE_ROMANCE')},
	{ key: '10', name: i18n.__('GENRE_DOCUMENTARY')},
	{ key: '11', name: i18n.__('GENRE_MUSICAL')},
	{ key: '12', name: i18n.__('GENRE_HUMOUR')},
	{ key: '13', name: i18n.__('GENRE_FANTASY')},
	{ key: '14', name: i18n.__('GENRE_ADVENTURE')},
	{ key: '15', name: i18n.__('GENRE_MUSICALCOMEDY')},
	{ key: '16', name: i18n.__('GENRE_ROMANTICCOMEDY')},
	{ key: '18', name: i18n.__('GENRE_CRIME')},
	{ key: '19', name: i18n.__('GENRE_WAR')},
	{ key: '20', name: i18n.__('GENRE_SPORT')},
	{ key: '21', name: i18n.__('GENRE_WESTERN')},
	{ key: '22', name: i18n.__('GENRE_DOGMA')},
	{ key: '23', name: i18n.__('GENRE_FILMNOIR')},
	{ key: '24', name: i18n.__('GENRE_STANDUP')},
	{ key: '25', name: i18n.__('GENRE_MYSTERY')},
	{ key: '26', name: i18n.__('GENRE_BLACKCOMEDY')},
	{ key: '27', name: i18n.__('GENRE_DRAMATICCOMEDY')},
	{ key: '28', name: i18n.__('GENRE_SHORTFILM')}
];

// Scrollbar config
var scrollbarOptions = {
	verticalDragMinHeight: 30,
	verticalGutter: 0,
	hideFocus: true,
	enableKeyboardNavigation: false,
	mouseWheelSpeed: isWin ? 30 : 3
}

// Create tmp dir
var tmpDir = path.join(os.tmpDir(), 'Cuevana Storm');
if(!fs.existsSync(tmpDir)) { fs.mkdirSync(tmpDir); }

// Debug
var isDebug = gui.App.argv.indexOf('--debug') > -1;

// Database
var indexedDB = window.indexedDB;

if (!isDebug) {
    console.log = function () {};
} else {
    function addDeveloperTools(win) {
      // Developer Shortcuts
      win.window.document.addEventListener('keydown', function(event){
          // F12 Opens DevTools
          if( event.keyCode == 123 ) { win.showDevTools(); }
          // F11 Reloads
          if( event.keyCode == 122 ) { win.reloadIgnoringCache(); }
      });
    }
    addDeveloperTools(win);
}

function preventDragDrop(win) {
  var preventDefault = function(e) { e.preventDefault() }
  // Prevent dropping files into the window
  win.window.addEventListener("dragover",   preventDefault, false);
  win.window.addEventListener("drop",       preventDefault, false);
  // Prevent dragging files outside the window
  win.window.addEventListener("dragstart",  preventDefault, false);
}
preventDragDrop(win);

var Storm = function() {
	t = this,
	t.config = {
		version: '0.1b',
		video: {
			def: '720',
			lang: 'EN'
		},
		subtitles: {
			show: true,
			size: 30,
			color: '#FFFFFF',
			lang: 'ES'
		},
		orderBy: {
			active: false,
			type: 'name',
			order: 'asc'
		}
	},
	t.ajaxcalls = [],
	t.totalajaxcalls = 0,
	t.gridStyle = 'normal',
	t.lastSearchValue = '',
	t.lastRequest = '',
	t.topButtons = $('.top-buttons'),
	t.loadBarInfo = $('#loading-bar .download-info'),
	t.lastURL = {},
	t.featured = [],
	t.featuredTimeout,

	// Elements
	t.dview = $('#detail-view'),
	t.darkAll = $('#dark-bg'),
	t.darkMain = $('#dark-main'),

	t.init = function() {
		// Delete cache on startup (dev mode)
		localStorage.clear();
		
		// Load config
		t.loadConfig();

		// Toolbar in Windows
		if (isWin) {
			var toolbar = $('#toolbar');
			toolbar.find('.min').click(function() { win.minimize()	});
			toolbar.find('.max').click(function() { isMaximized ? win.unmaximize() : win.maximize() });
			toolbar.find('.close').click(function() { win.close() });
			$('body').addClass('isWindows');
		} else if (isMac) {
			$('body').addClass('isMac');
		} else if (isLinux) {
			$('body').addClass('isLinux');
		}

		// Window height containers
		t.resizeElements();

		// Moment lang
		moment.lang('es');

		// Check for updates
		t.checkUpdates();

		// Input search focus
		$('#q').on('focus', function() {
			$(this).parent().addClass('focus');
		}).on('blur', function() {
			$(this).parent().removeClass('focus');
		})

		// Menu actions
		var menuli = $('#menu li:not(.title)');
		menuli.each(function() {
			var $this = $(this);
			$this.click(function(event) {
				menuli.removeClass('selected');

				// Update grid style
				t.updateViewStyle($this.attr('data-style'), true);
				t.config.orderBy.active = false;

				var type = $this.attr('data-type');
				switch(type) {
		    		// Featured
			    	case 'featured':
			    		t.renderFeatured($this.attr('data-action'));
			    		break;
		    		// Load history from cache
			    	case 'history':
			    		t.getHistory();
			    		break;
			    	case 'tvshows_following':
			    		t.renderFollowing();
			    		break;
			    	// Default - load view grid
			    	default:
						t.loadView(type, $this.attr('data-action'));
						break;
		    	}
				$this.addClass('selected');
			});
		})

		// Load default view / First menu item
		menuli.eq(0).trigger('click');

		// Search list
		$('#q').on('keyup', $.throttle(
			250, function(e) {
				if (e.preventDefault) e.preventDefault();
				var key = e.keyCode;

				var c = String.fromCharCode(key);
   				var isWordcharacter = c.match(/\w/);

				switch(key) {
					// enter
					case 13:
						if (e.target.value != '') t.searchList(e);
						break;
					// esc
					case 27:
						e.target.value = '';
						break;
					default:
						if ((isWordcharacter || e.target.value != t.lastSearchValue) && e.target.value.length > 0) t.searchList(e, true);
						break;
				}

				// Clean search
				if (e.target.value == '') {
					$('#main .grid').empty();
				}
				// Unselect menu
				menuli.removeClass('selected')
			}
		));

		// Drop menus
		$('.menu-handler').off('click.menu').on('click.menu',function() {
			t.dropMenu(this);
			return false;
		})

		// Detail view close
		t.dview.find('.close_button').click(function() {
			t.closeItemView();
		})

		// Clean history button
		$('#clean-history').click(function() {
			t.cleanHistory();
		})

		// Event window resize
		$(window).on('resize', $.throttle(250, function() {
			t.resizeElements();
		}))

		win.on('enter-fullscreen', function() {
			$('body').addClass('fullscreen-mode')
			win.focus();
		})
		win.on('leave-fullscreen', function() {
			$('body').removeClass('fullscreen-mode')
			win.focus();
		})
		win.on('maximize', function () {
			isMaximized = true;
		});
		win.on('unmaximize', function () {
		    isMaximized = false;
		});

		win.on('close', function() {
			this.hide(); // Pretend to be closed already
			t.closeAllWindows();

			// Clean tmp dir
			if (fs.existsSync(tmpDir)) {
				fs.readdir(tmpDir, function(err, files) {
					if (!err) {
						if (files.length > 0) {
							for (var i in files) {
								var filePath = tmpDir + files[i];
								fs.stat(filePath, function(err, stats) {
									if (!err) {
									 	if (stats.isFile()) {
											fs.unlink(filePath);
										}
									}
								});
							}
						}
					}
				})
			}

			return this.close(true);

			if (t.ajaxcalls.length > 0) {
				if (confirm(i18n.__('PENDING_REQUESTS'))) {
					this.close(true);
				} else {
					this.show();
					this.focus();
				}
			}
		});

		// Custom scrolls
		$('.scrollbar').jScrollPane(scrollbarOptions);

		// Populate genres
		genres.sort(function(a,b){
		  return a.name.localeCompare(b.name);
		});
		var mg = $('#menu_genre').children('ul');
		mg.append('<li data-id="">'+i18n.__('ALL_GENRES')+'</li>');
		for (var i in genres) {
			mg.append('<li data-id="'+genres[i].key+'">'+genres[i].name+'</li>');
		}
		// Genre click
		mg.find('li').click(function() {
			$('#select-genre .text').html($(this).text());
			t.setGenre($(this).attr('data-id'));
		})

		// Featured tabs
		$('.featured-buttons a').click(function() {
			$(this).parent().children('.sel').removeClass('sel');
			$(this).addClass('sel')
			t.renderFeatured($(this).attr('data-type'));
		})

		// Featured
		t.featured = t.loadFeaturedList();

		// Open the connection to the history DB
		// Open the connection to the following DB
		indexedDB.openConnection();

	}

	t.trackPageview = function(url) {
		if (window._gaq) {
			_gaq.push(['_trackPageview', '/app'+url]);
		}
	}

	t.checkUpdates = function() {
		var url = endpoint+'/update';

		var ac = t.newAjaxCallId();

		request({
			url: url,
			method: 'GET',
			json: true
		}, function(error, response, data) {
			 if (!error && response.statusCode == 200) {
				if (data.version != window.version) {
					$('#app-alert').show().find('button').click(function() {
						gui.Shell.openExternal(data.download_url);
					})
				}
			}
			t.delAjaxCall(ac);
		})
		setTimeout(t.checkUpdates, 86400000);
	}

	// Resize elements
	t.resizeElements = function() {
		var he = $(window).height();
		$('#menu, #main').height(he-$('#menu').offset().top);
		$('#menu ul').height(he-$('#menu ul').offset().top);
		$('#grid-container').height(he-$('#grid-container').offset().top);
		$('.scrollbar').jScrollPane(scrollbarOptions);
	}

	// Close all open windows
	t.closeAllWindows = function() {
		for (var i in windows) {
			windows[i].close(true);
		}
		windows = [];
	}

	// Config
	t.loadConfig = function() {
		if (localStorage.getItem('config') != null) {
			var config = JSON.parse(localStorage.getItem('config'));
			if (config.version != t.config.version) {
				localStorage.removeItem('config');
			} else {
				t.config = config;
			}
		} else {
			localStorage.setItem('config', JSON.stringify(t.config));
		}
	}

	// Save config
	t.saveConfig = function() {
		localStorage.setItem('config', JSON.stringify(t.config));
	}

	// Ajax calls
	t.newAjaxCallId = function () {
        t.totalajaxcalls++;
        t.ajaxcalls.push(t.totalajaxcalls);
        return t.totalajaxcalls
    }
    t.delAjaxCall = function (id) {
        var i = t.ajaxcalls.indexOf(id);
        if (i != -1) {
            t.ajaxcalls.splice(i, 1)
        }
    }

    // Search
    t.searchList = function(e, suggest) {
    	var q = $.trim(e.target.value);
    	if ((!suggest && q.length <=1) || (suggest && q.length <= 0)) return;

		t.config.orderBy.active = false;
    	t.loadView('search'+(suggest?'/suggest':''), null, null, 'q='+encodeURIComponent(q), null, false, function() {
    		t.updateViewStyle('search');
    	});
    	t.lastSearchValue = q;
    }

    // Load view
	t.loadView = function(type, action, id, vars, page, append, scrollcallback) {
		
		// Close detail view if open
		t.closeItemView();

		// Save last URL
		t.lastURL = {
			type: type,
			action: action,
			id: id,
			vars: vars,
			page: page,
			append: append
		}

		// Clean genre
		if (vars == null || vars.indexOf('genre') == -1) {
			t.setGenre('', true);
		}

		// Url variables
		action_url = (action != null) ? '/'+encodeURIComponent(action) : '';
		id_url = (id != null) ? '/'+id : '';
		vars_url = (vars != null) ? vars : '';
		page_url = (page != null) ? '&page='+page : '';

		// Orderby
		if (t.config.orderBy.active) {
			vars_url += '&orderby='+t.config.orderBy.type+'&order='+t.config.orderBy.order;
		}

		t.trackPageview('/'+type+action_url+id_url+'?'+vars_url+page_url);
		var url = endpoint+'/'+type+action_url+id_url+'?'+vars_url+page_url;

		// Set callback and time for cache
		var callback = function(url, data) {
			// Hide initial loading screen
			$('#init-load').hide();

    		if (id != null) {
				t.renderItemView(data)
			} else {
				t.renderGrid(data, append)
			}
			if (typeof scrollcallback == 'function') {
				scrollcallback();
			}
    	}, time = 3600000;

    	// Load cached view data
		if (t.isCached(url,time,callback)) return;

		var ac = t.newAjaxCallId();
		t.loader();

		t.lastRequest = url;

		request({
			url: url,
			method: 'GET',
			json: true
		}, function(error, response, data) {
			 if (!error && response.statusCode == 200) {
			 	if (url == t.lastRequest) {
					callback(url, data)
					t.saveCache(url, data);
				}
			} else if (error) {
				t.ajaxError('noconnection');
			}
			t.delAjaxCall(ac);
			t.loader(true)

			// Hide initial loading screen if error
			$('#init-load').hide();
		})
	}

	// Render grid
	t.renderGrid = function(data, append) {
		append = (append != null) ? append : false;

		var grid = $('#main .grid').show(), examplegrid = $('#main .grid-example li'), gridcontainer = $('#grid-container');

		t.topButtonBar(t.lastURL.type, t.lastURL.action);
		
		// Clean
		if (!append) grid.empty();

		if (data == null || data == 'undefined' || data.data == 'undefined' || data.data.length == 0) {
			gridcontainer.jScrollPane(scrollbarOptions);
			return;
		}

		// List series
		if (t.lastURL.type=='series' && t.lastURL.action == '') {
			grid.addClass('tvshowslist');
			var input = 
			grid.prepend()
		}

		// OrderBy
		var lastURL = t.lastURL;
		t.topButtons.find('.orderby li:not(.default)').off('click').on('click', function(event) {
			var $this = $(this);
			t.setOrderBy($this.attr('data-type'),$this.hasClass('asc') ? 'desc' : 'asc');
			t.loadView(lastURL.type, lastURL.action, null, lastURL.vars);
		});

		var number = data.from;

		for (var i in data.data) {
			
				var item = examplegrid.clone();

				// Title
				item.find('.title').html(data.data[i].name)
				item.find('.subtitle').html((data.data[i].type=='episode') ? data.data[i].tvshow.name : data.data[i].year)

				// List style
				switch (t.gridStyle) {
					// Numbered
					case 'numbered':
						item.prepend('<span class="number">'+number+'</span>');
						item.find('.subtitle').html(data.data[i].year)
						item.addClass('clearfix')
						break;
				}

				// Image
				item.find('img').attr('src', (data.data[i].type=='episode') ? data.data[i].tvshow.cover_url : data.data[i].cover_url).on('error', function() {
					$(this).attr('src','img/nocover.jpg')
				})

				// Click event
				item.data('savedI', i).on('click', function() {
					t.loadView(data.data[$(this).data('savedI')].type+'s', null, data.data[$(this).data('savedI')].id);
				});

				// t.checkWatched(data.data[i].id, function(result) {
				// 	item.append("WATCHED!");
				// });
				
				grid.append(item);
				number++;
		}


		// Reload jscrollpane
		gridcontainer.jScrollPane(scrollbarOptions);

		if (append) return;

		// Reset scroll event and scroll position
		var api = gridcontainer.data('jsp');

		gridcontainer.off('.infinite');
		api.scrollTo(0,0);


		var gapUpdatePage = 200, gridLoading = false, current_page = data.current_page, last_page = data.last_page;

		gridcontainer.on('jsp-scroll-y.infinite', $.throttle(250, function(event, scrollPositionY, isOnTop) {
			if (gridLoading || current_page >= last_page) return;
			isOnTop ? t.topButtons.addClass('istop') : isOnTop!=null ? t.topButtons.removeClass('istop') : null;
			var $this = $(this), gridHeight = grid.outerHeight(), elementHeight = $this.outerHeight();
			var gapToBottom = gridHeight-elementHeight-scrollPositionY;
			if (gapToBottom < gapUpdatePage) {
				gridLoading = true;
				current_page++;
				t.loadView(t.lastURL.type, t.lastURL.action, null, t.lastURL.vars, current_page, true, function() {
					gridLoading = false;
					// if window.height > grid.height, keeps loading...
					$this.trigger('jsp-scroll-y', [scrollPositionY]);
				});
			}
		}));

		// if window.height es mayor al grid.height, sigue cargando más...
		gridcontainer.trigger('jsp-scroll-y', [api.getContentPositionX()]);

		// Also check on window resizing.
		$(window).off('resize.infinite').on('resize.infinite', function() { gridcontainer.trigger('jsp-scroll-y', [api.getContentPositionX()]) });
	}

	// Render grid
	t.renderGridFromDB = function(data) {
		// Close detail view if open
		t.closeItemView();

		var grid = $('#main .grid').show(), examplegrid = $('#main .grid-example li'), gridcontainer = $('#grid-container');
		
		grid.empty();
		t.topButtonBar();

		if (data == null) {
			gridcontainer.jScrollPane(scrollbarOptions);
			return;
		}
		grid.addClass('tvshowslist');
		var input = grid.prepend()

		for (var i in data) {
			var item = examplegrid.clone();

			// Title
			item.find('.title').html(data[i].name);
			//item.find('.subtitle').html("X Episodes to watch");

			// Image
			item.find('img').attr('src', data[i].data.cover_url).on('error', function() {
				$(this).attr('src','')
			})

			// Click event
			item.data('savedI', i).on('click', function() {
				t.renderItemView(data[$(this).data('savedI')].data);
			});

			grid.append(item);
		}


		// Reload jscrollpane
		gridcontainer.jScrollPane(scrollbarOptions);

		// Reset scroll event and scroll position
		var api = gridcontainer.data('jsp');

		gridcontainer.off('.infinite');
		api.scrollTo(0,0);


		var gapUpdatePage = 200, gridLoading = false, current_page = data.current_page, last_page = data.last_page;

		gridcontainer.on('jsp-scroll-y.infinite', $.throttle(250, function(event, scrollPositionY, isOnTop) {
			if (gridLoading || current_page >= last_page) return;
			isOnTop ? t.topButtons.addClass('istop') : isOnTop!=null ? t.topButtons.removeClass('istop') : null;
			var $this = $(this), gridHeight = grid.outerHeight(), elementHeight = $this.outerHeight();
			var gapToBottom = gridHeight-elementHeight-scrollPositionY;
			if (gapToBottom < gapUpdatePage) {
				gridLoading = true;
				current_page++;
				//t.loadView(t.lastURL.type, t.lastURL.action, null, t.lastURL.vars, current_page, true, function() {
				//	gridLoading = false;
					// if window.height > grid.height, keeps loading...
				//	$this.trigger('jsp-scroll-y', [scrollPositionY]);
				//});
			}
		}));

		// if window.height es mayor al grid.height, sigue cargando más...
		gridcontainer.trigger('jsp-scroll-y', [api.getContentPositionX()]);

		// Also check on window resizing.
		$(window).off('resize.infinite').on('resize.infinite', function() { gridcontainer.trigger('jsp-scroll-y', [api.getContentPositionX()]) });
	}

	// Load featured list
	t.loadFeaturedList = function() {
		var url = endpoint+'/featured';

		// Set callback and time for cache
		var callback = function(url, data) {
			t.featured = data;
			t.populateFeatured();
    	}, time = 86400000;

    	// Load cached view data
		if (t.isCached(url,time,callback)) return;

		var ac = t.newAjaxCallId();

		request({
			url: url,
			method: 'GET',
			json: true
		}, function(error, response, data) {
			 if (!error && response.statusCode == 200) {
				callback(url, data)
				t.saveCache(url, data);
			} else if (error) {
				t.ajaxError('noconnection');
			}
			t.delAjaxCall(ac);
		})
	}

	// Populate featured based on data
	t.populateFeatured = function() {
		var preview = $('#featured .preview');
		for (var i in t.featured) {
			var li = $('<li><span></span></li>').appendTo(preview).data('info', {
				title: t.featured[i].title,
				text: t.featured[i].text,
				type: t.featured[i].type,
				id: t.featured[i].id,
				img_url : t.featured[i].img_url
			})
		}
		preview.children('li').on('click', function() {
			clearTimeout(t.featuredTimeout);
			t.setFeatured(preview.children('li').index($(this)));
		})
		// Set initial
		t.setFeatured(0);
	}

	t.setFeatured = function(index) {
		var preview = $('#featured .preview'), li = preview.children('li'), total = li.length-1, view = 3;
		li.removeClass();
		var item = li.eq(index), data = item.data('info');
		item.addClass('sel');

		// preview row
		for (var i=0;i<=index;i++) {
			li.eq(i).clone(true).appendTo(preview);
		}
		var scroll = item.outerHeight()*(index+1);
		preview.animate({
			top: '-='+scroll+'px'
		}, 200*(index+1), function() {
			for (var i=index;i>=0;i--) {
				preview.children('li').eq(i).remove();
			}
			$(this).css('top','0');
		});

		// load visible images (+1)
		for (var i=index+1;i<=(index+view+1);i++) {
			if (li.eq(i).length) li.eq(i).css('background-image','url('+li.eq(i).data('info').img_url+')');
		}

		// main
		$('#featured .main').css('background-image','url('+data.img_url+')').off('click').on('click', function() {
			t.loadView(data.type+'s', null, data.id);
		});
		$('#featured .main h2').html(data.title);
		$('#featured .main p').html(data.text);

		t.featuredTimeout = setTimeout(function() {
			var next = index>=total ? 0 : index;
			t.setFeatured(next)
		}, 8000);
	}

	// Render featured grid
	t.renderFeatured = function(type) {
		type=='tvshows' ? type : 'movies';
		t.topButtonBar(null, 'featured');
		t.loadView(type,'featured');
	}

	t.renderFollowing = function() {
		//t.topButtonBar(null, 'featured');
		t.getFollowing(t.renderGridFromDB);
	}

	// Render History grid
	t.renderHistory = function(data) {

		// Hide initial loading screen
		$('#init-load').hide();

		// Close detail view if open
		t.closeItemView();

		var grid = $('#main .grid').show(), examplegrid = $('#main .grid-example li'), gridcontainer = $('#grid-container');

		t.topButtonBar(null, 'history');
		
		// Clean
		gridcontainer.off('.infinite');
		gridcontainer.data('jsp').scrollTo(0,0);
		grid.empty();

		if (data == null || data == 'undefined' || data.length == 0) {
			// Load clean history message
			$('#history-noitems').show();
			gridcontainer.jScrollPane(scrollbarOptions);
			return;
		}

		data.sort(function(a,b){
		 // Turn your strings into dates, and then subtract them
		 // to get a value that is either negative, positive, or zero.
		 return new Date(b.date) - new Date(a.date);
		});

		var today = moment([moment().get('year'),moment().get('month'),moment().get('date')]);
		var yesterday = moment([moment().get('year'),moment().get('month'),moment().get('date')]).subtract('days', 1);

		for (var i in data) {

			// Today
			if (moment(data[i].date).isAfter(today)) {
				var titleli = grid.find('.title.today');
				if (!titleli.length) {
					titleli = $('<li class="title today">'+i18n.__('TODAY')+'</li>').appendTo(grid);
				}
			} else if (moment(data[i].date).isAfter(yesterday)) {
				var titleli = grid.find('.title.yesterday');
				if (!titleli.length) {
					titleli = $('<li class="title yesterday">'+i18n.__('YESTERDAY')+'</li>').appendTo(grid);
				}
			} else {
				var week = moment(data[i].date).fromNow();
				var w = week.replace(/ /g, '');
				var titleli = grid.find('.title.'+w);
				if (!titleli.length) {
					titleli = $('<li class="title '+w+'">'+week+'</li>').appendTo(grid);
				}
			}

			var item = examplegrid.clone();

			// Title
			item.find('.title').html(data[i].data.type=='episode' ? data[i].data.tvshow.name+': '+data[i].data.name : data[i].data.name)

			item.find('.subtitle').html('<span class="date">'+t.friendlyDate(data[i].date)+'</span>')
			item.addClass('clearfix')

			// Image
			item.find('img').attr('src', data[i].data.type=='episode' ? data[i].data.tvshow.cover_url : data[i].data.cover_url).on('error', function() {
				$(this).attr('src','img/nocover.jpg')
			})

			// Click event
			item.data('savedI', i).on('click', function() {
				t.renderItemView(data[$(this).data('savedI')].data);
			});

			item.data('timestamp', data[i].date);

			var deleteButton = "<button class='delete-single-history' onclick='t.removeHistory($(this).parent().data(\"timestamp\"))'>X</button>";

			item.append(deleteButton); 

			grid.append(item);
		}


		gridcontainer.jScrollPane(scrollbarOptions);
	}

	// Render item
	t.renderItemView = function(data) {
		if (data.type == 'tvshow' || data.type == "episode") {
			$("#follow_button").show();
			$("#follow_button").text("...");
			t.updateFollowButton(data);
		} else
			$("#follow_button").hide();
		
		t.dview.removeClass('closed tvshow episode movie');
		t.darkMain.show();

		t.dview.addClass(data.type || 'movie');

		var finaldata = (data.type == 'episode') ? data.tvshow : data;
		var subtitle = (data.type == 'episode') ? data.tvshow.name : data.year;

		t.dview.find('.name').html(data.name);
		t.dview.find('.year').html(subtitle);
		t.dview.find('.poster').css('background-image', 'url('+finaldata.cover_url+')');

		t.dview.find('.genre').html(data.genre.name);
		t.dview.find('.language').html(data.language.name);
		t.dview.find('.duration').html(data.duration);

		t.dview.find('.cast').html(data.cast);
		t.dview.find('.director').html(data.director);
		t.dview.find('.plot').html(data.plot);

		// Rating
		t.dview.find('.rating span').width(Math.round(data.rating*100/5)+'%');
		t.dview.find('.rating-score .score span').html(Math.round(data.rating*100)/100);

		// If TV Show, show seasons and episodes
		if (data.type == 'tvshow') {
			t.dview.find('.action_buttons').hide();
			var seasons_div = t.dview.find('.seasons'), example_div = t.dview.find('.seasons > div.example');
			
			seasons_div.children('div').not(example_div).remove();
			for (var i in data.seasons) {
				var element = example_div.clone().removeClass().appendTo(seasons_div);
				element.find('h3 .number').html(data.seasons[i].number);

				var ul = element.find('ul');
				for (var n in data.seasons[i].episodes) {
					var li = ul.children('li.example').clone().removeClass().appendTo(ul);
					li.find('.number').html(data.seasons[i].episodes[n].number)
					li.find('.name').html(data.seasons[i].episodes[n].name)

					li.find('.rating span').width(Math.round(data.seasons[i].episodes[n].rating*100/5)+'%');

					t.checkWatched(data.seasons[i].episodes[n].id, function(result) {
						li.find('.name').html(data.seasons[i].episodes[n].name + " (WATCHED)")
						li.css('color', 'rgb(68, 68, 68)');
					});

					li.data('id', data.seasons[i].episodes[n].id).click(function(e) {
						t.loadView('episodes', null, $(this).data('id'));
					});
				}
			}
			if (seasons_div.hasClass('ui-accordion')) {
				seasons_div.accordion("destroy")
			}
			seasons_div.accordion({
				collapsible: true,
				header: 'h3',
				heightStyle: "content",
				activate: function( event, ui ) {
					t.dview.jScrollPane(scrollbarOptions);
					if (ui.newHeader.length) t.dview.data('jsp').scrollToElement(ui.newHeader, false);
				}
			});
		} else {
			// If episode, episode info
			if (data.type == 'episode') {
				var np = t.dview.find('.nextprevious');
				np.children('.prev').off('click').on('click', function() {
					if (data.prev_episode) t.loadView('episodes', null, data.prev_episode);
				})
				np.children('.next').off('click').on('click', function() {
					if (data.next_episode) t.loadView('episodes', null, data.next_episode);
				})
				np.children('.gotoshow').off('click').on('click', function() {
					t.loadView('tvshows', null, data.tvshow.id);
				})
				t.dview.find('.season').html(data.season);
				t.dview.find('.episode').html(data.number);
			}

			// Sources
			if (data.sources != null && data.sources.length > 0) {
				t.dview.find('.action_buttons').show()

				// Populate
				t.populateMenuData(data, 'audio')
				t.populateMenuData(data, 'def')

				// Play-button
				t.dview.find('.play-button').off('click.play').on('click.play', function() {
					t.loadVideo(data);
				});
				t.dview.find('.separator').eq(0).hide();
			} else {
				t.dview.find('.action_buttons').hide()
				t.dview.find('.separator').show();
			}
		}

		t.dview.jScrollPane(scrollbarOptions);
		t.dview.data('jsp').scrollTo(0,0);

		// Close events
		$(document).off('.renderitem');
		t.darkMain.off('.renderitem');
		setTimeout(function() {
			$(document).on('keydown.renderitem', function(e) {
	    		if (e.keyCode == 27) {
	    			t.closeItemView();
	    			$(document).off('.renderitem');
	    		}
	    	})
			t.darkMain.on('click.renderitem', function() {
				t.closeItemView();
				$(this).off('.renderitem');
			})
		}, 1);
	}

	t.closeItemView = function() {
		t.dview.addClass('closed')
		t.darkMain.hide();
	}

	// Friendly format date
	t.friendlyDate = function(date) {
		var text = '', ti = moment(date), td = moment().unix()-ti.unix();
		if (td > 86400*2) {
			if (moment().year() != ti.year()) {
				text = ti.format('LLLL');
			} else {
				text = ti.format('LLL');
			}
		} else if (td > 86400) {
			text = ti.fromNow()+', '+ti.format('LT');
		} else {
			text = ti.fromNow();
		}
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	// Populate source menu data
	t.populateMenuData = function(data, type) {
		var menu = $('#menu_'+type+' ul');

		// Clean
		menu.find('li:not(.title)').remove();

		// Populate
		var listed = [], first = false;
		if (type == 'audio') {
			// list
			for (var i in data.sources) {
				var audio = data.sources[i].lang, label = (languages[audio]!='undefined'?languages[audio]:audio);
				if ($.inArray(audio,listed) == -1) {
					menu.append('<li data-value="'+audio+'">'+label+'</li>');
					listed.push(audio)
				}
				// Default
				if (!first || audio == t.config.video.lang) {
					t.dview.find('.source-'+type).find('.text').html(label)
					first = true;
				}
			}
		} else {
			// Order sources
			data.sources.sort((function(index){
			    return function(a, b){
			        return (a[index] === b[index] ? 0 : (parseInt(a[index]) < parseInt(b[index]) ? -1 : 1));
			    };
			})('def'));
			// List
			for (var i in data.sources) {
				var def = data.sources[i].def, label = def+'p '+(parseInt(def)>=720?'HD':'SD');
				if ($.inArray(def,listed) == -1) {
					menu.append('<li data-value="'+def+'">'+label+'</li>');
					listed.push(def)
				}
				// Default
				if (!first || def == t.config.video.def) {
					t.dview.find('.source-'+type).find('.text').html(label)
					first = true;
				}
			}
		}

		menu.find('li:not(.title)').each(function(index) {
			var $this = $(this);
			$this.off('click').on('click', function() {
				var val = $this.attr('data-value');
				// Update config
				if (type=='audio') {
					t.config.video.lang = val;
				} else {
					t.config.video.def = val;
				}
				t.dview.find('.source-'+type).find('.text').html($this.text());
				t.saveConfig();
			})
		})
	}

	// Dropmemenu
    t.dropMenu = function(a, hide) {
	    var a = $(a), m = a.attr('data-menu'), d = $('#menu_'+m);
	    $('.menu-drop').not(d).each(function() {
		    $(document).trigger('click.menudrop_'+$(this).attr('id').replace('menu_', ''))
	    })
		if (hide || d.is(':visible')) {
			d.slideUp(150).animate({opacity:0},{queue:false, duration: 150});
			a.removeClass('sel');
			$(document).off('click.menudrop_'+m)
		} else {
			var width = $(window).width();
			var left = (a.offset().left+d.outerWidth()>width)?width-d.outerWidth():a.offset().left;
			d.css({
				left: (left+d.outerWidth()==width)? left-15 : left,
				top: a.offset().top+a.outerHeight()
			});
			if (d.hasClass('fittowidth')) d.css('min-width',a.outerWidth())
			
			d.css('opacity',0).slideDown(150, function() {
				if (d.hasClass('withscroll')) d.children('ul').jScrollPane(scrollbarOptions);
			}).animate({opacity:1},{queue:false, duration: 150});
			a.addClass('sel');
			$(document).on('click.menudrop_'+m,function() {
				t.dropMenu(a, true);
				$(document).off('click.menudrop_'+m)
			})
		}
		return false;
    }

	// Actualiza el estilo del grid
	t.updateViewStyle = function(style, hidegrid) {
		var grid = $('#main .grid');
		if (hidegrid) grid.hide();
		grid.removeClass('numbered search history tvshowslist');
		switch (style) {
			case 'pick':
				break;
			case 'numbered':
				grid.addClass('numbered');
				break;
			case 'search':
				grid.addClass('search');
				break;
			case 'history':
				grid.addClass('history');
				break;
			default:
				break;
		}
		t.gridStyle = style;
	}

    // Save in cache (con timestamp)
    t.saveCache = function(url, data) {
    	var id = md5(url);
    	localStorage.setItem(id, JSON.stringify({time:new Date().getTime().toString(), value: data}));
    }

	// Local storage (si está cacheado, usa callback) : callback(id, value)
    t.isCached = function(url, time, callback) {
    	if (time==null || time<=0) {
    		return false;
    	}
		var id = md5(url);
		if (localStorage.getItem(id) != null) {
			var j = JSON.parse(localStorage.getItem(id));
    		
			if (t.cacheTime(parseInt(j.time),time)) {
    			if (typeof callback == 'function') {
    				callback(url, j.value);
    			}
    			return true;
			} else {
				localStorage.removeItem(id)
			}
		}
    	return false;
    }
    
    // Update time
    t.cacheTime = function(t,time) {
    	var now = new Date().getTime();
    	if ((now-t) > time) {
    		return false;
    	}
    	return true;
    }

    // Load video from torrent
    t.loadVideo = function(data) {
    	var source = false;
    	for (var i in data.sources) {
    		if (data.sources[i].def == t.config.video.def) {
    			source = data.sources[i];
    			break;
    		}
    	}
    	// Set first source if default (config) not available
    	if (!source) {
	    	for (var i in data.sources) {
    			source = data.sources[i];
    			break;
	    	}
	    }

    	// Loadbar
    	$('#loading-bar').find('.head').html(i18n.__('LOADING_VIDEO'));
    	$('#loading-bar').find('.msg').html(i18n.__('PLEASE_WAIT_PLAY'));
    	t.loadBarInfo.html(i18n.__('LOADING_TORRENT'));
    	t.loadingBar(0);

    	// Load cancel
    	$('#loading-bar .cancel').show().off('click').on('click', function() {
    		// Cancel loading video
    		t.cancelLoadingVideo();
    	});

    	var title = data.type=='movie' ? data.name+' ('+data.year+')' : data.tvshow.name+': '+data.name;

    	playTorrent(source.url, function(err, href) {
    		if (err) {
    			t.cancelLoadingVideo();
    			t.popupAlert(i18n.__('INVALID_FILE'),i18n.__('TORRENT_NOT_LOADED'));
    		} else {
	    		// Hide loading bar
	    		t.loadingBarHide();
	    		// Play
	    		t.playVideo(href, data.subtitles, source, title);
	    		// Push history
	    		t.addHistory(data);
	    	}
    	}, function(percent, started, speed, active, seeds, timeout, video_id) {
    		if (started) {
    			$(document).trigger('videoLoading'+video_id, [percent, speed, active, seeds]);
    		} else {
	    		// Loading bar
	    		t.loadingBar(percent);
	            t.loadBarInfo.html( seeds>0 ? speed+'/s - '+active+' '+i18n.__('OF')+' '+seeds+' '+i18n.__('SEEDS') : i18n.__('LOOKING_FOR_SEEDS'));

	            // If download is stalled, restart
	            if (timeout) {
	                t.cancelLoadingVideo();
	                $('#detail-view .play-button').click();
	            }
	        }

    	});
    	$(document).on('keydown.loadvideo', function(e) {
    		if (e.keyCode == 27) {
    			t.cancelLoadingVideo();
    		}
    	})
    }

    // Play video
    t.playVideo = function(href, subtitles, source, title) {
    	// Set vars
    	var videoData = {
    		title: title,
    		url: href,
    		subtitles: subtitles, 
    		source:source
    	};
    	// localStorage.setItem('videoData', JSON.stringify(videoData));

    	var player_window = t.createPlayerWindow(title, videoData);
    }

    // Cancel loading video
    t.cancelLoadingVideo = function() {
    	for (var i in window.videos) {
			if (window.videos[i].id == window.videos_last_id) {
				$(document).trigger('closeVideo'+window.videos[i].id);
				break;
			}
		}
		t.loadingBarHide();
    	$(document).off('.loadvideo');
    }

    // Create player window
    t.createPlayerWindow = function(title, videoData) {
    	var new_window = gui.Window.open('app://cuevana/app/views/player.html', {
    		title: title,
    		toolbar: false,
    		frame: (isWin ? false : true),
		    icon: "./app/assets/icons/512x512.png",
    		position: 'center',
    		width: 1280,
    		height: 720,
    		min_width: 640,
    		min_height: 360,
    		focus: true
    	});

    	new_window.on('loaded', function() {
        	if (isDebug) addDeveloperTools(new_window);
        	preventDragDrop(new_window);
    		new_window.window.videoData = videoData;
    		new_window.window.mainWindow = win;
    		new_window.window.player = new new_window.window.Player();
    	})

    	windows.push(new_window);

    	return new_window;
    }

    //History Database

	/**
	* Opens a connection to the db. It creates one if necessary.
	*
	* @param databaseName the name of the database to open or create
	* @param keyname the key of the database to create
	*/
	indexedDB.openConnection = function() {
		var version = 1;
		// Open a connection to the db.
		var request1 = indexedDB.open("StormDatabase1", version);

		// Triggered if store doesn't exists (or version changes)
		request1.onupgradeneeded = function(eventData) {
			var db = eventData.target.result;
			//Error Handling
			eventData.target.transaction.onerror = indexedDB.onerror; 

			// Create a new datastore.
			var objectStore1 = db.createObjectStore("history", {keyPath: "date"});
			var objectStore2 = db.createObjectStore("following", {keyPath: "name"});

			objectStore1.createIndex("id","data.id", {unique:true});
			objectStore2.createIndex("id","data.id", {unique:true});
		};

		// Handle successful datastore access.
		request1.onsuccess = function(e) {
			// Get a reference to the DB.
			indexedDB.db = e.target.result;
		};

		// Handle errors when opening the datastore.
		request1.onerror = function(e) {
			console.log(e);
		};
	};

	/**
	* Fetch all of the contents for databaseName
	* 
	* @param databaseName the name of the database to fetch
	* @param callback a function that receives the objects fetched as parameter 
	*/
	indexedDB.fetchAll = function(databaseName, callback) {
		var transaction = indexedDB.db.transaction([databaseName]);
		var objectStore = transaction.objectStore(databaseName);

		var keyRange = IDBKeyRange.lowerBound(0);
		var cursorRequest = objectStore.openCursor(keyRange);

		ret = new Array();

		transaction.oncomplete = function(e) {
			callback(ret);
		};

		cursorRequest.onsuccess = function(e) {
			var result = e.target.result;
			if (!!result == false) 
				return;
			ret.push(result.value);
			result.continue();
		};

		cursorRequest.onerror = function(e) {
			console.log(e);
		};
	};

	/**
	* Fetchs an element from databaseName
	* 
	* @param databaseName the name of the database to fetch
	* @param key of the object to fetch
	* @param callback a function that receives the object fetched as parameter
	*/
	indexedDB.fetch = function(databaseName, key, callback) {
		var transaction = indexedDB.db.transaction([databaseName], 'readonly');
		var objectStore = transaction.objectStore(databaseName);

		var request = objectStore.get(key);
		var result;

		request.onerror = function(e) {
			console.log(e);
		}

		request.onsuccess = function(e) {			
			result = e.target.result;		
		}

		transaction.oncomplete = function(e) {
			callback(result);
		};
	};

	indexedDB.fetchByIndex = function(databaseName, indexValue, callback) {
		var transaction = indexedDB.db.transaction([databaseName], 'readonly');
		var objectStore = transaction.objectStore(databaseName);
		var index = objectStore.index("id");

		var request = index.get(indexValue);
		var result;

		request.onerror = function(e) {
			console.log(e);
		}

		request.onsuccess = function(e) {			
			result = e.target.result;
		}

		transaction.oncomplete = function(e) {
			if (!!result)
				callback(result);
		};
	}

	
	/**
	* Delete everything from the database
	*
	* @param databaseName the name of the database to clear
	*/
	indexedDB.deleteAll = function(databaseName) {
		var transaction = indexedDB.db.transaction([databaseName], 'readwrite');
		var objectStore = transaction.objectStore(databaseName);

		var request = objectStore.clear();

		request.onerror = function(e) {
				console.log(e);
		}
	};

	/**
	* Delete an entry 
	*
	* @param databaseName the name of the database 
	* @param key of the object to delete
	* @param callback (optional) a function that receives the object fetched as parameter
	*/
	indexedDB.delete = function(databaseName, key, callback) {
		var transaction = indexedDB.db.transaction([databaseName], 'readwrite');
		var objectStore = transaction.objectStore(databaseName);

		var request = objectStore.delete(key);

		request.onerror = function(e) {
			console.log(e);
		}

		transaction.oncomplete = function(e) {
			if (callback != null) 
				callback();
		};
	};

	/**
	* Creates an entry 
	* @param data the entry to add to the database
	* @param databaseName the name of the database to add an element
	* @param callback (optional) a function that receives the object fetched as parameter
	*/
	indexedDB.add = function(databaseName, data, callback) {
		if (data != null) {
			var transaction = indexedDB.db.transaction([databaseName], 'readwrite');
			var objectStore = transaction.objectStore(databaseName);

			var request = objectStore.put(data);

			request.onerror = function(e) {
				console.log(e);
			}
			
			transaction.oncomplete = function(e) {
				if (callback != null) 
					callback();
			};
		}
	};


    t.checkWatched = function(id, callback) {
		indexedDB.fetchByIndex("history", id, callback);
    };


    // Add to history
    t.addHistory = function(data) {
    	var historyToAdd = {
				'data': data,
				'date': Date.now()
		};
		indexedDB.add("history", historyToAdd);
    };

    // Get history
    t.getHistory = function() {
		indexedDB.fetchAll("history", t.renderHistory);
    };

    // Clean history
    t.cleanHistory = function() {
    	if (confirm(i18n.__('HISTORY_DELETE_ALERT'))) {
	    	indexedDB.deleteAll("history");
	    	t.renderHistory(null);
	    }
    };

     // Delete a history
    t.removeHistory = function(key) {
		indexedDB.delete("history", key, t.getHistory );
    };


    //Following DB


    // Add to following
    t.addFollowing = function(data, callback) {
    	if (data.type == "episode"){
    		tvshowId = data.tvshow.id;
    		var url = "http://api.cuevana.tv/tvshows/"+tvshowId;

    		$.getJSON(url,function(result){ //AJAX query to cuevana API to get tvshow info
				var showToAdd = {
					'data': result,
					'name': result.name
				};
				indexedDB.add("following", showToAdd, callback);
			});

    	} else {
    		var showToAdd = {
				'data': data,
				'name': data.name
			};
			indexedDB.add("following", showToAdd, callback);
    	}
    		
    	
    };

    // Get following
    t.getFollowing = function(callback) {
		indexedDB.fetchAll("following", callback );
    };

     // Delete a following
    t.removeFollowing = function(key, callback) {
		indexedDB.delete("following", key, callback );
    };

    // checks if the show exists and updates the button text and click action
    t.updateFollowButton = function(data) {
    	if (data.type == "tvshow")
			var tvshowName = data.name;
		else
			var tvshowName = data.tvshow.name;

		var updateButton = function(dataFollowing) {
								if (dataFollowing == null){
									$("#follow_button").text("FOLLOW");
									$("#follow_button")[0].onclick = function() { 
											t.addFollowing(data, function(){t.updateFollowButton(data)}); 
										};
								} else {
									$("#follow_button").text("UNFOLLOW");
									$("#follow_button")[0].onclick = function() { 
											t.removeFollowing(tvshowName, function(){t.updateFollowButton(data)});
										};
								}
							}
		indexedDB.fetch("following", tvshowName, updateButton);
    };

 


    // Loading bar
    t.loadingBar = function(percent) {
    	t.darkAll.show();
    	var loadbar = $('#loading-bar').show(), bar = loadbar.children('.bar').children('span');

    	// Loadbar 
    	bar.width(percent+'%');
    }

    // Loading bar hide
    t.loadingBarHide = function() {
    	t.darkAll.hide();
    	$('#loading-bar').hide();
    }

	// Ajax Error
    t.ajaxError = function (act) {
    	var er = $('#alert-msg').show(), msg = '';
    	switch (act) {
    		case 'noconnection':
    			msg = 'NO_CONNECTION'
    			break;
    		default:
    			msg = 'ERROR_OCURRED'
    			break;
    	}

    	t.popupAlert(i18n.__('ERROR'), i18n.__(msg));
    }

    // Open popup alert
    t.popupAlert = function(title, msg) {
    	t.darkAll.show();
    	var popup = $('#alert-msg').show();
    	if (title.length > 0) {
    		popup.find('.head').show().html(title)
    	} else {
    		popup.find('.head').hide();
    	}	
    	popup.find('.msg').html(msg)

    	popup.css({
    		marginTop: ((popup.outerHeight() / 2)*-1)+'px'
    	})

    	// Esc close popup / click close
    	popup.find('.close').on('click.alert', function() {
    		t.darkAll.hide();
    		popup.hide();
    		$(document).off('.alert');
    	});
    	$(document).on('keydown.alert', function(e) {
    		if (e.keyCode == 27) {
    			t.darkAll.hide();
    			popup.hide();
    			$(document).off('.alert');
    		}
    	})
    }

    // Loader indicator
    t.loader = function(hide) {
    	var l = $('#loader');
    	if (hide) {
    		l.hide();
    	} else {
    		l.show();
    	}
    }

    // Top bar buttons
    t.topButtonBar = function(type, action) {
    	t.topButtons.hide();
		$('#featured').hide();
    	if (action == 'history') {
    		$('.history-buttons').show();
    	} else if (action == 'featured') {
    		$('#featured').show();
    		$('.featured-buttons').show();
    	} else {
    		if (type=='movies') {
    			switch (action) {
    				case 'ranking':
    					break;
    				default:
    					// Load orderby
		    			$('.movie-buttons').show();
		    			t.loadOrderBy();
    					break;
    			}
    		} else if (type=='tvshows') {
    			switch (action) {
    				case 'ranking':
    				case 'newepisodes':
    					break;
    				default:
    					// Load orderby
		    			$('.movie-buttons').show();
		    			t.loadOrderBy();
    					break;
    			}
    		}
		}
		$('#history-noitems').hide();
		t.resizeElements();
    }

    // Orderby load
    t.loadOrderBy = function() {
    	var lis = t.topButtons.find('.orderby li');
    	lis.removeClass('asc desc');
    	if (t.config.orderBy.active) t.topButtons.find('li.'+t.config.orderBy.type).addClass(t.config.orderBy.order);
    }

    // Set orderby
    t.setOrderBy = function(type, order) {
    	t.config.orderBy.active = true;
    	t.config.orderBy.type = type;
    	t.config.orderBy.order = order;
    	t.saveConfig();
    	t.loadOrderBy();
    }

    // Set genre
    t.setGenre = function(id, notload) {
    	if (id == '') {
			$('#select-genre .text').html('Género');
    		if (!notload) t.loadView(t.lastURL.type, t.lastURL.action);
    	} else {
    		if (!notload) t.loadView(t.lastURL.type, t.lastURL.action, null, 'genre='+id);
    	}
    }

	// Initialize
	t.init();


	// Private
	function removeBlank(a){
		return a.replace(/\s\s*$/gm, '').replace(/\t/gi,'')
	}
}

var c;

$(document).ready(function() {
	c = new Storm();
});

//log unhandled errors
process.on('uncaughtException', function(err) {
	console.error('Caught exception: ' + err);
});
