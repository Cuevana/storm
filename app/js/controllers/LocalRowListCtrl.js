/* global angular */
'use strict';

angular.module('storm.controllers')

.controller('LocalRowListCtrl', ['$scope', '$state', '$stateParams', '$injector', 'Navigation', '$translate', function($scope, $state, $stateParams, $injector, Navigation, $translate) {
	
	$scope.items = [];
	$scope.lastPage = true;

	var oldest = $stateParams.view === 'oldest' ? true : false;

	// Delete alert
	$scope.deleteAlert = $stateParams.view === 'delete' ? true : undefined;

	// Get service dynamically from current state
	var service = $injector.get($state.current.service);

	if (!$scope.deleteAlert) {
		service.getList(oldest).then(function(items) {
			$scope.items = resolveItems(items);
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

	function resolveItems(items) {
		for (var i = 0, total = items.length;i<total;i++) {
			// Cover url
			items[i].cover_url = items[i].type === 'episode' ? items[i].tvshow.covers.medium : items[i].covers.medium;
			// More text row
			switch (items[i].type) {
				case 'episode':
					items[i].more = items[i].tvshow.name;
					break;
				case 'movie':
					items[i].more = items[i].year;
					break;
			}
		}
		return items;
	}

}]);