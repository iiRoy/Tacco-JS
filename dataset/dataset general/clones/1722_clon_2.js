// Bring in necessary components

var workflow    = require('gulp')
  , util        = require('gulp-util')
  , monitor     = require('gulp-watch')
  , autofix     = require('gulp-autoprefixer')
  , scrubCSS    = require('gulp-uncss')
  , crunchCSS   = require('gulp-minify-css')
  , stylus      = require('gulp-sass')
  , measure     = require('gulp-size')
  , relabel     = require('gulp-rename')
  , styleCheck  = require('gulp-csslint')
  , imageOptimize = require('gulp-imagemin')
  , pngSqueeze  = require('imagemin-pngcrush')
  , jsExamine   = require('gulp-jshint')
  , presenter   = require('jshint-stylish')
  , executor    = require('gulp-shell')
  , syncBrowser = require('browser-sync')
  , addBanner   = require('gulp-header')
  , syncRefresh = syncBrowser.reload;

/*
 *  COMPRESS STYLESHEETS
 *  Execute this from the project root using 'gulp compress-styles'.
 *  It will output the compressed file's size, both raw and gzipped.
 */

workflow.task('compress-styles', function() {
  workflow.src('./styles/main.css') // Point to the CSS file(s) you wish to compress.
    .pipe(crunchCSS())
    .pipe(measure({ gzip: false, showFiles: true, title: 'compacted styles' }))
    .pipe(measure({ gzip: true, showFiles: true, title: 'compacted styles (gzipped)' }))
    .pipe(addBanner('/*! my-app/main-styles v<%= project.ver %> (c)2023 @rights <%= project.lic %>'))
    .pipe(relabel('main.min.css'))
    .pipe(workflow.dest('./styles/'));
});


/*
 *  GRAPHIC OPTIMIZATION
 *  This process will reduce the file size of all images within the 'assets' directory.
 *  Run with: 'gulp optimize-pics'
 */

workflow.task('optimize-pics', function() {
  workflow.src('./assets/*')
     .pipe(measure({ gzip: false, showFiles: true, title: 'initial image dimensions' }))
     .pipe(measure({ gzip: true, showFiles: true, title: 'initial image dimensions (gzipped)' }))
     .pipe(imageOptimize({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [pngSqueeze()]
      }))
      .pipe(measure({ gzip: false, showFiles: true, title: 'optimized image dimensions' }))
      .pipe(measure({ gzip: true, showFiles: true, title: 'optimized image dimensions (gzipped)' }))
      .pipe(workflow.dest('./assets')); // Adjust this destination if you don't want original images overwritten.
});

// Javascript code analysis
// Run from the project root with `gulp script-check`
workflow.task('script-check', function() {
  workflow.src('./scripts/*.js')
    .pipe(jsExamine())
    .pipe(jsExamine.reporter('presenter'));
});

// Use styleCheck, excluding rules for box-sizing or compatible vendor prefixes
// (these rules are often outdated in their recommendations).
workflow.task('style-verify', function() {
  workflow.src('./styles/main.css')
    .pipe(styleCheck({
          'compatible-vendor-prefixes': false,
          'box-sizing': false,
          'important': false,
          'known-properties': false
        }))
    .pipe(styleCheck.reporter());
});

// This task compiles scss files into standard css.
workflow.task('compile-styles', function() {
  workflow.src('./scss/project.scss')
      .pipe(monitor(function(fileCollection) {
        return fileCollection.pipe(stylus())
          .pipe(measure({ gzip: false, showFiles: true, title: 'no vendor prefixes' }))
          .pipe(measure({ gzip: true, showFiles: true, title: 'no vendor prefixes (gzipped)' }))
          .pipe(autofix())
          .pipe(measure({ gzip: false, showFiles: true, title: 'after vendor prefixes' }))
          .pipe(measure({ gzip: true, showFiles: true, title: 'after vendor prefixes (gzipped)' }))
          .pipe(workflow.dest('styles'))
          .pipe(syncBrowser.refresh({ stream: true }));
      }));
});

// Initialize browser synchronization, which starts a static web server and
// enables automatic browser reloads upon file changes.
workflow.task('sync-browsers', function() {
    syncBrowser.initialize(null, {
        server: {
            rootPath: "./"
        }
    });
});

// Helper function to trigger browser reloads.
workflow.task('sync-refresh', function() {
    syncBrowser.refresh();
});

/*
 *  DEFAULT SETUP TASK
 *
 *  • Processes SCSS, then auto-prefixes and lints the resulting CSS.
 *  • Launches a local web server on port 3000.
 *  • Automatically reloads browsers when HTML or SCSS files are modified.
 */
workflow.task('starter-kit', ['compile-styles', 'compress-styles', 'sync-refresh', 'sync-browsers'], function() {
  workflow.begin('compile-styles', 'style-verify');
  workflow.observe('scss/*.scss', ['compile-styles', 'compress-styles']);
  workflow.observe('styles/main.css', ['sync-refresh', 'compress-styles']);
  workflow.observe('*.html', ['sync-refresh']);
});