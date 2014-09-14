// 
// About winstate:
// Some weird bugs and visual inconsistencies.
// It's not up to the quality of a native app experience, so we comment it out for now.
//

// 'use strict'
// /**
//  * Cross-platform window state preservation.
//  * Yes this code is quite complicated, but this is the best I came up with for
//  * current state of node-webkit Window API (v0.7.3 and later).
//  *
//  * Known issues:
//  * - Unmaximization not always sets the window (x, y) in the lastly used coordinates.
//  * - Unmaximization animation sometimes looks wierd.
//  * - Extra height added to window, at least in linux x64 gnome-shell env. It seems that
//  *   when we read height then it returns it with window frame, but if we resize window
//  *   then it applies dimensions only to internal document without external frame.
//  *   Need to test in other environments with different visual themes.
//  *
//  * Change log:
//  * 2013-12-01
//  * - Workaround of extra height in gnome-shell added.
//  *
//  * 2014-03-22
//  * - Repared workaround (from 2013-12-01) behaviour when use frameless window.
//  *   Now it works correctly.
//  */

// var gui = require('nw.gui');
// var win = gui.Window.get();
// var winState;
// var currWinMode;
// var resizeTimeout;
// var isMaximizationEvent = false;

// // extra height added in linux x64 gnome-shell env, use it as workaround
// var deltaHeight = (function () {
// 	// use deltaHeight only in windows with frame enabled
// 	if (gui.App.manifest.window.frame) return true; else return 'disabled';
// })();

// function initWindowState() {
// 	winState = JSON.parse(localStorage.windowState || 'null');

// 	if (winState) {
// 		currWinMode = winState.mode;
// 		if (currWinMode === 'maximized') {
// 			win.maximize();
// 		} else if (currWinMode === 'fullscreen') {
// 			win.enterFullscreen();
// 		} else {
// 			restoreWindowState();
// 		}
// 	} else {
// 		currWinMode = 'normal';
// 		if (deltaHeight !== 'disabled') deltaHeight = 0;
// 		dumpWindowState();
// 	}

// 	win.show();
// }

// function dumpWindowState() {
// 	if (!winState) {
// 		winState = {};
// 	}

// 	// we don't want to save minimized state, only maximized or normal
// 	if (currWinMode === 'maximized' || currWinMode === 'fullscreen') {
// 		winState.mode = currWinMode;
// 	} else {
// 		winState.mode = 'normal';
// 	}

// 	// when window is maximized you want to preserve normal
// 	// window dimensions to restore them later (even between sessions)
// 	if (currWinMode === 'normal') {
// 		winState.x = win.x;
// 		winState.y = win.y;
// 		winState.width = win.width;
// 		winState.height = win.height;

// 		// save delta only of it is not zero
// 		if (deltaHeight !== 'disabled' && deltaHeight !== 0 && currWinMode !== 'maximized') {
// 			winState.deltaHeight = deltaHeight;
// 		}
// 	}

// 	saveWindowState();
// }

// function restoreWindowState() {
// 	// deltaHeight already saved, so just restore it and adjust window height
// 	if (deltaHeight !== 'disabled' && typeof winState.deltaHeight !== 'undefined') {
// 		deltaHeight = winState.deltaHeight;
// 		winState.height = winState.height - deltaHeight;
// 	}

// 	win.resizeTo(winState.width, winState.height);
// 	win.moveTo(winState.x, winState.y);
// }

// function saveWindowState() {
// 	if (winState.x >= 0 && winState.y >= 0) {
// 		localStorage.windowState = JSON.stringify(winState);
// 	}
// }

// function updateWindowState() {

// 	// on MacOS you can resize maximized window, so it's no longer maximized
// 	if (isMaximizationEvent) {
// 		// first resize after maximization event should be ignored
// 		isMaximizationEvent = false;
// 	} else {
// 		if (currWinMode === 'maximized') {
// 			currWinMode = 'normal';
// 		}
// 	}

// 	// there is no deltaHeight yet, calculate it and adjust window size
// 	if (deltaHeight !== 'disabled' && deltaHeight === false) {
// 		deltaHeight = win.height - winState.height;

// 		// set correct size
// 		if (deltaHeight !== 0) {
// 			win.resizeTo(winState.width, win.height - deltaHeight);
// 		}
// 	}

// 	dumpWindowState();
// }

// initWindowState();

// win.on('maximize', function () {
// 	isMaximizationEvent = true;
// 	currWinMode = 'maximized';
// });

// win.on('unmaximize', function () {
// 	currWinMode = 'normal';
// 	restoreWindowState();
// });

// win.on('minimize', function () {
// 	currWinMode = 'minimized';
// });

// win.on('restore', function () {
// 	currWinMode = 'normal';
// });

// win.on('enter-fullscreen', function () {
// 	currWinMode = 'fullscreen';
// });

// win.on('leave-fullscreen', function () {
// 	currWinMode = 'normal';
// });

// win.on('resize', _.debounce(updateWindowState, 500));
// win.on('move', _.debounce(updateWindowState, 500));
