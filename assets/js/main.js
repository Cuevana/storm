var request = require('request'),
	http = require('http'),
	fs = require('fs'),
	path = require('path'),
    os = require('os'),
    moment = require('moment');

var gui = require('nw.gui');

var win = gui.Window.get();
win.title = 'Cuevana Storm';

var endpoint = 'http://api.cuevana.tv';
// var endpoint = 'http://api.cuevana.local';

var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var isMaximized = false;

// App version
var version = '0.1b';

var windows = [];
var videoData = {};
var languages = {
	'ES': 'Español',
	'EN': 'Inglés',
	'PT': 'Portugués'
}
var genres = [
	{ key: '1', name: 'Drama'},
	{ key: '2', name: 'Comedia'},
	{ key: '3', name: 'Suspenso'},
	{ key: '4', name: 'Terror'},
	{ key: '5', name: 'Acción'},
	{ key: '6', name: 'Ciencia Ficción'},
	{ key: '7', name: 'Animación'},
	{ key: '8', name: 'Infantil'},
	{ key: '9', name: 'Romance'},
	{ key: '10', name: 'Documental'},
	{ key: '11', name: 'Musical'},
	{ key: '12', name: 'Humor'},
	{ key: '13', name: 'Fantástico'},
	{ key: '14', name: 'Aventura'},
	{ key: '15', name: 'Comedia Musical'},
	{ key: '16', name: 'Comedia Romántica'},
	{ key: '18', name: 'Crimen'},
	{ key: '19', name: 'Bélica'},
	{ key: '20', name: 'Deporte'},
	{ key: '21', name: 'Western'},
	{ key: '22', name: 'Dogma'},
	{ key: '23', name: 'Cine Negro'},
	{ key: '24', name: 'Comedia Stand-up'},
	{ key: '25', name: 'Intriga'},
	{ key: '26', name: 'Comedia Negra'},
	{ key: '27', name: 'Comedia Dramática'},
	{ key: '28', name: 'Cortometraje'}
];

var scrollbarOptions = {
	verticalDragMinHeight: 30,
	verticalGutter: 0,
	hideFocus: true,
	enableKeyboardNavigation: false,
	mouseWheelSpeed: isWin ? 30 : 3
}

var tmpDir = path.join(os.tmpDir(), 'Cuevana');
if(!fs.existsSync(tmpDir)) { fs.mkdirSync(tmpDir); }


var isDebug = gui.App.argv.indexOf('--debug') > -1;

