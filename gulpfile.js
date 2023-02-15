var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var del = require('del');
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var minify = require('gulp-minify');

// Clean output directory
gulp.task('clean', function () {
  return del(['dist']);
});

// Gulp task to minify CSS files
gulp.task('styles', function () {
  return (
    gulp
      .src('./src/style.css')
      // Auto-prefix css styles for cross browser compatibility
      .pipe(autoprefixer())
      // Minify the file
      .pipe(csso())
      // Output
      .pipe(gulp.dest('./dist'))
  );
});

// Gulp task to minify HTML files
gulp.task('pages', function () {
  return gulp
    .src(['./src/*.html'])
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: false,
      })
    )
    .pipe(gulp.dest('./dist'));
});

// Gulp task to minify Javascript files
gulp.task('script', function () {
  return gulp
    .src(['./src/*.js'], { allowEmpty: true })
    .pipe(
      minify({
        ext: {
          min: '.js',
        },
        noSource: true,
      })
    )
    .pipe(gulp.dest('./dist'));
});
