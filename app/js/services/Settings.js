/* global angular */
'use strict';
angular.module('storm.services')

.factory('Settings', ['$rootScope','localStorageService', function($rootScope, localStorageService) {
	
	// Default
	var defaultConfig = {
		// First time welcome message
		welcome: true,

		// UI Animations
		animations: true,
		blur: true,

		// Player defaults
		player: {
			volume: 1,
			skipSeconds: 10,
			subtitles: 'es'
		}
	};

	// Saved config
	var localConfig = localStorageService.get('settings');

	// Extend defaults with saved locally
	var config = localConfig ? angular.extend(defaultConfig, localConfig) : defaultConfig;

	function save(setDefault) {
		if (setDefault) config = defaultConfig;
		localStorageService.set('settings', config);

		// Emit change
		$rootScope.$emit('settingsChange', config);
	}

	return {
		get: function(name) {
			return config[name];
		},
		getDefault: function(name) {
			return defaultConfig[name];
		},
		getAll: function() {
			return config;
		},
		set: function(name, value) {
			config[name] = value;
			save();
		},
		restore: function(name) {
			config[name] = defaultConfig[name] !== undefined ? defaultConfig[name] : null;
			save();
		},
		restoreAll: function() {
			save(true);
		}
	};

}]);