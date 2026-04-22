var gulp = require('gulp'); // Core Gulp library for task automation
var del = require('del'); // Utility to delete files and folders
var less = require('gulp-less'); // Gulp plugin to compile Less CSS
var runSequence = require('run-sequence'); // Gulp plugin to run tasks in order
var rename = require("gulp-rename"); // Gulp plugin to rename files
var nodemon = require('gulp-nodemon'); // Gulp plugin to restart Node.js applications automatically
var _ = require('lodash'); // A modern JavaScript utility library
var browserify = require('browserify'); // Module bundler for the browser
var reactify = require('reactify'); // Browserify transform for React JSX syntax
var watchify = require('watchify'); // Browserify with caching for faster incremental builds
var source = require('vinyl-source-stream'); // Use conventional text streams with Gulp
var buffer = require('vinyl-buffer'); // Convert streaming vinyl files to buffered ones
var sort = require('sort-stream'); // A stream utility for sorting (not used in this specific snippet)
var notify = require('gulp-notify'); // Gulp plugin to send OS notifications

var browserSync = require('browser-sync'); // Live reloading and browser synchronization tool

var reload = browserSync.reload; // Shortcut for browser-sync's reload method

var pkg = require('./package.json'); // Loads the project's package.json file

var to5ify = require("6to5ify"); // Browserify transform for Babel (formerly 6to5)


// Define various file paths and build directories used throughout the Gulpfile.
var files = {
  // Main HTML entry file
  index: './src/index.html',

  // Main JavaScript entry file for Browserify
  js: './src/index.js',

  // All Less files to be watched and compiled
  less: 'src/less/**/*.less',

  // The name for the output JavaScript bundle
  bundle: 'app.js',

  // Destination directory for compiled JavaScript
  buildJS: 'build/js',

  // Destination directory for compiled CSS
  buildCss: 'build/css'
};


/*
 * Gulp Task Definitions
 * These tasks automate various build and development processes.
 */


// Task to clean the build directory before a new build.
gulp.task('clean', function (cb) {
  // Delete the 'build' folder and all its contents.
  // The 'force: true' option is used to allow deleting outside the current working directory.
  del(['build'], {
    force: true
  }, cb);
});


// Task to copy the main HTML file to the build directory.
gulp.task('copy-index', function () {
  return gulp
    .src(files.index) // Source the index.html file.
    .pipe(gulp.dest('./build')) // Place the file into the 'build' folder.
    .pipe(reload({ // Instruct BrowserSync to reload the browser.
      stream: true // Use stream reloading for CSS injection if applicable.
    }));
});


// Task to bundle JavaScript using Browserify, applying transforms for ES6 and React.
gulp.task('browserify', function () {
  browserify(files.js) // Initialize Browserify with the main JavaScript entry point.
    .transform(to5ify) // Apply the Babel transform (ES6 to ES5).
    .transform(reactify) // Apply the React JSX transform.
    .bundle() // Perform the actual bundling of modules.
    .pipe(source(files.bundle)) // Convert the Browserify output stream into a Vinyl file stream.
    .pipe(buffer()) // Convert the file stream to a buffered file for Gulp plugins.
    .pipe(gulp.dest(files.buildJS)); // Output the bundled JavaScript to the specified build directory.
});


// Task to set up Watchify for fast, incremental JavaScript bundling during development.
gulp.task('watchify', function () {
  var bundler = watchify(
    browserify(
      [files.js], // Array of entry files for Browserify.
      watchify.args // Pass Watchify-specific arguments to Browserify.
    )
  );

  /**
   * Internal function to perform the bundling process.
   * This function is called initially and on subsequent file changes.
   * @returns {Stream} A Gulp stream representing the bundled JavaScript.
   */
  function rebundle() {
    return bundler
      .bundle() // Execute the bundling process.
      .on('error', notify.onError()) // Handle any errors during bundling and display an OS notification.
      .pipe(source(files.bundle)) // Convert the bundled output into a vinyl file stream.
      .pipe(gulp.dest(files.buildJS)) // Output the bundled file to the JavaScript build directory.
      .pipe(reload({ // Trigger a browser reload via BrowserSync.
        stream: true // Enable stream injection for faster updates.
      }));
  }

  // Apply necessary transforms to the bundler.
  bundler
    .transform(to5ify) // Apply Babel for ES6 transpilation.
    .transform(reactify) // Apply React JSX transformation.
    .on('update', rebundle); // Set up an event listener to re-run rebundle on file changes.

  // Perform an initial bundle when the task starts.
  return rebundle();
});


// Task to compile Less CSS files into standard CSS.
gulp.task('less', function () {
  return gulp.src('./src/less/main.less') // Specify the main Less file to compile.
    .pipe(less({ // Configure the Less compiler.
      compile: true, // Ensure compilation is enabled (default behavior).
      compress: false, // Do not compress the output CSS for development readability.
      noUnderscores: false, // Allow identifiers with underscores.
      noIDs: false, // Allow ID selectors.
      zeroUnits: false // Keep units for zero values (e.g., 0px).
    }))
    .pipe(rename('app.css')) // Rename the compiled CSS file to 'app.css'.
    .pipe(gulp.dest('./build/css/')) // Output the compiled CSS to the CSS build directory.
    .pipe(reload({ // Trigger a browser reload via BrowserSync.
      stream: true // Enable stream injection for CSS changes.
    }));
});


// Task to initialize BrowserSync for live development.
gulp.task('browserSync', function () {
  browserSync({ // Configure BrowserSync server options.
    server: {
      baseDir: './build' // Specify the base directory to serve files from.
    }
  })
});


// Task to set up watchers for Less files and the main HTML file.
gulp.task('watchTask', function () {
  gulp.watch(files.less, ['less']); // Watch all Less files and run the 'less' task on change.
  gulp.watch(files.index, ['copy-index']); // Watch the main HTML file and run 'copy-index' on change.
});


// The primary 'watch' task for development, which cleans the build and then starts all watch-related tasks.
gulp.task('watch', ['clean'], function () {
  // Start all concurrent tasks required for continuous development.
  gulp.start([
    'copy-index', // Copy the HTML file.
    'browserSync', // Initialize the browser synchronization server.
    'watchTask', // Set up file watchers for Less and HTML.
    'watchify', // Start the Watchify bundler for JavaScript.
    'less' // Compile Less files initially.
  ]);
});


// The default Gulp task, typically run for a one-time build.
gulp.task('default', [
  'clean', // First, clean the build directory.
  'copy-index', // Then, copy the HTML file.
  'browserify' // Finally, bundle the JavaScript.
]);