/* global angular */
angular.module('storm.directives')

.directive('stSeasonList', ['$timeout', '$window', '$state', 'Navigation', function($timeout, $window, $state, Navigation) {
	return {
		restrict: 'A',
		scope: true,

		link: function(scope, element, attr) {

			scope.seasonsList = null;
			scope.selectedSeason = null;

			// Update list
			scope.$watch(attr.seasonsList, function(value) {
				if (!value) return;
				// Load list
				scope.seasonsList = value;
			});

			// Watch for seasons list trigger
			scope.$watch('showSeasonsList', function(value) {
				if (!value) return;
				if (typeof scope.seasonsList === undefined) return;

				Navigation.setActiveElement(scope.seasonsList.length>0 ? 'season' : 'hide-seasons', true);
			});

			//
			// SEASONS
			//

			scope.prevSeason = function() {
				var index = getSelectedSeasonIndex();
				if (index > 0) {
					return true;
				}
				return false;
			};

			scope.nextSeason = function() {
				return true;
			};

			scope.selectSeason = function(index) {
				scope.selectedSeason = index !== undefined ? index : getSelectedSeasonIndex();
				updateSelectedSeason();
				return false;
			};

			// Get selected season
			function getSelectedSeasonIndex() {
				var focusedElement = element[0].querySelector('[nav-focus="true"]');
				if (focusedElement === null) return -1;

				var selectedSeason = parseInt(focusedElement.getAttribute('season-number'));
				var n = 0;
				for (var i in scope.seasonsList) {
					if (scope.seasonsList[i].number === selectedSeason) {
						break;
					}
					n++;
				}
				return n;
			}

			function updateSelectedSeason() {
				element.scrollTop(0);
				Navigation.setActiveElement(scope.selectedSeason === null ? 'season' : 'episode', true);
			}

			//
			// EPISODES
			//

			scope.hideEpisodes = function() {
				scope.selectedSeason = null;
				updateSelectedSeason();
				return false;
			};

			scope.prevEpisode = function() {
				return true;
			};

			scope.nextEpisode = function() {
				var index = getSelectedEpisodeIndex();
				if (index < scope.seasonsList[scope.selectedSeason].episodes.length-1) {
					return true;
				}
				return false;
			};

			scope.selectEpisode = function(index) {
				index = index !== undefined ? index : getSelectedEpisodeIndex();
				var episode = scope.seasonsList[scope.selectedSeason].episodes[index];

				// Go to episode
				$state.go('^.episode', {id: episode.id});
				return false;
			};

			// Get selected episode
			function getSelectedEpisodeIndex() {
				var focusedElement = element[0].querySelector('[nav-focus="true"]');
				if (focusedElement === null) return -1;

				var selectedEpisode = parseInt(focusedElement.getAttribute('episode-number'));
				var n = 0;
				for (var i in scope.seasonsList[scope.selectedSeason].episodes) {
					if (scope.seasonsList[scope.selectedSeason].episodes[i].number === selectedEpisode) {
						break;
					}
					n++;
				}
				return n;
			}

		}
	};
}]);