var gulp = require('gulp'),
	notify = require('gulp-notify'),
	less = require('gulp-less'),
	minifycss = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    inject = require("gulp-inject"),
    rev = require("gulp-rev");

var target_css = './css';
var target_js = './js';

var paths = {
	less: './assets/less/default.less',
	css: './assets/css/*.css',
	scripts: './assets/js/*.js',
	vendorscripts: './assets/js/vendor/*.js'
};

// 1. Injectar referencias al HTML
gulp.task('inject-index', ['styles', 'scripts', 'clean-tmp'], function() {
	return gulp.src('./index.html')
		.pipe(inject(gulp.src([target_css+'/*.css', target_js+'/*.js', '!./js/player.js'], {read:false})))
		.pipe(gulp.dest('./'));
})

gulp.task('inject-player', ['styles', 'scripts', 'clean-tmp'], function() {
	return gulp.src('./player.html')
		.pipe(inject(gulp.src([target_css+'/*.css', './js/lib-*.js', './js/player.js'], {read:false})))
		.pipe(gulp.dest('./'));
})

// Estilos (autoprefixer, minify)
gulp.task('styles', ['clean-old-styles','build-css', 'build-less'], function() {
	return gulp.src('./assets/tmp/*.css')
		.pipe(concat('main.css'))
		.pipe(minifycss())
   		.pipe(rev())
		.pipe(gulp.dest(target_css))
});

// Limpia viejos CSS
gulp.task('clean-old-styles', function() {
	return gulp.src(target_css+'/main-*.css', {read:false})
		.pipe(clean({force: true}));
});

// Concatena CSS
gulp.task('build-css', function() {
	return gulp.src(paths.css)
		.pipe(concat('all.css'))
		.pipe(gulp.dest('./assets/tmp'));
});

// Compila LESS -> CSS
gulp.task('build-less', function() {
	return gulp.src(paths.less)
		.pipe(less())
		.pipe(concat('less.css'))
		.pipe(gulp.dest('./assets/tmp'));
});

// Limpiar archivos temporales creados
gulp.task('clean-tmp', function() {
	return gulp.src('./assets/tmp/*', {read:false})
		.pipe(clean({force: true}));
});

// Scripts JS
gulp.task('scripts', ['clean-old-scripts','vendor-scripts'], function() {
	return gulp.src(paths.scripts)
   		// .pipe(concat('main.js'))
   		// .pipe(uglify())
   		// .pipe(rev())
		.pipe(gulp.dest(target_js));
});

// Limpiar viejos JS
gulp.task('clean-old-scripts', function() {
	return gulp.src([target_js+'/main-*.js',target_js+'/lib-*.js'], {read:false})
		.pipe(clean({force: true}));
});

gulp.task('vendor-scripts', function() {
  gulp.src(paths.vendorscripts)
  	.pipe(concat('lib.js'))
   	.pipe(uglify())
   	.pipe(rev())
    .pipe(gulp.dest(target_js));
});

// Watch
gulp.task('watch', function() {
	gulp.watch('./assets/less/**/*.less', ['inject-index', 'inject-player']);
	gulp.watch('./assets/js/**/*.js', ['inject-index', 'inject-player']);
})

// Default (inicia sequencia)
gulp.task('default', ['inject-index', 'inject-player', 'watch']);