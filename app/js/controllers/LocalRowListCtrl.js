/* global angular */
'use strict';

angular.module('storm.controllers')

.controller('LocalRowListCtrl', ['$scope', '$state', '$stateParams', '$injector', 'Navigation', function($scope, $state, $stateParams, $injector, Navigation) {
	
	$scope.items = [];
	$scope.lastPage = true;

	var oldest = $stateParams.view === 'oldest' ? true : false;

	// Delete alert
	$scope.deleteAlert = $stateParams.view === 'delete' ? true : undefined;

	// Get service dynamically from current state
	var service = $injector.get($state.current.service);

	if (!$scope.deleteAlert) {
		service.getList(oldest).then(function(items) {
			$scope.items = items;
		});
	}

	$scope.$watch('deleteAlert', function(value, oldValue) {
		if (value === undefined) return;
		Navigation.setActiveElement(value ? 'confirm-delete' : 'menu-' + $state.current.service.toLowerCase());
	});

	$scope.delete = function() {
		service.clear().then(function() {
			$scope.items = [];			
		});
		$scope.hideDeleteAlert();
	};

	$scope.hideDeleteAlert = function() {
		$scope.deleteAlert = false;
	};

}]);