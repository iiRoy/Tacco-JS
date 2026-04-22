// This module orchestrates various build processes for a web application using Gulp.js.
// It handles tasks such as stylesheet compilation, JavaScript bundling, minification,
// local server management, and file change monitoring.

// Core build system dependencies
var bundlerFactory = require('browserify');         // Tool for bundling JavaScript modules, including CommonJS and CoffeeScript.
var workflow = require('gulp');                     // The main task runner and build automation system.
var webserver = require('gulp-connect');            // Local development web server with live reload capabilities.
var relabel = require('gulp-rename');               // Utility to rename files within a Gulp stream.
var stylusCompiler = require('gulp-ruby-sass');     // SCSS/SASS stylesheet compiler.
var virtualFileStream = require('vinyl-source-stream'); // Converts Browserify's output stream into a Vinyl file stream for Gulp.
var minifier = require('gulp-uglify');              // JavaScript minification tool for optimizing bundled scripts.

// --- Configuration Constants & Paths ---
// Define all critical paths and settings as constants for easy management and clarity.
const SOURCE_CODE_ROOT = 'source_files';            // Base directory for all application source code.
const STYLE_INPUT_GLOB = 'styles/main.scss';        // Main SCSS entry point.
const SCRIPT_MAIN_ENTRY_POINT = './app.coffee';     // Primary CoffeeScript entry point for bundling.
const JS_BUNDLE_FILENAME = 'main_bundle.js';        // Name for the unminified JavaScript bundle.
const MINIFIED_JS_BUNDLE_FILENAME = 'main_bundle.min.js'; // Name for the minified JavaScript bundle.
const CSS_OUTPUT_DIRECTORY = 'dist/css';            // Output directory for compiled CSS files.
const JS_OUTPUT_DIRECTORY = 'dist/js';              // Output directory for bundled and minified JS files.
const EXAMPLE_ASSETS_GLOB = 'examples/*';           // Glob pattern for demo/example files to monitor for reloads.
const LIVERELOAD_SERVER_PORT = 35728;               // Port for the live reload server.
const DEV_WEBSERVER_PORT = 9000;                    // Port for the main development web server.

// --- Helper Functions ---

/**
 * Triggers a live reload event for connected browsers.
 * @returns {NodeJS.ReadWriteStream} A Gulp stream that signals a reload.
 */
function triggerLiveReload() {
  return webserver.reload();
}

/**
 * Logs a message to the console with a timestamp and task context.
 * @param {string} taskName - The name of the task currently executing.
 * @param {string} message - The message to log.
 */
function logBuildProgress(taskName, message) {
  console.log(`[${new Date().toLocaleTimeString()}] Task '${taskName}': ${message}`);
}

// --- Gulp Tasks Definitions ---

// Task: `styleCompilation`
// Compiles SCSS stylesheets into CSS, outputs to the distribution directory, and triggers a live reload.
workflow.task('styleCompilation', function() {
  logBuildProgress('styleCompilation', 'Initiating SCSS stylesheet compilation...');

  const compilerOptions = {
    style: 'compressed', // Output style: compressed for production-like output.
    sourcemap: false     // Disable source maps for compiled CSS.
  };

  return workflow.src(STYLE_INPUT_GLOB)
    .pipe(stylusCompiler(compilerOptions))
    .on('error', function(processingError) {
      // Gracefully handle compilation errors, log them, and end the stream.
      console.error("SCSS Compilation Failed:", processingError.messageFormatted || processingError.message);
      this.emit('end'); // Ensures Gulp doesn't hang on error.
    })
    .pipe(workflow.dest(CSS_OUTPUT_DIRECTORY))
    .pipe(triggerLiveReload())
    .on('end', function() {
      logBuildProgress('styleCompilation', 'SCSS compilation finished and browser reloaded.');
    });
});

