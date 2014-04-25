var peerflix = require('peerflix'),
    child_process = require('child_process'),
    address = require('network-address'),
    numeral = require('numeral'),
    readTorrent = require('read-torrent'),
    magnet = require('magnet-uri');

// Minimum percentage to open video
var MIN_PERCENTAGE_LOADED = 0.5;

// Minimum bytes loaded to open video
var MIN_SIZE_LOADED = 10 * 1024 * 1024;

// Video array (store open videos)
var videos = [];

// Last video id loaded
var videos_last_id = 0;

// Format bytes to readable format
var bytes = function(num) {
    return numeral(num).format('0.0b');
};

function randomPortNumber(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

var playTorrent = function (torrent, callback, statsCallback) {

    var infoHash = torrent.infoHash;

    // Create a unique file to cache the video (with a microtimestamp) to prevent read conflicts
    var tmpFilename = torrent.infoHash;
    tmpFilename = tmpFilename.replace(/([^a-zA-Z0-9-_])/g, '_') +'-'+ (new Date()*1) +'.mp4';
    var tmpFile = path.join(tmpDir, tmpFilename);

    // Set new video ID
    videos_last_id++;
    var video_id = videos_last_id;

    // Set random port
    var port = randomPortNumber(49152,65534);

    var engine = peerflix(torrent, {
        // Set the custom temp file
        path: tmpFile,
        buffer: (1.5 * 1024 * 1024).toString(),
        port: port,
        connections: 100
    });
    var hotswaps = 0;

    var started = Date.now();
    var wires = engine.swarm.wires;
    var swarm = engine.swarm;

    var loadedTimeout, fire_start = false, timeout = false;

    var active = function(wire) {
        return !wire.peerChoking;
    };

    engine.on('uninterested', function() {
        engine.swarm.pause();
    });

    engine.on('interested', function() {
        engine.swarm.resume();
    });

    engine.server.on('listening', function() {
        var href = 'http://'+address()+':'+engine.server.address().port+'/';
        loadedTimeout ? clearTimeout(loadedTimeout) : null;

        var runtime = Math.floor((Date.now() - started) / 1000);

        var checkLoadingStats = function () {

            var now = swarm.downloaded,
                total = engine.torrent.length,
                targetLoadedSize = MIN_SIZE_LOADED > total ? total : MIN_SIZE_LOADED,
                targetLoadedPercent = MIN_PERCENTAGE_LOADED * total / 100.0,

                targetLoaded = Math.max(targetLoadedPercent, targetLoadedSize),

                percent = now / targetLoaded * 100.0;

            var runtime = Math.floor((Date.now() - started) / 1000);

            if (now > targetLoaded && !fire_start) {
                if (typeof callback === 'function') {
                    callback(false, href);
                }
                fire_start = true;
            }
            if (now < total && !timeout) {
                // If download choked (no peers), send timeout for restart
                if (runtime > 40 && !wires.length) {
                    timeout = true;
                }
                // Send streaming stats callback
                typeof statsCallback == 'function' ? statsCallback( percent, fire_start, bytes(swarm.downloadSpeed()), swarm.wires.filter(active).length, wires.length, timeout, video_id) : null;
                loadedTimeout = setTimeout(checkLoadingStats, 500);
            }
        };
        checkLoadingStats();

    });

    engine.server.once('error', function() {
        if (loadedTimeout) { clearTimeout(loadedTimeout); }
        engine.server.listen(0);
    });

	engine.server.on('connection', function(socket) {
	socket.setTimeout(36000000);
	});
	
    engine.on('ready', function() {
        engine.server.listen(port);
    });

    engine.on('error', function() {
        if (loadedTimeout) { clearTimeout(loadedTimeout); }
        if (typeof callback === 'function') {
            callback(true, null);
        }
    })

    // Close video listener
    $(document).on('closeVideo'+video_id, function() {
        if (loadedTimeout) { clearTimeout(loadedTimeout); }

        // Delete video ID
        for (var i in window.videos) {
            if (window.videos[i].id == video_id) {
                window.videos.splice(i, 1);
            }
        }

        swarm.destroy();

        // Clean dir in tmp cache
        if (fs.existsSync(tmpFile)) {
            fs.readdir(tmpFile, function(err, files) {
                if (!err) {
                    if (files.length > 0) {
                        for (var i in files) {
                            var filePath = tmpDir + files[i];
                            fs.stat(filePath, function(err, stats) {
                                if (!err) {
                                    if (stats.isFile()) {
                                        fs.unlink(filePath);
                                    }
                                }
                            });
                        }
                    }
                }
            })
        }
        
        $(document).off('closeVideo'+video_id);
        
        delete engine;
    });

    // Add new video to array
    videos.push({id: video_id, engine: engine});

};