var i18n = require("i18n");

// User language
var userLanguage = window.navigator.language;

// Available languages
var allLanguages = ['es','en'];
var defaultLanguage = 'en';

i18n.configure({
    locales: allLanguages,
    directory: './app/locales',
    defaultLocale: defaultLanguage
});

// Init user language or default
i18n.locale = getDefaultLanguage();

// Set template language variables
$(document).ready(function() {
	// Translate elements
	$('[translate]').each(function() {
		$this = $(this);
		$this.html(i18n.__($this.html()));
	});
	// Translate placeholders
	$('input[translate-placeholder]').each(function() {
		$this = $(this);
		$this.attr('placeholder',i18n.__($this.attr('translate-placeholder')));
	});
});

function getDefaultLanguage() {
	var lang = userLanguage.length > 2 ? userLanguage.substring(0,2) : userLanguage;
	lang.toLowerCase();
	if (allLanguages.indexOf(lang) > -1) {
		return lang;
	}
	return defaultLanguage;
}
