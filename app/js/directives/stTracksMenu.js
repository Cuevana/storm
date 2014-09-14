angular.module('storm.directives')

// Menu to toggle/select subtitles in player
.directive('stTracksMenu', ['$q', '$timeout', 'Navigation', function($q, $timeout, Navigation) {
	return {
		restrict: 'AE',
		templateUrl: '/app/views/directives/st-tracks-menu.html',

		link: function(scope, element, attr) {

			var defaultLang = null, 
				selected = null,
				inputOpen = false;

			var input = angular.element(element[0].querySelector('input[type="file"]'));

			// Get default subtitle language
			scope.$watch(attr.defaultLang, function(value) {
				if (value === undefined) return;
				defaultLang = value;
			});

			// Update when tracks change
			scope.$watch('tracks', function(value) {
				var tracksLength = scope.tracks.length;
				var i, loaded = false;

				// Add none option at first position if not added yet
				if (scope.tracks[0] === undefined || !scope.tracks[0].none) {
					scope.tracks.unshift({
						none: true,
						lang: 'NONE'
					});
				}

				// If none selected, load default
				if (selected === null) {
					for (i=0;i<tracksLength;i++) {
						if (isDefault(scope.tracks[i])) {
							selectTrack(i);
							break;
						}
					}
				}
			}, true);

			scope.toggleTracksMenu = function() {
				scope.openTracksMenu = scope.openTracksMenu ? false : true;

				if (scope.openTracksMenu) {
					// Set left position
					var div = element.children(), icon = document.querySelector('[nav-title="subtitles-icon"]');
					div.css('left', 
						(icon.getBoundingClientRect().left + angular.element(icon).width()/2)
						- div.width()/2
					);
				}

				$timeout(function() {
					Navigation.setActiveElement(scope.openTracksMenu ? 'track' : 'subtitles-icon', true);
				});
				return false;
			};

			scope.prevTrack = function() {
				var index = getSelectedTrackIndex();
				if (index > 0 || isNaN(index)) {
					return true;
				}
				return false;
			};

			scope.selectTrack = function(index) {
				var selectedTrack = index !== undefined ? index : parseInt(angular.element(element[0].querySelector('[nav-focus="true"]')).attr('track-index'));
				selectTrack(selectedTrack);
			};

			scope.addTrack = function() {
				input.trigger('click');
				return false;
			};

			function isDefault(item) {
				return defaultLang === null ? (item.none ? true : false) : item.lang.toLowerCase() === defaultLang.toLowerCase();
			}

			function selectTrack(index) {
				if (selected !== null) scope.tracks[selected].selected = false;
				scope.tracks[index].selected = true;
				selected = index;
			}

			function getSelectedTrackIndex() {
				return parseInt(angular.element(document.querySelector('[nav-focus="true"]')).attr('track-index'));
			}

			function addTextTrackFromFile(file, charset) {
				var track = {
					url: file.path,
					lang: file.name,
					file: true
				};
				scope.tracks.push(track);

				// Update navigation for new item added
				Navigation.renderGrid();

				// Set as selected
				selectTrack(scope.tracks.length - 1);
			}

			// Add subtitles from file (input)
			input.on('change', function(e) {
				var files = input[0].files;
				angular.forEach(files, function(file, i) {
					var fileExt = file.name.toLowerCase().substr((~-file.name.lastIndexOf(".") >>> 0) + 2);
					if (fileExt === 'srt') {
						addTextTrackFromFile(file, 'ISO-8859-1');
					}
				});
			});
		}
	};
}]);