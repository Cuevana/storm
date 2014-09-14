/* global angular, window */
'use strict';

angular.module('storm')

// Angular-translate config
.config(['$translateProvider', function($translateProvider) {

	// Set language locale prefix
	$translateProvider.useStaticFilesLoader({
		prefix: '/app/locales/',
		suffix: '.json'
	});

	// Available languages
	var defaultLanguage = 'es';
	var allLanguages = ['es','en'];

	// Set preferred language
	window.selectedLanguage = getDefaultLanguage();
	$translateProvider.preferredLanguage(window.selectedLanguage);

	function getDefaultLanguage() {
		var userLanguage = window.navigator.language;
		var lang = userLanguage.length > 2 ? userLanguage.substring(0,2) : userLanguage;
		lang.toLowerCase();
		if (allLanguages.indexOf(lang) > -1) {
			return lang;
		}
		return defaultLanguage;
	}

}]);