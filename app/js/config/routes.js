/* global angular */
angular.module('storm')

// Routes
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {

	// Handle 404
	$urlRouterProvider.otherwise(function ($injector, $location) {
		var $state = $injector.get('$state');

		// Initial view
		$state.go('movies');
	});

	$stateProvider

	// Index

	// Remote
	.state('remote', {
		url: '/remote',
		waitUntilLoad: true,
		views: {
			'main@': {
				controller: 'RemoteCtrl',
				templateUrl: '/app/views/remote-view.html'
			}
		}
	})

	// URL
	.state('url', {
		url: '/url',
		waitUntilLoad: true,
		views: {
			'main@': {
				controller: 'UrlCtrl',
				templateUrl: '/app/views/url.html'
			}
		}
	})

	// Settings
	.state('settings', {
		url: '/settings',
		waitUntilLoad: true,
		views: {
			'main@': {
				controller: 'SettingsCtrl',
				templateUrl: '/app/views/settings.html'
			}
		}
	})

	// Search
	.state('search', {
		url: '/search?q',
		waitUntilLoad: true,
		views: {
			'main@': {
				controller: 'SearchCtrl',
				templateUrl: '/app/views/list-row.html'
			}
		}
	})

	// Search: Movie
	.state('search.movie', {
		url: '/movie/{id:[0-9]{1,10}}',
		service: 'Movie',
		views: {
			'detail@': {
				templateUrl: '/app/views/movie.html',
				controller: 'MovieCtrl'
			}
		},
		resolve: {
			movieData: ['$stateParams', 'Movie', function($stateParams, Movie) {
				return Movie.get($stateParams.id);
			}]
		}
	})

	// Search: Tv show
	.state('search.tvshow', {
		url: '/tvshow/{id:[0-9]{1,10}}',
		service: 'TvShow',
		views: {
			'detail@': {
				templateUrl: '/app/views/tvshow.html',
				controller: 'TvShowCtrl'
			}
		},
		resolve: {
			tvshowData: ['$stateParams', 'TvShow', function($stateParams, TvShow) {
				return TvShow.get($stateParams.id);
			}]
		}
	})

	// Search: Episode
	.state('search.episode', {
		url: '/episode/{id:[0-9]{1,10}}',
		service: 'TvShow',
		views: {
			'detail@': {
				templateUrl: '/app/views/episode.html',
				controller: 'EpisodeCtrl'
			}
		},
		resolve: {
			episodeData: ['$stateParams', 'TvShow', function($stateParams, TvShow) {
				return TvShow.getEpisode($stateParams.id);
			}]
		}
	})

	// Movies
	.state('movies', {
		url: '/movies/{view:(?:releases|popular|ranking|all)}',
		waitUntilLoad: true,
		service: 'Movie',
		params: {
			view: 'releases'
		},
		views: {
			'main@': {
				templateUrl: '/app/views/list-row.html',
				controller: 'RowListCtrl'
			}
		},
		resolve: {
			list: ['$stateParams', 'Movie', function($stateParams, Movie) {
				return Movie.getView($stateParams.view || 'releases');
			}]
		}
	})

	// Movies: ID
	.state('movies.movie', {
		url: '/{id:[0-9]{1,10}}',
		views: {
			'detail@': {
				templateUrl: '/app/views/movie.html',
				controller: 'MovieCtrl'
			}
		},
		resolve: {
			movieData: ['$stateParams', 'Movie', function($stateParams, Movie) {
				return Movie.get($stateParams.id);
			}]
		}
	})

	// Tv Shows
	.state('tvshows', {
		url: '/tvshows/{view:(?:newepisodes|popular|ranking|all)}',
		waitUntilLoad: true,
		service: 'TvShow',
		params: {
			view: 'newepisodes'
		},
		views: {
			'main@': {
				templateUrl: '/app/views/list-row.html',
				controller: 'RowListCtrl'
			}
		},
		resolve: {
			list: ['$stateParams', 'TvShow', function($stateParams, TvShow) {
				return TvShow.getView($stateParams.view || 'newepisodes');
			}]
		}
	})

	// Tv Shows: ID
	.state('tvshows.tvshow', {
		url: '/{id:[0-9]{1,10}}',
		views: {
			'detail@': {
				templateUrl: '/app/views/tvshow.html',
				controller: 'TvShowCtrl'
			}
		},
		resolve: {
			tvshowData: ['$stateParams', 'TvShow', function($stateParams, TvShow) {
				return TvShow.get($stateParams.id);
			}]
		}
	})

	// Tv Shows: Episode
	.state('tvshows.episode', {
		url: '/episode/{id:[0-9]{1,10}}',
		views: {
			'detail@': {
				templateUrl: '/app/views/episode.html',
				controller: 'EpisodeCtrl'
			}
		},
		resolve: {
			episodeData: ['$stateParams', 'TvShow', function($stateParams, TvShow) {
				return TvShow.getEpisode($stateParams.id);
			}]
		}
	})

	// Queue
	.state('queue', {
		url: '/queue/{view:(?:last|oldest|delete)}',
		waitUntilLoad: true,
		service: 'Queue',
		params: {
			view: 'last'
		},
		views: {
			'main@': {
				controller: 'LocalRowListCtrl',
				templateUrl: '/app/views/queue-list-row.html'
			}
		}
	})

	// Queue: Movie
	.state('queue.movie', {
		url: '/movie/{id:[0-9]{1,10}}',
		service: 'Movie',
		views: {
			'detail@': {
				templateUrl: '/app/views/movie.html',
				controller: 'MovieCtrl'
			}
		},
		resolve: {
			movieData: ['$stateParams', 'Movie', function($stateParams, Movie) {
				return Movie.get($stateParams.id);
			}]
		}
	})

	// Queue: Tv show
	.state('queue.tvshow', {
		url: '/tvshow/{id:[0-9]{1,10}}',
		service: 'TvShow',
		views: {
			'detail@': {
				templateUrl: '/app/views/tvshow.html',
				controller: 'TvShowCtrl'
			}
		},
		resolve: {
			tvshowData: ['$stateParams', 'TvShow', function($stateParams, TvShow) {
				return TvShow.get($stateParams.id);
			}]
		}
	})

	// Queue: Episode
	.state('queue.episode', {
		url: '/episode/{id:[0-9]{1,10}}',
		service: 'TvShow',
		views: {
			'detail@': {
				templateUrl: '/app/views/episode.html',
				controller: 'EpisodeCtrl'
			}
		},
		resolve: {
			episodeData: ['$stateParams', 'TvShow', function($stateParams, TvShow) {
				return TvShow.getEpisode($stateParams.id);
			}]
		}
	})

	// History
	.state('history', {
		url: '/history/{view:(?:last|oldest|delete)}',
		waitUntilLoad: true,
		service: 'History',
		params: {
			view: 'last'
		},
		views: {
			'main@': {
				controller: 'LocalRowListCtrl',
				templateUrl: '/app/views/history-list-row.html'
			}
		}
	})

	// History: Movie
	.state('history.movie', {
		url: '/movie/{id:[0-9]{1,10}}',
		service: 'Movie',
		views: {
			'detail@': {
				templateUrl: '/app/views/movie.html',
				controller: 'MovieCtrl'
			}
		},
		resolve: {
			movieData: ['$stateParams', 'Movie', function($stateParams, Movie) {
				return Movie.get($stateParams.id);
			}]
		}
	})

	// History: Tv show
	.state('history.tvshow', {
		url: '/tvshow/{id:[0-9]{1,10}}',
		service: 'TvShow',
		views: {
			'detail@': {
				templateUrl: '/app/views/tvshow.html',
				controller: 'TvShowCtrl'
			}
		},
		resolve: {
			tvshowData: ['$stateParams', 'TvShow', function($stateParams, TvShow) {
				return TvShow.get($stateParams.id);
			}]
		}
	})

	// History: Episode
	.state('history.episode', {
		url: '/episode/{id:[0-9]{1,10}}',
		service: 'TvShow',
		views: {
			'detail@': {
				templateUrl: '/app/views/episode.html',
				controller: 'EpisodeCtrl'
			}
		},
		resolve: {
			episodeData: ['$stateParams', 'TvShow', function($stateParams, TvShow) {
				return TvShow.getEpisode($stateParams.id);
			}]
		}
	})

	// Error
	.state('notfound', {
		templateUrl: '/template/error/404.html',
		controller: 'ErrorCtrl'
	});

	// Comment to avoid fullscreen interruption when URL change
	// Use hash instead of HTML5 History for now
	// if (window.history && window.history.pushState) {
	// 	$locationProvider.html5Mode(true);
	// }

}])

// Add app: protocol for node-webkit
.config(['$compileProvider', function($compileProvider) {   
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|app):/);
}])

// On state change
.run(['$rootScope', '$state', function ($rootScope, $state) {
	$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
		// Save previous state
		$state.previousState = {
			name: fromState.name,
			params: fromParams
		};
	});
}]);