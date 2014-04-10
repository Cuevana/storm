var gulp	= require('gulp'),
	less	= require('gulp-less'),
	concat	= require('gulp-concat'),
    inject	= require('gulp-inject')

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

// Inject HTML dependencies
gulp.task('inject-html', ['styles'], function() {
	gulp.src(paths.views+'index.html')
	.pipe(inject(gulp.src([
		paths.css+'*.css', 
		paths.scripts+'*.js', 
		paths.appScripts+'*.js', 
		'!'+paths.appScripts+'player.js'
	], {read:false})))
	.pipe(gulp.dest(paths.views));

	gulp.src(paths.views+'player.html')
	.pipe(inject(gulp.src([
		paths.css+'*.css', 
		paths.scripts+'*.js',
		paths.appScripts+'localization.js',
		paths.appScripts+'player.js'
	], {read:false})))
	.pipe(gulp.dest(paths.views));
})

// Compile styles
gulp.task('styles', function() {
	gulp.src(paths.less+'default.less')
	.pipe(less())
	.pipe(concat('less.css'))
	.pipe(gulp.dest(paths.css))
});

// Watch
gulp.task('watch', function() {
	gulp.watch(	paths.less+'**/*.less', 	['compile']);
	gulp.watch(	paths.scripts+'**/*.js', 	['compile']);
	gulp.watch(	paths.appScripts+'*.js', 	['compile']);
})

// Compile
gulp.task('compile', ['styles', 'inject-html'])

// Default
gulp.task('default', ['compile', 'watch']);


/* --------------------------------------
 * Tasks to build this app
 * -------------------------------------- */

 gulp.task('nodewebkit:ffmpeg', function() {
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
	gulp.src('ffmpegsumo/'+platform+'/*')
	.pipe(gulp.dest('node_modules/nodewebkit/nodewebkit/'))
 })

 gulp.task('build', ['compile', 'nodewebkit:ffmpeg'])
