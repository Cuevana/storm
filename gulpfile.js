var gulp	= require('gulp'),
	less	= require('gulp-less'),
	concat	= require('gulp-concat'),
    inject	= require('gulp-inject'),
    clean	= require('gulp-clean');

var NodeWebkitBuilder = require('node-webkit-builder');

var basePath = './app/assets/';

var paths = {
	less: 		basePath+'less/',
	css:		basePath+'css/',
	scripts:	basePath+'js/',
	appScripts: './app/js/',
	views: 		'./app/views/' 
};

/* ------------------------------
 * Background tasks to developers
 * ------------------------------ */

gulp.task('injecthtml:index', ['styles'], function() {
	return gulp.src(paths.views+'index.html')
	.pipe(inject(gulp.src([
		paths.css+'*.css', 
		paths.scripts+'*.js', 
		paths.appScripts+'*.js', 
		'!'+paths.appScripts+'player.js'
	], {read:false})))
	.pipe(gulp.dest(paths.views));
})

gulp.task('injecthtml:player', ['styles'], function() {
	return gulp.src(paths.views+'player.html')
	.pipe(inject(gulp.src([
		paths.css+'*.css', 
		paths.scripts+'*.js',
		paths.appScripts+'localization.js',
		paths.appScripts+'player.js'
	], {read:false})))
	.pipe(gulp.dest(paths.views));
})

// Inject HTML dependencies
gulp.task('injecthtml', ['injecthtml:index', 'injecthtml:player'])

// Compile styles
gulp.task('styles', function() {
	return gulp.src(paths.less+'default.less')
	.pipe(less())
	.pipe(concat('less.css'))
	.pipe(gulp.dest(paths.css))
});

// Watch
gulp.task('watch', ['compile'], function() {
	gulp.watch(	paths.less+'**/*.less', 	['compile']);
	gulp.watch(	paths.scripts+'**/*.js', 	['compile']);
	gulp.watch(	paths.appScripts+'*.js', 	['compile']);
})

// Compile
gulp.task('compile', ['styles', 'injecthtml'])

// Default
gulp.task('default', ['watch']);


/* --------------------------------------
 * Tasks to install this app
 * -------------------------------------- */

gulp.task('install:ffmpegsumo', function() {
	// Determine platform
	if 		(process.platform === 'darwin') platform = 'osx'
	else if (process.platform === 'win32')	platform = 'win'
	else if (process.arch === 'ia32')		platform = 'linux32'
	else if (process.arch === 'x64')		platform = 'linux64'

	// Destination path
	var destPath = './node_modules/nodewebkit/nodewebkit/';

	// Update path for OSX
	if (platform == 'osx') destPath += 'Contents/Frameworks/node-webkit Framework.framework/Libraries';
	
	// Copy lib
	return gulp.src('./deps/ffmpegsumo/'+platform+'/*')
	.pipe(gulp.dest(destPath))
})

gulp.task('install', ['compile', 'install:ffmpegsumo'])

/* --------------------------------------
 * Tasks to package this app
 * -------------------------------------- */

gulp.task('build', ['compile'], function(cb) {

	// Read package.json
	var package = require('./package.json')

	// Find out which modules to include
	var modules = []
	if (!!package.dependencies) {
		modules = Object.keys(package.dependencies)
				.filter(function(m) { return m != 'nodewebkit' })
				.map(function(m) { return './node_modules/'+m+'/**/*' })
	}

	// Which platforms should we build
	var platforms = []
	if (process.argv.indexOf('--win') > -1) 	platforms.push('win')
	if (process.argv.indexOf('--mac') > -1) 	platforms.push('osx')
	if (process.argv.indexOf('--linux32') > -1) platforms.push('linux32')
	if (process.argv.indexOf('--linux64') > -1) platforms.push('linux64')

	// Build for All platforms
	if (process.argv.indexOf('--all') > -1) platforms = [ 'win', 'osx', 'linux32', 'linux64' ]

	// If no platform where specified, determine current platform
	if (!platforms.length) { 
		if 		(process.platform === 'darwin') platforms.push('osx')
		else if (process.platform === 'win32')	platforms.push('win')
		else if (process.arch === 'ia32')		platforms.push('linux32')
		else if (process.arch === 'x64')		platforms.push('linux64')
	}

	// Initialize NodeWebkitBuilder
	var nw = new NodeWebkitBuilder({
		files: [ './package.json', './app/**/*' ].concat(modules),
		version: '0.9.2',
		cacheDir: './build/cache',
		platforms: platforms,
		macIcns: './app/assets/icons/mac.icns',
		winIco: './app/assets/icons/windows.ico',
		checkVersions: false
	})

	nw.on('log', function(msg) {
		// Ignore 'Zipping... messages
		if (msg.indexOf('Zipping') !== 0) console.log(msg)
	});

	// Build!
	nw.build(function(err) {

		if (!!err) return console.error(err)

		// Handle ffmpeg for Windows
		if (platforms.indexOf('win') > -1) {
			gulp.src('./deps/ffmpegsumo/win/*')
			.pipe(gulp.dest(
				'./build/Cuevana/win'
			))
		}

		// Handle ffmpeg for Mac
		if (platforms.indexOf('osx') > -1) {
			gulp.src('./deps/ffmpegsumo/osx/*')
			.pipe(gulp.dest(
				'./build/Cuevana/osx/node-webkit.app/Contents/Frameworks/node-webkit Framework.framework/Libraries'
			))
		}

		// Handle ffmpeg for Linux32
		if (platforms.indexOf('linux32') > -1) {
			gulp.src('./deps/ffmpegsumo/linux32/*')
			.pipe(gulp.dest(
				'./build/Cuevana/linux32'
			))
		}

		// Handle ffmpeg for Linux64
		if (platforms.indexOf('linux64') > -1) {
			gulp.src('./deps/ffmpegsumo/linux64/*')
			.pipe(gulp.dest(
				'./build/Cuevana/linux64'
			))
		}

		cb(err);
	})
})
