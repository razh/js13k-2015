'use strict';

const PORT = process.env.PORT || 3000;

const SOURCE_DIR = process.env.SOURCE_DIR || './src';
const BUILD_DIR = process.env.BUILD_DIR || 'build';
const DIST_DIR = process.env.DIST_DIR || 'dist';

const assign = require('lodash.assign');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const bundleCollapser = require('bundle-collapser/plugin');
const buffer = require('vinyl-buffer');
const del = require('del');
const runSequence = require('run-sequence');
const source = require('vinyl-source-stream');
const watchify = require('watchify');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const replaceAll = require('./replaceAll');

let production = false;

function onError(error) {
  $.util.log(error.message);
  this.emit('end');
}

gulp.task('browser-sync', function() {
  return browserSync.init({
    browser: [],
    port: PORT,
    server: {
      baseDir: './' + BUILD_DIR
    }
  });
});

gulp.task('js', function() {
  let bundler = browserify(SOURCE_DIR + '/js/index.js',
    assign({
      debug: !production
    }, production ? null : watchify.args));

  if (production) {
    bundler.plugin(bundleCollapser);
  } else {
    bundler = watchify(bundler);
  }

  function rebundle() {
    return bundler.bundle()
      .on('error', onError)
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe($.if(production, $.uglify()))
      .pipe($.if(production, replaceAll()))
      .pipe(gulp.dest(BUILD_DIR + '/js'))
      .pipe($.if(!production, browserSync.reload({ stream: true })));
  }

  bundler
    .on('log', $.util.log)
    .on('update', rebundle);

  return rebundle();
});

gulp.task('html', function() {
  return gulp.src(SOURCE_DIR + '/*.html')
    .pipe($.if(production, $.htmlmin({
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true,
      minifyCSS: true
    })))
    .pipe(gulp.dest(BUILD_DIR))
    .pipe($.if(!production, browserSync.reload({ stream: true })));
});

gulp.task('compress', function() {
  return gulp.src(BUILD_DIR + '/**/*')
    .pipe($.zip('build.zip'))
    .pipe($.size())
    .pipe($.size({ pretty: false }))
    .pipe($.micro({ limit: 13 * 1024 }))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('watch', function() {
  gulp.watch([SOURCE_DIR + '/*.html'], ['html']);
});

gulp.task('clean', del.bind(null, [BUILD_DIR]));

gulp.task('default', ['clean'], function(cb) {
  return runSequence(
    ['html', 'js'],
    ['browser-sync', 'watch'],
    cb
  );
});

gulp.task('build', ['clean'], function(cb) {
  production = true;
  return runSequence(
    ['html', 'js'],
    cb
  );
});

gulp.task('dist', function(cb) {
  return runSequence('build', 'compress', cb);
});
