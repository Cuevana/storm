/* global angular */
angular.module('storm.directives')

// Settings option
.directive('stSettingsOption', ['Settings', function(Settings) {
	return {
		restrict: 'A',
		scope: true,

		link: function(scope, element, attr) {
			// Watch change for settings value
			scope.$watch(function() {
				return Settings.get(attr.settingName);
			}, function(newValue) {
				if (newValue === scope.value) return;
				scope.value = newValue;
			});

			// Toggle
			scope.toggleSetting = function() {
				scope.value = scope.value ? false : true;
				save();
			};

			// Save setting
			function save() {
				Settings.set(attr.settingName, scope.value);
			}
		}
	};
}]);