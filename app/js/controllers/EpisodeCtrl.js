/* global angular, window, _ */
'use strict';

angular.module('storm.controllers')

.controller('EpisodeCtrl', ['$scope', '$state', '$timeout', 'episodeData', 'Navigation', 'CoverRow', 'Queue', function($scope, $state, $timeout, episodeData, Navigation, CoverRow, Queue) {
	
	// Set resolved data
	if (typeof episodeData === 'object') {
		$scope.episode = episodeData;
	}

	// Render grid
	$timeout(function() {
		Navigation.setActiveElement('detail-view', true);
	});

	// Trigger resize to set plot height and scroll
	angular.element(window).trigger('resize');

	$scope.rating = parseFloat($scope.episode.rating)>0;
	$scope.ratingPercent = (parseFloat($scope.episode.rating)*100) / 5;

	// Go back to list
	$scope.goBack = function() {
		$state.go('^', {}, {reload: false, inherit: true, notify: true});
	};

	// Watch later
	$scope.inQueue = false;

	// Check if exists in queue
	Queue.get($scope.episode.id, 'episode').then(function(result) {
		$scope.inQueue = true;
	});

	$scope.watchLater = function() {
		if ($scope.inQueue) {
			// Delete from queue
			Queue.delete($scope.episode.id, 'episode').then(function(response) {
				$scope.inQueue = false;
			});
		} else {
			// Add to queue
			Queue.add({
				id: $scope.episode.id,
				name: $scope.episode.name,
				tvshow: {
					name: $scope.episode.tvshow.name,
					covers: $scope.episode.tvshow.covers
				},
				type: $scope.episode.type
			}).then(function(response) {
				$scope.inQueue = true;
			});
		}
	};

	$scope.rightColumn = function() {
		Navigation.setActiveElement('goto-tvshow');
	};
	
	// Play now button (select quality)
	$scope.showSourceSelect = function() {
		$scope.showSourcesList = true;
		$scope.hideInfo = true;
	};

	// Hide play quality
	$scope.hideSourceSelect = function() {
		$scope.showSourcesList = false;
		$scope.hideInfo = false;
		Navigation.setActiveElement('detail-view');
	};

	$scope.subtitlesToString = function() {
		if ($scope.episode.subtitles === undefined) return 'No';

		var subs = $scope.episode.subtitles.length, languages = [];
		for (var i=0;i<subs;i++) {
			if (_.indexOf(languages, $scope.episode.subtitles[i].lang) === -1) {
				languages.push($scope.episode.subtitles[i].lang);
			}
		}
		return (languages.length>0) ? languages.join(', ') : 'No';
	};

	$scope.prevEpisode = function() {
		if ($scope.episode.prev_episode !== null) {
			$state.go('^.episode', {id: $scope.episode.prev_episode});
		}
	};

	$scope.nextEpisode = function() {
		if ($scope.episode.next_episode !== null) {
			$state.go('^.episode', {id: $scope.episode.next_episode});
		}
	};

	$scope.goToTvShow = function() {
		$state.go('^.tvshow', {id: $scope.episode.tvshow.id});
	};

}]);