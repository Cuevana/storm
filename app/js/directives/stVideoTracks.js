var subParser = require('subtitles-parser'),
	iconv = require('iconv-lite');

angular.module('storm.directives')

// Load and render subtitles in video
.directive('stVideoTracks', ['$q', function($q) {
	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			var sub = [],
				subLength = 0,
				trackInterval,
				selected,
				emptyLine = true,
				// Get DOM element where subtitles will be displayed
				subsDiv = document.querySelector('.player-subtitles .text');

			// Update when tracks change
			scope.$watch('tracks', function(value) {
				var tracksLength = scope.tracks.length;

				// If track selected, load it
				for (var i=0;i<tracksLength;i++) {
					if (scope.tracks[i].selected && selected !== i) {
						selected = i;
						if (!scope.tracks[i].none) {
							loadTrack(i);
						} else {
							noTrack();
						}
						break;
					}
				}
			}, true);

			// Wait for player scope...
			var videoWatch = scope.$watch('video', function() {
				// Watch for track change
				scope.$watch('activeTrack', function(value) {
					// Render tracks on time update
					// Remove listener when no active track
					scope.video[value ? 'on' : 'off']('timeupdate', renderTracks);

					// If active false, run once to empty lines
					if (!value) renderTracks();
				});
				
				// Delete watch
				videoWatch();
			});

			function loadTrack(index) {
				var track = scope.tracks[index];
				track.error = false;
				track.loading = true;

				getTrackFile(track).then(function(srt) {
					// Subtitle as array
					sub = subParser.fromSrt(srt, true);
					subLength = sub.length;

					// Replace new lines once (after load). Avoids replacing while playing.
					replaceNewLines();

					scope.activeTrack = true;
					track.loading = false;
				}).catch(function() {
					track.error = true;
				}).finally(function() {
					track.loading = false;
				});
			}

			function noTrack() {
				sub = [];
				subLength = 0;
				scope.activeTrack = false;
			}

			function replaceNewLines() {
				// Convert new line to <br>
				for (var i = 0;i<subLength;i++) {
					sub[i].text = sub[i].text.replace(/\n/g, '<br/>');
				}
			}

			function getTrackFile(track) {
				var filename = track.url.split('/').pop();
				var subDir = path.join(window.tmpDir, 'subtitles');

				// Create subtitles tmp dir if doesn't exist
				if (!fs.existsSync(subDir)) {
					fs.mkdirSync(subDir);
				}
				
				// Create lang dir if doesn't exist
				subDir = path.join(subDir, track.lang);
				if (!fs.existsSync(subDir)) {
					fs.mkdirSync(subDir);
				}

				return $q(function(resolve, reject) {
					var file = path.join(subDir, filename);

					// If file already cached, load it from cache
					if (fs.existsSync(file)) {
						fs.readFile(file, function(err, body) {
							if (err) reject(err);
							return resolve(iconv.decode(body, 'iso-8859-1'));
						});
					}

					// If file, read file
					if (track.file) {
						if (fs.existsSync(track.url)) {
							fs.readFile(track.url, function(err, body) {
								if (err) reject(err);
								return resolve(iconv.decode(body, 'iso-8859-1'));
							});
						} else {
							reject(false);
						}
					} else {
						// Get srt from URL and save it
						request(track.url, {encoding: null}, function (error, response, body) {
							if (!error && response.statusCode == 200) {
								fs.writeFile(file, body, {encoding: null});
								resolve(iconv.decode(body, 'iso-8859-1'));
							} else {
								reject(error);
							}
						});
					}
				});
			}

			function renderTracks() {
				if (scope.activeTrack) {
					for (var i=0;i<subLength;i++) {
						var ct = scope.video.currentTime * 1000;
						if (ct >= sub[i].startTime && ct <= sub[i].endTime) {
							// Manipulate the DOM element directly instead of the angular way for performance gain
							subsDiv.innerHTML = sub[i].text;
							emptyLine = false;
							return;
						}
					}
				}
				// Clean subtitles if no lines need to be shown
				if (!emptyLine) {
					subsDiv.innerHTML = '';
					emptyLine = true;
				}
			}
		}
	};
}]);