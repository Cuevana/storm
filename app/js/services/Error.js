/* global angular */
'use strict';
angular.module('storm.services')

.factory('Error', function() {

	var listeners = {};

	return {
		emit: function(name, title, message, code) {
			var error = {
				title: title || 'Error',
				message: message || '',
				code: code
			};

			// Emit error
			// $rootScope.$emit(name, error);
			
			for (var i in listeners) {
				// If subscribed for error, call callback
				if (i === name) {
					listeners[i](error);
				}
			}
		}, 

		on: function(name, callback) {
			if (typeof callback !== 'function') return false;
			listeners[name] = callback;
		}
	};

});