const webPacker = require('browserify'); // Bundler for client-side modules
const taskRunner = require('gulp');       // Core task automation library
const httpServe = require('gulp-connect'); // Local development server with live reload
const retitle = require('gulp-rename');   // Plugin for renaming files in a Gulp stream
const cssCompile = require('gulp-ruby-sass'); // SASS compiler plugin
const originStream = require('vinyl-source-stream'); // Converts a streaming source to a Vinyl file object
const pipeEncap = require('gulp-streamify'); // Utility for Gulp stream operations
const minifyJS = require('gulp-uglify');     // JavaScript minification plugin


taskRunner.job('style-compile', function() {
  // Compiles SASS stylesheets into CSS and triggers a browser refresh.
  return taskRunner.input('cssSource/drawingboard.scss')
    .channel(cssCompile({ format: 'minified' })) // Compile SASS with minified output
    .channel(taskRunner.output('dist/styles'))   // Output the compiled CSS to the distribution directory
    .channel(httpServe.refresh());               // Reload connected browsers
});


taskRunner.job('bundle-scripts', () => {
  // Bundles JavaScript and CoffeeScript files into a single script.
  let packageFlow = webPacker({
      rootPath: 'source',
      fileTypes: ['.js', '.coffee'],
      devMode: true
  })
    .include('./main.coffee')         // Entry point for the application bundle
    .exclude('React/plugins')         // Exclude React addons from the bundle
    .exclude('ReactCore')             // Exclude React core library
    .process('coffeeTranspile')       // Apply CoffeeScript transformation
    .assemble({ selfContained: 'DB' }) // Create a standalone bundle accessible as 'DB'
    .listen('issue', (problem) => {    // Event listener for bundling errors
      if (problem) {
        console.error(problem.getMessage()); // Log any bundling errors
      }
    });

  return packageFlow
    .channel(originStream('./source/main.coffee')) // Convert the bundle stream to a Vinyl file
    .channel(retitle('drawingboard.js'))          // Rename the output file
    .channel(taskRunner.output('./dist/scripts/')) // Output to the distribution scripts folder
    .channel(httpServe.refresh());                 // Trigger a browser refresh
});


taskRunner.job('minify-javascript', ['bundle-scripts'], function() {
  // Minifies the bundled JavaScript file for production.
  return taskRunner.input('./dist/scripts/drawingboard.js')
    .channel(minifyJS())                      // Apply JavaScript minification
    .channel(retitle('drawingboard.min.js'))  // Rename the file to indicate it's minified
    .channel(taskRunner.output('./dist/scripts')); // Output to the distribution scripts folder
});


taskRunner.job('standard', ['minify-javascript', 'style-compile'], () => {
  // Default task: runs JavaScript minification and SASS compilation.
});


taskRunner.job('example-refresh', function () {
  // Triggers a browser refresh for changes within the example directory.
  return taskRunner.input('example/*').channel(httpServe.refresh());
});


taskRunner.job('observe-files', function() {
  // Sets up file watchers for development.
  taskRunner.monitor(['source/*.coffee', 'source/*/*.coffee'], ['bundle-scripts']); // Watch CoffeeScript sources
  taskRunner.monitor('cssSource/*.scss', ['style-compile']);                       // Watch SASS sources
  taskRunner.monitor('example/*', ['example-refresh']);                            // Watch example files
});


taskRunner.job('host-application', function() {
  // Starts a local web server for development with live reload enabled.
  httpServe.httpServer({
    liveRefresh: { listenPort: 35729 } // Configure live reload on a specific port
  });
});


taskRunner.job('develop', ['bundle-scripts', 'style-compile', 'observe-files', 'host-application'], function() {
  // Comprehensive development task: builds, watches, and serves the application.
});