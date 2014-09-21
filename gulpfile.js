var gulp				= require('gulp'),
	less				= require('gulp-less'),
	concat				= require('gulp-concat'),
    inject				= require('gulp-inject'),
    clean				= require('gulp-clean'),
    bower 				= require('main-bower-files'),
	autoprefixer 		= require('gulp-autoprefixer'),
    es 					= require('event-stream'),
    NodeWebkitBuilder 	= require('node-webkit-builder'),
    exec 				= require('gulp-exec');

var basePath = './app/assets/';

var paths = {
	less: 		basePath+'less/',
	css:		basePath+'css/',
	scripts:	basePath+'js/',
	appScripts: './app/js/',
	views: 		'./app/views/',
	remote: {
		css:		basePath+'/remote/css/',
		scripts:	basePath+'/remotejs/'
	}
};

/* ------------------------------
 * Background tasks for developers
 * ------------------------------ */

// Inject HTML dependencies
gulp.task('inject-html', ['styles'], function() {
	return gulp.src(paths.views+'index.html')
		// Add bower components
		.pipe(inject(gulp.src(bower()), {starttag: '<!-- inject:bower -->'}))
		// App files
		.pipe(inject(gulp.src([
			paths.css+'*.css', 
			paths.scripts+'*.js', 
			paths.appScripts+'**/*.js'
		], {read:false})))
		.pipe(gulp.dest(paths.views));
});

// Compile styles
gulp.task('styles', function() {
	return gulp.src(paths.less+'default.less')
		.pipe(less())
		.pipe(concat('less.css'))
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'ios 6', 'android 4'))
		.pipe(gulp.dest(paths.css));
});

// Inject Remote dependencies
gulp.task('inject-remote', ['remote-styles'], function() {
	return gulp.src(paths.views+'remote.html')
		// App files
		.pipe(inject(gulp.src([
			paths.remote.css+'*.css', 
			paths.remote.scripts+'*.js', 
		], {read:false})))
		.pipe(gulp.dest(paths.views));
});

// Compile remote styles
gulp.task('remote-styles', function() {
	return gulp.src(paths.less+'remote.less')
		.pipe(less())
		.pipe(concat('remote.css'))
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'ios 6', 'android 4'))
		.pipe(gulp.dest(paths.remote.css));
});

// Watch
gulp.task('watch', ['compile'], function() {
	gulp.watch(	paths.less+'**/*.less', 			['compile']);
	gulp.watch(	paths.scripts+'**/*.js', 			['inject-html']);
	gulp.watch(	paths.appScripts+'**/*.js', 		['inject-html']);
});

// Compile
gulp.task('compile', ['inject-html', 'inject-remote']);

// Default
gulp.task('default', ['watch']);


/* --------------------------------------
 * Tasks to install this app
 * -------------------------------------- */

gulp.task('install:ffmpegsumo', function() {
	// Determine platform
	if 		(process.platform === 'darwin') platform = 'osx';
	else if (process.platform === 'win32')	platform = 'win';
	else if (process.arch === 'ia32')		platform = 'linux32';
	else if (process.arch === 'x64')		platform = 'linux64';

	// Destination path
	var destPath = './node_modules/nodewebkit/nodewebkit/';

	// Update path for OSX
	if (platform === 'osx') destPath += 'node-webkit.app/Contents/Frameworks/node-webkit Framework.framework/Libraries';
	
	// Copy lib
	return gulp.src('./deps/ffmpegsumo/'+platform+'/*')
	.pipe(gulp.dest(destPath));
});

gulp.task('install', ['compile', 'install:ffmpegsumo']);

/* --------------------------------------
 * Tasks to package this app
 * -------------------------------------- */

