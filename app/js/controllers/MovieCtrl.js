/* global angular, window, _ */
'use strict';

angular.module('storm.controllers')

.controller('MovieCtrl', ['$scope', '$rootScope', '$state', '$timeout', 'movieData', 'Navigation', 'CoverRow', 'Queue', function($scope, $rootScope, $state, $timeout, movieData, Navigation, CoverRow, Queue) {
	
	// Set resolved data
	if (typeof movieData === 'object') {
		$scope.movie = movieData;
	}

	// Render grid
	$timeout(function() {
		Navigation.setActiveElement('detail-view', true);
	});

	// Trigger resize to set plot height and scroll
	angular.element(window).trigger('resize');

	$scope.rating = parseFloat($scope.movie.rating)>0;
	$scope.ratingPercent = (parseFloat($scope.movie.rating)*100) / 5;

	// Go back to list
	$scope.goBack = function() {
		$state.go('^', {}, {reload: false, inherit: true, notify: true});
	};

	// Watch later
	$scope.inQueue = false;

	// Check if exists in queue
	Queue.get($scope.movie.id, 'movie').then(function(result) {
		$scope.inQueue = true;
	});

	$scope.watchLater = function() {
		if ($scope.inQueue) {
			// Delete from queue
			Queue.delete($scope.movie.id, 'movie').then(function(response) {
				$scope.inQueue = false;
			});
		} else {
			// Add to queue
			Queue.add({
				id: $scope.movie.id,
				name: $scope.movie.name,
				year: $scope.movie.year,
				type: $scope.movie.type,
				covers: $scope.movie.covers
			}).then(function(response) {
				$scope.inQueue = true;
			});
		}
	};

	$scope.rightColumn = function() {
		Navigation.setActiveElement('detail-plot');
	};

	//
	// PLAY QUALITY
	//
	
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
		if ($scope.movie.subtitles === undefined) return 'No';

		var subs = $scope.movie.subtitles.length, languages = [];
		for (var i=0;i<subs;i++) {
			if (_.indexOf(languages, $scope.movie.subtitles[i].lang) === -1) {
				languages.push($scope.movie.subtitles[i].lang);
			}
		}
		return (languages.length>0) ? languages.join(', ') : 'No';
	};
	
}]);