if (!isDebug) {
    console.log = function () {};
} else {
    function addDeveloperTools(win) {
      // Developer Menu building
      var menubar = new gui.Menu({ type: 'menubar' }),
          developerSubmenu = new gui.Menu(),
          developerItem = new gui.MenuItem({
             label: 'Developer',
             submenu: developerSubmenu
          }),
          debugItem = new gui.MenuItem({
              label: 'Show developer tools',
              click: function () {
                  win.showDevTools();
              }
          });
      menubar.append(developerItem);
      developerSubmenu.append(debugItem);
      win.menu = menubar;

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

var Cuevana = function() {
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

			toolbar.find('.min').click(function() {
				win.minimize();
			})
			toolbar.find('.max').click(function() {
				isMaximized ? win.unmaximize() : win.maximize();
			})
			toolbar.find('.close').click(function() {
				win.close();
			})
			$('body').addClass('isWindows');
		} else if (isMac) {
			$('body').addClass('isMac');
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
			    		t.renderHistory();
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
				if (confirm('Hay solicitudes pendientes con el servidor. ¿Aún así deseas salir?')) {
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
		mg.append('<li data-id="">Todos los géneros</li>');
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
		$('#grid-container').height(he-$('#grid-container').offset().top).trigger('scroll');
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
    	}, time = (id != null) ? 86400000 : 3600000;

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
		t.topButtons.find('.orderby li:not(.default)').off('click').on('click', function(event) {
			var $this = $(this);
			t.setOrderBy($this.attr('data-type'),$this.hasClass('asc') ? 'desc' : 'asc');
			t.loadView(t.lastURL.type, t.lastURL.action, null, t.lastURL.vars);
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

			grid.append(item)
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

	// Render History grid
	t.renderHistory = function() {

		// Hide initial loading screen
		$('#init-load').hide();

		// Close detail view if open
		t.closeItemView();

		var data = t.getHistory().sort(function(a,b){
		  // Turn your strings into dates, and then subtract them
		  // to get a value that is either negative, positive, or zero.
		  return new Date(b.date) - new Date(a.date);
		});

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

		var today = moment([moment().get('year'),moment().get('month'),moment().get('date')]);
		var yesterday = moment([moment().get('year'),moment().get('month'),moment().get('date')]).subtract('days', 1);

		for (var i in data) {

			// Today
			if (moment(data[i].date).isAfter(today)) {
				var titleli = grid.find('.title.today');
				if (!titleli.length) {
					titleli = $('<li class="title today">Hoy</li>').appendTo(grid);
				}
			} else if (moment(data[i].date).isAfter(yesterday)) {
				var titleli = grid.find('.title.yesterday');
				if (!titleli.length) {
					titleli = $('<li class="title yesterday">Ayer</li>').appendTo(grid);
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

			grid.append(item)
		}


		gridcontainer.jScrollPane(scrollbarOptions);
	}

	// Render item
	t.renderItemView = function(data) {
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
			t.dview.find('.action_buttons').hide()
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
    	$('#loading-bar').find('.head').html('Cargando video');
    	$('#loading-bar').find('.msg').html('Por favor espera, cargando torrent para iniciar la reproducción');
    	$('#loading-bar').find('.slow').hide();
    	t.loadBarInfo.html('Cargando torrent...');
    	t.loadingBar(0);

    	// Load cancel
    	$('#loading-bar .cancel').show().off('click').on('click', function() {
    		// Cancel loading video
    		t.cancelLoadingVideo();
    	});

    	var title = data.type=='movie' ? data.name+' ('+data.year+')' : data.tvshow.name+': '+data.name;

    	if (/^magnet:/.test(source.url)) return t.loadTorrent(magnet(source.url), data, source, title);

    	readTorrent(source.url, function(err, torrent) {
			if (err) {
				t.cancelLoadingVideo();
    			t.popupAlert('Archivo no válido','Lo sentimos, el archivo torrent no pudo ser cargado.');
    			return;
			}

			t.loadTorrent(torrent, data, source, title);
		});
    	
    }

    t.loadTorrent = function(torrent, data, source, title) {
    	playTorrent(torrent, function(err, href) {
    		if (err) {
    			t.cancelLoadingVideo();
    			t.popupAlert('Archivo no válido','Lo sentimos, el archivo torrent no pudo ser cargado.');
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
	            t.loadBarInfo.html( seeds>0 ? speed+'/s - '+active+' de '+seeds+' clientes' : 'Buscando clientes...');

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
    	var new_window = gui.Window.open('app://cuevana/player.html', {
    		title: title,
    		frame: (!isDebug && isWin) ? false : true,
    		toolbar: false,
		    icon: "icons/512x512.png",
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

    // Add to history
    t.addHistory = function(data) {
    	var history = t.getHistory();
		history.push({date:moment(), data:data});
		localStorage.setItem('history', JSON.stringify(history));
    }

    // Get history
    t.getHistory = function() {
    	if (localStorage.getItem('history') != null) {
			return JSON.parse(localStorage.getItem('history'));
		}
		return [];
    }

    // Clean history
    t.cleanHistory = function() {
    	if (confirm('Se borrará todo tu historial de reproducción. ¿Seguro que deseas continuar?')) {
	    	if (localStorage.getItem('history') != null) {
	    		localStorage.removeItem('history');
	    	}
	    	t.renderHistory();
	    }
    }

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
    			msg = 'No se pudo conectar al servidor. Asegúrate de tener una conexión a internet.'
    			break;
    		default:
    			msg = 'Algo salió mal, aunque no pudimos identificar el error. Si tienes problemas, contáctanos.'
    			break;
    	}

    	t.popupAlert('Error', msg);
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
	c = new Cuevana();
});
