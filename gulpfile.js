var gulp = require('gulp');
// var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
// var es = require('event-stream');

var outDir = './compiled';
var sourceDir = './source';
var dev = false;

gulp.task('stylus', function() {
	gulp.src(sourceDir+'/**/*.styl')
		.pipe(stylus({
			use: ['nib', 'autoprefixer-stylus'],
			compress: false
		}))
		.pipe(gulp.dest(outDir));
});

gulp.task('jade', function() {
	gulp.src(sourceDir+'/**/*.jade')
	.pipe(jade({pretty: true}))
	.pipe(gulp.dest(outDir));
});

gulp.task('js', function() {
	var stream;
	stream = gulp.src(sourceDir+'/**/*.js');
	if (!dev) {
		stream = stream.pipe(stripDebug());
	}
	stream.pipe(gulp.dest(outDir));

	gulp.src(sourceDir+'/leapmouse.js')
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(outDir));

	gulp.src(sourceDir+'/**/*.js')
		.pipe(jshint(sourceDir+'/.jshintrc'))
		.pipe(jshint.reporter(stylish));
	if (!dev) {
		gulp.src('./gulpfile.js')
			.pipe(jshint('./.jshintrc'))
			.pipe(jshint.reporter(stylish));
	}
});

gulp.task('build', function() {
	gulp.run('js', 'stylus', 'jade');
});

gulp.task('dev', function() {
	dev = true;
	gulp.run('build');
	gulp.watch(sourceDir+'/**/*.js', function() {
		gulp.run('js');
	});
	gulp.watch(sourceDir+'/**/*.styl', function() {
		gulp.run('stylus');
	});
	gulp.watch(sourceDir+'/**/*.jade', function() {
		gulp.run('jade');
	});
});