gulp.task('build', ['compile'], function(cb) {

	// Read package.json
	var package = require('./package.json');

	// Find out which modules to include
	var modules = [];
	if (!!package.dependencies) {
		modules = Object.keys(package.dependencies)
				.filter(function(m) { return m !== 'nodewebkit'; })
				.map(function(m) { return './node_modules/'+m+'/**/*'; });
	}

	// Which platforms should we build
	var platforms = [];
	
	if (process.argv.indexOf('--all') > -1) {
		// Build for all platforms
		platforms = [ 'win', 'osx', 'linux32', 'linux64' ];
	} else {
		// Select platforms to build
		if (process.argv.indexOf('--win') > -1) 	platforms.push('win');
		if (process.argv.indexOf('--mac') > -1) 	platforms.push('osx');
		if (process.argv.indexOf('--linux32') > -1) platforms.push('linux32');
		if (process.argv.indexOf('--linux64') > -1) platforms.push('linux64');
	}

	// If no platform where specified, determine current platform
	if (!platforms.length) { 
		if 		(process.platform === 'darwin') platforms.push('osx');
		else if (process.platform === 'win32')	platforms.push('win');
		else if (process.arch === 'ia32')		platforms.push('linux32');
		else if (process.arch === 'x64')		platforms.push('linux64');
	}
	
	// Get bower dependencies and flatten relative path
	var bowerFiles = bower();
	for (var i in bowerFiles) {
		bowerFiles[i] = '.' + bowerFiles[i].substr(bowerFiles[i].indexOf('/bower_components'));
	}

	// Initialize NodeWebkitBuilder
	var nw = new NodeWebkitBuilder({
		files: [ './package.json', './app/**/*' ].concat(bowerFiles).concat(modules),
		version: '0.10.5',
		cacheDir: './build/cache',
		platforms: platforms,
		appName: 'Cuevana Storm',
		appVersion: '0.3.3',
		macIcns: './app/assets/icons/mac.icns',
		winIco: './app/assets/icons/windows.ico'
	});

	nw.on('log', function(msg) {
		// Ignore 'Zipping... messages
		if (msg.indexOf('Zipping') !== 0) console.log(msg);
	});

	// Build!
	nw.build().then(function() {
		// Handle ffmpeg for Windows
		if (platforms.indexOf('win') > -1) {
			gulp.src('./deps/ffmpegsumo/win/*')
				.pipe(gulp.dest(
					'./build/Cuevana Storm/win'
				));
		}

		// Handle ffmpeg for Mac
		if (platforms.indexOf('osx') > -1) {
			gulp.src('./deps/ffmpegsumo/osx/*')
				.pipe(gulp.dest(
					'./build/Cuevana Storm/osx/Cuevana Storm.app/Contents/Frameworks/node-webkit Framework.framework/Libraries'
				));
		}

		// Handle ffmpeg for Linux32
		if (platforms.indexOf('linux32') > -1) {
			// Fix libudev.so.0 error
			if (process.platform.indexOf('linux') > -1) {
				gulp.src('./build/Cuevana Storm/linux64/Cuevana Storm')
					.pipe(exec("sed -i 's/udev\.so\.0/udev.so.1/g' '<%= file.path %>'"));
			}
			gulp.src('./deps/ffmpegsumo/linux32/*')
				.pipe(gulp.dest(
					'./build/Cuevana Storm/linux32'
				));
		}

		// Handle ffmpeg for Linux64
		if (platforms.indexOf('linux64') > -1) {
			// Fix libudev.so.0 error
			if (process.platform.indexOf('linux') > -1) {
				gulp.src('./build/Cuevana Storm/linux64/Cuevana Storm')
					.pipe(exec("sed -i 's/udev\.so\.0/udev.so.1/g' '<%= file.path %>'"));
			}
			gulp.src('./deps/ffmpegsumo/linux64/*')
				.pipe(gulp.dest(
					'./build/Cuevana Storm/linux64'
				));
		}

		// Handle locales for Windows and Linux
		for (var i in platforms) {
			if (platforms[i].match(/^(win|linux)/)) {
				gulp.src('./deps/win/Locales/*', {base: './deps/win/'})
					.pipe(gulp.dest('./build/Cuevana Storm/' + platforms[i]));
			}
		}
	}).catch(function(err) {
		console.error(err);
	});
});
