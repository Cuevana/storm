var gulp	= require('gulp'),
	less	= require('gulp-less'),
	concat	= require('gulp-concat'),
    inject	= require('gulp-inject'),
    clean	= require('gulp-clean'),
    zip		= require('gulp-zip');

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

gulp.task('inject:index', ['styles'], function() {
	return gulp.src(paths.views+'index.html')
	.pipe(inject(gulp.src([
		paths.css+'*.css', 
		paths.scripts+'*.js', 
		paths.appScripts+'*.js', 
		'!'+paths.appScripts+'player.js'
	], {read:false})))
	.pipe(gulp.dest(paths.views));
})

gulp.task('inject:player', ['styles'], function() {
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
gulp.task('inject-html', ['inject:index', 'inject:player'])

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
gulp.task('compile', ['styles', 'inject-html'])

// Default
gulp.task('default', ['watch']);


/* --------------------------------------
 * Tasks to install this app
 * -------------------------------------- */

gulp.task('install:ffmpegsumo', function() {
	// Determine platform
	if (process.platform === 'darwin') {
			platform = 'mac'
	} else if (process.platform === 'win32') {
		platform = 'win'
	} else if (process.arch === 'ia32') {
			platform = 'linux32'
	} else if (process.arch === 'x64') {
			platform = 'linux64'
	}

	// Copy lib
	return gulp.src('ffmpegsumo/'+platform+'/*')
	.pipe(gulp.dest('node_modules/nodewebkit/nodewebkit/'))
})

gulp.task('install', ['compile', 'install:ffmpegsumo'])

/* --------------------------------------
 * Tasks to package this app
 * -------------------------------------- */

var pack;

// WIN32

// Creates *.nw
gulp.task('build:win32:pack', ['compile'], function() {
	pack = JSON.parse(require('fs').readFileSync('package.json')) 

	var modules = [];
	if (pack.dependencies) {
		modules = Object.keys(pack.dependencies)
				.filter(function(m) { return m != 'nodewebkit' })
				.map(function(m) { return 'node_modules/'+m+'/**/*' })
	}

	return gulp.src(['package.json', 'app/**/*'].concat(modules), { cwdbase: true })
	.pipe(zip(pack.name+'.nw'))
	.pipe(gulp.dest('build/win32'))
})

// Copy nodewebkit executable files
gulp.task('build:win32:copy-nw', ['install:ffmpegsumo'], function() {
	return gulp.src([
		'node_modules/nodewebkit/nodewebkit/nw.exe',
		'node_modules/nodewebkit/nodewebkit/*.dll',
		'node_modules/nodewebkit/nodewebkit/*.pak'
	])
	.pipe(gulp.dest('build/win32'))
})

// Merge files into a single executable
gulp.task('build:win32', ['build:win32:pack', 'build:win32:copy-nw'], function(cb) {
	gulp.src(['build/win32/nw.exe', 'build/win32/'+pack.name+'.nw'])
	.pipe(concat(pack.name+'.exe'))
	.pipe(gulp.dest('build/win32'))
	.on('end', function() {
		gulp.src(['build/win32/nw.exe', 'build/win32/'+pack.name+'.nw'])
		.pipe(clean())
		.on('end', cb)
	})
})

// MAC

/* Nothing yet */

// LINUX

/* Nothing yet */


// Handle build
gulp.task('build', function() {

	if (process.platform === 'darwin')
		return console.error('Mac is not supported yet.')

	if (process.platform === 'win32')
		return gulp.start('build:win32')

	if (process.arch === 'ia32')
		return console.error('Linux32 is not supported yet.')

	if (process.arch === 'x64')
		return console.error('Linux64 is not supported yet.')
})
