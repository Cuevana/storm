/* global angular, _ */
'use strict';
angular.module('storm.services')

.factory('History', ['pouchdb', '$q', function(pouchdb, $q) {

	var db = pouchdb.create('history');

	return {
		add: function(item) {
			if (item === null || item === undefined) return false;
			
			// Id and time
			var row = angular.extend(item, {
				_id: item.type + item.id,
				updated_at: Date.now()
			});

			return db.put(row);
		},

		delete: function(id, type) {
			var self = this;
			return $q(function(resolve, reject) {
				self.get(id, type).then(function(doc) {
					resolve(db.remove(doc));
				}).catch(function() {
					reject(false);
				});
			});
		},

		get: function(id, type) {
			return db.get(type + id);
		},

		all: function() {
			return db.allDocs({include_docs: true});
		},

		clear: function() {
			return db.destroy();
		},
		
		getList: function(oldest) {
			var self = this;
			return $q(function(resolve, reject) {
				self.all().then(function(list) {
					var items = [];
					for (var i=0;i<list.total_rows;i++) {
						items.push(list.rows[i].doc);
					}
					// Order by
					items = _.sortBy(items, function(item) {
						return item.updated_at * (oldest ? 1 : -1);
					});
					resolve(items);
				}).catch(function() {
					reject();
				});
			});
		}
	};

}]);