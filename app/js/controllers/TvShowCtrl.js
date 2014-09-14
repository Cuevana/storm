/* global angular, window */
'use strict';

angular.module('storm.controllers')

.controller('TvShowCtrl', ['$scope', '$state', '$timeout', 'tvshowData', 'Navigation', 'CoverRow', function($scope, $state, $timeout, tvshowData, Navigation, CoverRow) {
	
	// Set resolved data
	if (typeof tvshowData === 'object') {
		$scope.tvshow = tvshowData;
	}

	// Render grid
	$timeout(function() {
		Navigation.setActiveElement('detail-view', true);
	});

	// Trigger resize to set plot height and scroll
	angular.element(window).trigger('resize');

	$scope.rating = parseFloat($scope.tvshow.rating)>0;
	$scope.ratingPercent = (parseFloat($scope.tvshow.rating)*100) / 5;

	// Go back to list
	$scope.goBack = function() {
		$state.go('^', {}, {reload: false, inherit: true, notify: true});
	};

	$scope.rightColumn = function() {
		Navigation.setActiveElement('detail-plot');
	};

	$scope.showSeasons = function() {
		$scope.showSeasonsList = true;
		$scope.hideInfo = true;
	};

	$scope.hideSeasons = function() {
		$scope.showSeasonsList = false;
		$scope.hideInfo = false;
		Navigation.setActiveElement('detail-view');
	};

	$scope.totalEpisodes = function() {
		if ($scope.tvshow.seasons === undefined) return 0;

		var n=0, seasons = $scope.tvshow.seasons.length;
		for (var i=0;i<seasons;i++) {
			n += $scope.tvshow.seasons[i].episodes.length;
		}
		return n;
	};

}]);