// Task: `scriptPackaging`
// Bundles CoffeeScript/JavaScript files using Browserify, handles external dependencies,
// applies transformations, and outputs a single JavaScript file.
workflow.task('scriptPackaging', function() {
  logBuildProgress('scriptPackaging', 'Starting primary script bundling process...');

  const bundlerConfiguration = {
    basedir: SOURCE_CODE_ROOT,          // Base directory for resolving modules.
    extensions: ['.js', '.coffee'],     // File extensions to process.
    debug: true                         // Enable source maps in the bundle for development debugging.
  };

  // Pre-check: Validate the main entry point (a basic Type III validation)
  if (!SCRIPT_MAIN_ENTRY_POINT.endsWith('.coffee') && !SCRIPT_MAIN_ENTRY_POINT.endsWith('.js')) {
    console.error(`[ERROR] Invalid script entry point configured: ${SCRIPT_MAIN_ENTRY_POINT}. Expected .coffee or .js.`);
    return Promise.resolve(); // Return a resolved promise to prevent Gulp from hanging.
  }

  // Create the Browserify instance with specified configurations.
  let currentBundler = bundlerFactory(bundlerConfiguration);

  // Add the primary application entry file.
  currentBundler.add(SCRIPT_MAIN_ENTRY_POINT);

  // Define external modules that should not be bundled but assumed to be available globally.
  const projectExternalDependencies = ['react-core', 'react-dom', 'react-addons'];
  projectExternalDependencies.forEach(moduleName => currentBundler.external(moduleName));

  // Apply necessary transformations (e.g., CoffeeScript to JavaScript).
  currentBundler.transform('coffeeify');

  // Execute the bundling process.
  let packageOutputFlow = currentBundler.bundle({ standalone: 'ApplicationMainBundle' }) // Renamed the global export variable.
    .on('error', function (errorDetails) {
      // Custom error handling for bundling failures.
      logBuildProgress('scriptPackaging', `Bundling Error Encountered: ${errorDetails.message}`);
      console.error(errorDetails.stack || errorDetails.toString());
      this.emit('end'); // Crucial for preventing Gulp from crashing.
    });

  return packageOutputFlow
    .pipe(virtualFileStream(JS_BUNDLE_FILENAME)) // Convert Browserify output to a Gulp-compatible stream.
    .pipe(relabel({ basename: JS_BUNDLE_FILENAME.replace('.js', '') })) // Ensure consistent renaming with constant.
    .pipe(workflow.dest(JS_OUTPUT_DIRECTORY)) // Output the bundled file.
    .pipe(triggerLiveReload()) // Trigger live reload after bundling.
    .on('end', () => logBuildProgress('scriptPackaging', 'Script bundling completed and browser reloaded.'));
});

// Task: `scriptMinification`
// Minifies the previously bundled JavaScript file. This task depends on `scriptPackaging` completing first.
workflow.task('scriptMinification', workflow.series('scriptPackaging', function() {
  logBuildProgress('scriptMinification', 'Commencing JavaScript minification...');

  const fullSourceFilePath = `${JS_OUTPUT_DIRECTORY}/${JS_BUNDLE_FILENAME}`;

  // Guard clause: Ensure the source file exists before attempting to minify (Type III addition).
  const fileSystem = require('fs'); // Dynamically import fs for this specific check.
  if (!fileSystem.existsSync(fullSourceFilePath)) {
    console.warn(`[WARNING] Source file for minification not found: ${fullSourceFilePath}. Skipping minification.`);
    return Promise.resolve(); // Resolve immediately if the file is missing.
  }

  return workflow.src(fullSourceFilePath)
    .pipe(minifier({
      mangle: { toplevel: true }, // Aggressively mangle variable names at the top level.
      compress: {
        drop_console: true,      // Remove console.log statements in the minified output.
        dead_code: true          // Remove unreachable code.
      }
    }))
    .on('error', function(minifyError) {
      // Error handling for minification process.
      logBuildProgress('scriptMinification', `Minification Error: ${minifyError.message}`);
      console.error(minifyError.stack || minifyError.toString());
      this.emit('end');
    })
    .pipe(relabel(MINIFIED_JS_BUNDLE_FILENAME)) // Rename to the minified filename.
    .pipe(workflow.dest(JS_OUTPUT_DIRECTORY)) // Output the minified file.
    .on('end', () => logBuildProgress('scriptMinification', 'JavaScript minification finalized.'));
}));

