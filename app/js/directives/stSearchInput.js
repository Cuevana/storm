/* global angular */
angular.module('storm.directives')

.directive('stSearchInput', ['$rootScope', 'Util', 'Search', function($rootScope, Util, Search) {
	return {
		require: 'ngModel',
		restrict: 'A',

		link: function(scope, element, attr, ngModelCtrl) {

			function doSearch(value) {
				if (value !== null && value !== undefined) {
					Search.search(value);
				}
			}

			scope.$watch(function() {
				return ngModelCtrl.$modelValue;
			}, Util.debounce(doSearch, 250));

			// Watch for external query update
			$rootScope.$on('updateQueryString', function(e, value) {
				ngModelCtrl.$setViewValue(value);
				ngModelCtrl.$render();
			});
		}
	};
}]);