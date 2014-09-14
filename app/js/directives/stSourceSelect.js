/* global angular */
var torrentHealth = require('torrent-health');
var sourcesHealth = {};

angular.module('storm.directives')

// Select source to play
.directive('stSourceSelect', ['$timeout', '$parse', 'Navigation', 'Player', function($timeout, $parse, Navigation, Player) {
	return {
		restrict: 'A',
		scope: true,

		link: function(scope, element, attr) {

			scope.sourcesList = [];

			// Watch when source list changes
			scope.$watch(attr.sourcesList, function(value) {
				if (!value) return;

				// Load list
				var sources = value;
				if (typeof sources === undefined) return;

				// Sort sources by quality
				if (sources.length > 0) {
					sources.sort(function(a, b) {
						var keyA = parseInt(a.def), keyB = parseInt(b.def);
						if(keyA < keyB) return -1;
						if(keyA > keyB) return 1;
						return 0;
					});
				}
				scope.sourcesList = sources;

				// Check torrent source health
				angular.forEach(scope.sourcesList, function(source) {
					if (sourcesHealth[source.url]) {
						source.health = sourcesHealth[source.url];
						source.health.label = sourceHealthLabel(source.health);
					} else {
						source.healthLoading = true;
						window.torrentHealth(source.url).then(function(health) {
							scope.$apply(function() {
								source.healthLoading = false;
								source.health = health;
								source.health.label = sourceHealthLabel(health);
							});
							// Save health temporarily
							sourcesHealth[source.url] = health;
						}).catch(function(err) {
							scope.$apply(function() {
								source.healthLoading = false;
							});
						});
					}
				});

				if (scope.showSourcesList) {
					// Render grid to update navigation elements
					$timeout(function() {
						Navigation.setActiveElement(!scope.sourcesList.length ? 'hide-sources' : 'source', true);
					});
				}
			});

			scope.prevSource = function() {
				if (getSelectedSourceIndex() > 0) {
					return true;
				}
				return false;
			};

			scope.nextSource = function() {
				if (getSelectedSourceIndex() < scope.sourcesList.length-1) {
					return true;
				}
				return false;
			};

			scope.lastSource = function() {
				return scope.sourcesList.length > 0;
			};

			scope.playSource = function(index) {
				var selectedSource = index !== undefined ? index : parseInt(angular.element(element[0].querySelector('[nav-focus="true"]')).attr('source-index'));
				scope.hideSourceSelect();

				Player.playItem(scope.movie || scope.tvshow || scope.episode, scope.sourcesList[selectedSource]);
				return false;
			};

			function getSelectedSourceIndex() {
				return parseInt(angular.element(element[0].querySelector('[nav-focus="true"]')).attr('source-index'));
			}

			function sourceHealthLabel(health) {
				var ratio = health.seeds > 0 ? (Math.round((health.seeds/health.peers) * 100) / 100) : 0, label;
				if (ratio >= 1 && health.seeds > 50 || health.seeds > 1000) {
					label = 'good';
				} else if (ratio > 0.5 && health.seeds > 10) {
					label = 'medium';
				} else {
					label = 'bad';
				}
				return label;
			}
		}
	};
}]);