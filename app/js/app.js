// Lodash Node.js fix
var _ = global._;

var request = require('request'),
	http = require('http'),
	fs = require('fs'),
	path = require('path'),
    os = require('os'),
    gui = require('nw.gui');

var appName = 'Cuevana Storm';
var appVersion = '0.3b';

// Window
var win = gui.Window.get();
win.title = appName;
var windows = [];

// Mac menu
if (process.platform === 'darwin') {
	var mb = new gui.Menu({type:"menubar"});
	mb.createMacBuiltin(appName);
	gui.Window.get().menu = mb;
}

// Create tmp dir
var tmpDir = path.join(os.tmpDir(), 'Cuevana Storm');
if(!fs.existsSync(tmpDir)) { fs.mkdirSync(tmpDir); }

// Debug
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

// Catch uncaught exceptions
process.on('uncaughtException', function (err) {
	console.log(err);
});

// Close
win.on('close', function() {
	this.hide();
	// If video, destroy before closing
	if (typeof window.destroyVideo === 'function') {
		var self = this;
		window.destroyVideo().finally(function() {
			self.close(true);
		});
	} else {
		this.close(true);
	}
});

// Check for connection
// Offline
Offline.options = {
	checkOnLoad: true,
	checks: {
		xhr: {url: 'http://www.google.com/favicon.ico'}
	}
};

angular.module('storm', [
	'angular-loading-bar',
	'ui.router',
	'restangular',
	'pascalprecht.translate',
	'LocalStorageModule',
	'mediaPlayer',
	'pouchdb',
	'angulartics',
	'angulartics.google.analytics',

	// App
	'storm.filters',
	'storm.services',
	'storm.directives',
	'storm.controllers'
]);

angular.module('storm.controllers', []);
angular.module('storm.directives', []);
angular.module('storm.services', []);
angular.module('storm.filters', []);