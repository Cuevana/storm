/* global angular */
angular.module('storm.directives')

.directive('stMainMenu', ['Restangular', function(Restangular) {
	return {
		restrict: 'A',
		templateUrl: '/app/views/directives/st-main-menu.html',
		scope: {},

		link: function(scope, element, attr) {

			scope.submenu = null;

			// Submenu update
			scope.updateSubmenu = function(submenu) {
				scope.submenu = submenu;
				scope.$broadcast('submenuChange', submenu);
			};

			// Go to update url
			scope.goToUpdateUrl = function() {
				gui.Shell.openExternal(scope.updateUrl);
			};

			// Check for updates
			Restangular.all('update').customGET().then(function(result) {
				if (result.version !== window.appVersion) {
					scope.updateAvailable = true;
					scope.updateUrl = result.download_url;
				}
			});
		}
	};
}]);