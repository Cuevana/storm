/* global angular */
'use strict';

angular.module('storm.controllers')

.controller('UrlCtrl', ['$scope', 'Player', function($scope, Player) {

	$scope.torrent = {};
	
	$scope.playTorrent = function() {
		if ($scope.torrent.url !== undefined && $scope.torrent.url.length > 0) {
			Player.loadUrl($scope.torrent.url);
		}
	};

}]);