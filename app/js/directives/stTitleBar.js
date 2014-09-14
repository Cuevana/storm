angular.module('storm.directives')

// Window title bar
.directive('stTitleBar', function() {
	return {
		restrict: 'AE',
		templateUrl: '/app/views/directives/st-title-bar.html',

		link: function(scope) {
			scope.closeWindow = function() {
				win.close();
			};
			scope.minimizeWindow = function() {
				win.minimize();
			};
			scope.fullscreenWindow = function() {
				win.toggleFullscreen();
			};
		}
	};
});