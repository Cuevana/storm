var peerflix = require('peerflix'),
	address = require('network-address'),
	numeral = require('numeral'),
	readTorrent = require('read-torrent'),
	Q = require('q');

// Minimum percentage to open video
var minPercentageLoaded = 0.5;

// Minimum bytes loaded to open video
var minSizeLoaded = 10 * 1024 * 1024;

// Format bytes to readable format
var bytes = function(num) {
	return numeral(num).format('0.0b');
};

function randomPortNumber(min,max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

var playTorrent = function(torrent, callback, statsCallback) {

	// Create a unique file to cache the video (with a microtimestamp) to prevent read conflicts
	var tmpFilename = typeof torrent === 'string' ? torrent.match(/magnet:\?xt=urn:[a-z0-9]+:([a-z0-9]{32})/i)[1] : torrent.infoHash;
	tmpFilename = tmpFilename.replace(/([^a-zA-Z0-9-_])/g, '_') +'-'+ (new Date()*1) +'.mp4';
	var tmpFile = path.join(tmpDir, tmpFilename);

	// Set random port
	var port = randomPortNumber(49152, 65534);

	var engine = peerflix(torrent, {
		// Set the custom temp file
		path: tmpFile,
		buffer: (1.5 * 1024 * 1024).toString(),
		port: port,
		connections: 60,
		uploads: 5
	});

	var started = Date.now();
	var wires = engine.swarm.wires;
	var swarm = engine.swarm;

	var loadedTimeout, fireStart = false, timeout = false;

	var active = function(wire) {
		return !wire.peerChoking;
	};

	// Listen on port
	engine.server.on('listening', function() {
		if (loadedTimeout) clearTimeout(loadedTimeout);
		var href = 'http://'+address()+':'+engine.server.address().port+'/';

		var loadingStats = function () {
			// Downloaded (size and percentage)
			var now = swarm.downloaded,
				total = engine.torrent.length,

				targetLoadedSize = minSizeLoaded > total ? total : minSizeLoaded,
				targetLoadedPercent = minPercentageLoaded * total / 100,
				targetLoaded = Math.max(targetLoadedPercent, targetLoadedSize),
				percentUntilStart = now / targetLoaded * 100,

				runtime = Math.floor((Date.now() - started) / 1000);

			// Check if loaded enough to start
			if (now > targetLoaded && !fireStart) {
				if (typeof callback === 'function') {
					callback(false, href);
				}
				fireStart = true;
			}
			// If downloading, send stats 
			if (now < total && !timeout) {
				// If download choked (no peers), send timeout for restart
				if (runtime > 40 && !wires.length) {
					timeout = true;
				}
				// Send streaming stats callback
				if (typeof statsCallback == 'function') {
					statsCallback({
						percent: percentUntilStart,
						started: fireStart, 
						speed: bytes(swarm.downloadSpeed()), 
						active: swarm.wires.filter(active).length, 
						peers: wires.length, 
						timeout: timeout
					});
				}
				loadedTimeout = setTimeout(loadingStats, 500);
			} else {
				// If complete, send complete stat once
				statsCallback({
					started: fireStart,
					percent: 100,
					complete: true
				});
			}
		};

		loadingStats();
	});

	engine.server.once('error', function() {
		if (loadedTimeout) clearTimeout(loadedTimeout);
		engine.server.listen(0);
	});

	engine.server.on('connection', function(socket) {
		socket.setTimeout(36000000);
	});

	engine.on('error', function() {
		if (loadedTimeout) clearTimeout(loadedTimeout);
		if (typeof callback === 'function') {
			callback(true, null);
		}
	});

	// Destroy engine and remove video
	window.destroyVideo = function() {
		var defer = Q.defer();
		if (loadedTimeout) { clearTimeout(loadedTimeout); }

		engine.remove(function() {
			engine.destroy(function() {
				defer.resolve(true);
			});
		});

		return defer.promise;
	};
};