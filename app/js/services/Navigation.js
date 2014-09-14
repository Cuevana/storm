/* global angular, document, _ */
'use strict';
angular.module('storm.services')

.factory('Navigation', ['$rootScope', '$timeout', function($rootScope, $timeout) {
	
	var rows = [],
		activeIndex = 0,
		prevElements;

	// Map key codes
	var keys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down',
		09: 'tab',
		13: 'enter',
		27: 'escape'
	};

	function onKeyDown(e) {
		if (!rows.length) return;
		var keyCode = e.which ? e.which : e.keyCode;

		// keyUp keys, don't get on keyDown
		if (keys[keyCode] === 'enter' || keys[keyCode] === 'escape') {
			return;
		}

		// Run custom events, if return true, stop default events
		if (runCustomEvents(e, keyCode)) {
			return;
		}

		// Default events
		// Up or shift+tab
		if (keys[keyCode] === 'up') {
			e.preventDefault();
			prev();
		} else if (keys[keyCode] === 'down') {
			e.preventDefault();
			next();
		} else if (keys[keyCode] === 'tab') {
			e.preventDefault();
		}
	}

	function onKeyUp(e) {
		if (!rows.length) return;
		var keyCode = e.which ? e.which : e.keyCode;

		// Get only keyUp keys
		if (keys[keyCode] !== 'enter' && keys[keyCode] !== 'escape') {
			return;
		}

		runCustomEvents(e, keyCode);
	}

	function runCustomEvents(e, keyCode) {
		if (activeIndex === -1 || rows[activeIndex] === undefined) return;
		// If custom element event is set, fire it
		var events = rows[activeIndex].events,
			scope = rows[activeIndex].scope;

		if (events !== undefined) {
			// Prevent default to stop any navigation default action
			if (events(scope)[key(keyCode)] === 'preventDefault') {
				e.preventDefault();
				return true;
			// Run custom event
			} else if (typeof events(scope)[key(keyCode)] === 'function' && !events(scope)[key(keyCode)]()) {
				scope.$apply();
				// If function returns false, exit
				return true;
			// If nav title given, navigate to element
			} else if (typeof events(scope)[key(keyCode)] === 'string') {
				e.preventDefault();
				navigateToElement(events(scope)[key(keyCode)]);
				return true;
			}
		}
	}

	function setActive() {
		// Broadcast element focused
		$rootScope.$broadcast('navigationFocus', activeIndex);
	}

	function setActiveIndex(index) {
		if (index >= 0 && index < rows.length && activeIndex !== index) {
			activeIndex = index;
			setActive();
		}
	}

	function prev() {
		if (activeIndex > 0) {
			activeIndex -= 1;
			setActive();
			return true;
		}
	}

	function next() {
		if (activeIndex < rows.length - 1) {
			activeIndex += 1;
			setActive();
			return true;
		}
	}

	function renderGrid(force) {
		// Select all navigatable elements (discard disabled ones)
		var elements = document.querySelectorAll('[st-navigatable]:not([nav-disabled])');

		// If grid hasn't changed, return (unless force == true)
		if (prevElements === elements && !force) return;
		
		rows = [];
		// Save nav elements with properties
		for (var i=0, rl = elements.length; i<rl; i++) {
			rows.push({
				name: elements[i].getAttribute('nav-title'),
				order: i,
				element: elements[i]
			});
			// Update activeIndex if element has focus
			if (elements[i].getAttribute('nav-focus') === 'true') {
				activeIndex = i;
			}
		}
		prevElements = elements;

		// If activeIndex is greater than total elements, set to -1
		if (activeIndex >= rl) {
			activeIndex = -1;
		}

		// Broadcast event
		$rootScope.$broadcast('navigationRenderGrid');
	}

	function navigateToElement(name, render) {
		// Run after digest cycle
		$timeout(function() {
			if (render) renderGrid();

			// Check if array of items or only one
			var names = [];
			if (typeof name === 'string') {
				names.push(name);
			} else {
				names = name;
			}
			
			// Iterate over items and navigate to first match
			for (var i in names) {
				var row = getNavElementByName(names[i]);

				// If element doesn't exist, return
				if (row === null) return;

				setActiveIndex(row.order);
			}
		});
	}

	function getNavElementByName(name) {
		var index = _.findIndex(rows, function(row) {
			return row.name === name;
		});
		return index > -1 ? rows[index] : null;
	}

	function key(code) {
		return (angular.isNumber(code) ? keys[code] : code) || 'default';
	}

	return {

		init: function() {
			// Set key listeners
			angular.element(document).on('keydown', _.throttle(onKeyDown, 100));
			angular.element(document).on('keyup', onKeyUp);
		},

		renderGrid: renderGrid,

		getElementOrder: function(element, scope, events) {
			var index, order;

			for (var i=0, rl = rows.length;i<rl;i++) {
				if (rows[i].element == element[0]) {
					order = rows[i].order;
					break;
				}
			}

			// Define custom events
			if (order >= 0 && events) {
				rows[order].events = events;
				rows[order].scope = scope;
			}

			return order;
		},

		setActiveElement: navigateToElement,

		setActiveLast: function(render) {
			if (rows.length > 0) {
				if (render) renderGrid();
				navigateToElement(rows[rows.length - 1].name);
			}
		}

	};

}]);