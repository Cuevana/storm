var gulp	= require('gulp'),
	less	= require('gulp-less'),
	concat	= require('gulp-concat'),
    inject	= require("gulp-inject");

var basePath = './app/assets/';

var paths = {
	less: 		basePath+'less/',
	css:		basePath+'css/',
	scripts:	basePath+'js/',
	appScripts: './app/js/',
	views: 		'./app/views/' 
};

// Inyectar referencias al HTML
gulp.task('inject-index', ['styles'], function() {
	return gulp.src(paths.views+'index.html')
		.pipe(inject(gulp.src([
			paths.css+'*.css', 
			paths.scripts+'*.js', 
			paths.appScripts+'*.js', 
			'!'+paths.scripts+'player.js'
		], {read:false})))
		.pipe(gulp.dest(paths.views));
})

gulp.task('inject-player', ['styles'], function() {
	return gulp.src(paths.views+'player.html')
		.pipe(inject(gulp.src([
			paths.css+'*.css', 
			paths.scripts+'vendor/*.js', 
			paths.scripts+'player.js'
		], {read:false})))
		.pipe(gulp.dest(paths.views));
})

// Compilar Less
gulp.task('styles', function() {
	return gulp.src(paths.less+'default.less')
		.pipe(less())
		.pipe(concat('less.css'))
		.pipe(gulp.dest(paths.css))
});

// Watch
gulp.task('watch', function() {
	gulp.watch(	paths.less+'**/*.less', 	['inject-index', 'inject-player']);
	gulp.watch(	paths.scripts+'**/*.js', 	['inject-index', 'inject-player']);
	gulp.watch(	paths.appScripts+'*.js', 	['inject-index', 'inject-player']);
})

// Default (inicia sequencia)
gulp.task('default', ['inject-index', 'inject-player', 'watch']);