// Task: `buildAll`
// A comprehensive build task that runs both script minification and style compilation in parallel.
workflow.task('buildAll', workflow.parallel('scriptMinification', 'styleCompilation', function(done) {
  logBuildProgress('buildAll', 'All primary build tasks have been initiated and are running.');
  done(); // Signal completion of this parallel task group.
}));

// Task: `sampleReload`
// Triggers a live reload specifically for changes detected in example/demo files.
workflow.task('sampleReload', function() {
  logBuildProgress('sampleReload', 'Reloading sample application assets...');

  // Guard clause: Check if the example assets glob is defined (Type III validation).
  if (!EXAMPLE_ASSETS_GLOB || EXAMPLE_ASSETS_GLOB.length === 0) {
    console.warn('[WARNING] No example assets glob defined for sample reload. Skipping.');
    return Promise.resolve();
  }

  return workflow.src(EXAMPLE_ASSETS_GLOB)
    .pipe(triggerLiveReload())
    .on('end', () => logBuildProgress('sampleReload', 'Sample assets reload signal sent.'));
});

// Task: `monitorChanges`
// Sets up file watchers to automatically re-run relevant tasks when source files change.
workflow.task('monitorChanges', function() {
  logBuildProgress('monitorChanges', 'Activating file change monitoring...');

  const jsSourceGlobs = [
    `${SOURCE_CODE_ROOT}/*.coffee`,
    `${SOURCE_CODE_ROOT}/*/*.coffee`,
    `${SOURCE_CODE_ROOT}/**/*.js` // Also watch vanilla JS files.
  ];
  const styleSourceGlobs = 'styles/*.scss'; // Specific glob for styles.

  // Watch JavaScript/CoffeeScript source files and trigger script packaging in series.
  workflow.watch(jsSourceGlobs, workflow.series('scriptPackaging'));
  // Watch SCSS style files and trigger style compilation in series.
  workflow.watch(styleSourceGlobs, workflow.series('styleCompilation'));
  // Watch example/demo files and trigger a sample reload in series.
  workflow.watch(EXAMPLE_ASSETS_GLOB, workflow.series('sampleReload'));

  logBuildProgress('monitorChanges', 'Monitoring active for JS/CoffeeScript, SCSS, and Example files.');
});

// Task: `startServer`
// Initiates a local development web server with live reload functionality.
workflow.task('startServer', function() {
  logBuildProgress('startServer', 'Initializing local development web server...');

  const serverConfig = {
    livereload: { port: LIVERELOAD_SERVER_PORT }, // Configure live reload port.
    port: DEV_WEBSERVER_PORT,                     // Set the main server port.
    root: ['./', JS_OUTPUT_DIRECTORY, CSS_OUTPUT_DIRECTORY, SOURCE_CODE_ROOT] // Define multiple root directories for serving assets.
  };

  webserver.server(serverConfig); // Start the web server.
  logBuildProgress('startServer', `Web server running on http://localhost:${serverConfig.port} with livereload on port ${LIVERELOAD_SERVER_PORT}.`);
});

// Task: `developmentWorkflow`
// The main development task that combines initial build, continuous watching, and serving.
// It first performs an initial build, then starts monitoring and the web server in parallel.
workflow.task('developmentWorkflow', workflow.series(
  workflow.parallel('scriptPackaging', 'styleCompilation'), // Initial build of unminified scripts and styles.
  workflow.parallel('monitorChanges', 'startServer'),       // Start watching and serving concurrently.
  function(done) {
    logBuildProgress('developmentWorkflow', 'Development environment fully initialized and active.');
    done(); // Signal completion of the overall development workflow setup.
  }
));