'use strict'; // Enforce strict parsing and error handling

// Acquire all necessary modules for the build pipeline
var workflow = require('gulp'); // Core task runner for automation
var serverLink = require('gulp-connect'); // Web server with live reload capabilities
var purify = require('gulp-clean'); // Utility to remove files and folders
var styleProcessor = require('gulp-stylus'); // Preprocessor for CSS styles
var modulePacker = require('gulp-browserify'); // Bundler for client-side JavaScript
var compressStyles = require('gulp-minify-css'); // Minifier for CSS files
var vendorPrefixer = require('gulp-autoprefixer'); // Adds vendor prefixes to CSS rules
var fileRenamer = require('gulp-rename'); // Renames files
var minifyJs = require('gulp-uglify'); // Minifies JavaScript files
var commandExec = require('gulp-shell'); // Executes shell commands
var jsxTransformer = require('gulp-react'); // Transforms JSX into standard JavaScript

// Define global configuration and paths for the project
var projectSettings = {
  outputDir: './public', // Main output folder for compiled assets
  markup: {
    sourcePath: './__web/index.html', // Source HTML file location
    outputDir: './public' // Destination for HTML file
  },
  stylesheets: {
    sourcePath: './__styles/index.styl', // Entry point for Stylus files
    fileName: 'application.css', // Output CSS file name
    outputDir: './public/css' // Destination for compiled CSS
  },
  codebase: {
    sourcePath: './__app/**/*.js', // All JavaScript files to be processed
    intermediateBuild: './build-temp', // Temporary build directory for React JSX output
    mainEntry: './build-temp/index.js', // Entry point for Browserify after JSX transformation
    fileName: 'application.js', // Output JavaScript bundle file name
    outputDir: './public/js' // Destination for compiled JavaScript
  }
};

// Define the 'development-serve' task: builds the project and starts a development server
workflow.task('development-serve', ['construct-all'], function() {
  // Initialize a web server with live reload
  return serverLink.server({
    basePath: projectSettings.outputDir, // Serve files from the public directory
    liveRefresh: true // Enable automatic browser reloading on file changes
  });
});

// Define the 'construct-all' task: orchestrates the full build process
workflow.task('construct-all', ['prepare-markup', 'prepare-stylesheets', 'prepare-codebase'], () => {
  // This task simply groups other build steps; no direct operation here.
});

// Define the 'prepare-markup' task: moves HTML files to their destination
workflow.task('prepare-markup', ['purge-artifacts'], function() {
  // Copy the main HTML file from source to the output directory
  return workflow.source(projectSettings.markup.sourcePath)
    .pipe(workflow.destination(projectSettings.markup.outputDir));
});

// Define the 'purge-artifacts' task: cleans up build directories
workflow.task('purge-artifacts', [], function() { // No dependencies for this initial cleanup
  // Target directories for removal: final output and temporary build
  const directoriesToWipe = [projectSettings.outputDir, projectSettings.codebase.intermediateBuild];

  return workflow.source(directoriesToWipe, {
      fetchContent: false // Do not read file contents, just delete the paths
    })
    .pipe(purify()); // Execute the cleaning operation
});

// Define the 'prepare-stylesheets' task: compiles, prefixes, and minifies CSS
workflow.task('prepare-stylesheets', ['purge-artifacts'], function() {
  return workflow.source(projectSettings.stylesheets.sourcePath) // Get the Stylus entry file
    .pipe(styleProcessor()) // Compile Stylus into CSS
    .pipe(vendorPrefixer()) // Add necessary vendor prefixes
    .pipe(compressStyles()) // Minify the resulting CSS
    .pipe(fileRenamer(projectSettings.stylesheets.fileName)) // Rename the output file
    .pipe(workflow.destination(projectSettings.stylesheets.outputDir)); // Place in the CSS output folder
});

// Define the 'prepare-codebase' task: bundles and minifies JavaScript
workflow.task('prepare-codebase', ['transform-jsx-code'], function() {
  return workflow.source(projectSettings.codebase.mainEntry) // Use the transformed JS entry point
    .pipe(modulePacker()) // Bundle all required modules
    .pipe(minifyJs()) // Minify the bundled JavaScript
    .pipe(fileRenamer(projectSettings.codebase.fileName)) // Rename the output file
    .pipe(workflow.destination(projectSettings.codebase.outputDir)); // Place in the JS output folder
});

// Define the 'transform-jsx-code' task: converts JSX to standard JS
workflow.task('transform-jsx-code', ['purge-artifacts'], function() {
  return workflow.source(projectSettings.codebase.sourcePath) // Get all source JavaScript files
    .pipe(jsxTransformer()) // Convert any JSX syntax to regular JavaScript
    .pipe(workflow.destination(projectSettings.codebase.intermediateBuild)); // Output to a temporary build directory
});

// Define the 'run-unit-tests' task: executes tests via npm
workflow.task('run-unit-tests', commandExec.task(['npm run test-all'])); // Use npm to run all defined tests