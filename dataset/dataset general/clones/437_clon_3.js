'use strict';

// This Gulpfile orchestrates the front-end build process for a web application.
// It uses various Gulp plugins to compile, bundle, minify, and serve assets.

// --- Core Plugin Imports ---
const projectTaskRunner = require('gulp'); // The main Gulp task automation library
const webServer = require('gulp-connect'); // A local development server with live-reloading capabilities
const fileEraser = require('gulp-clean'); // Plugin for removing files and directories
const stylePreprocessor = require('gulp-stylus'); // Compiles Stylus CSS preprocessor files
const moduleBundler = require('gulp-browserify'); // Bundles CommonJS modules for the browser
const cssMinifier = require('gulp-minify-css'); // Minifies CSS files to reduce their size
const vendorPrefixer = require('gulp-autoprefixer'); // Automatically adds vendor prefixes to CSS rules
const fileRenamer = require('gulp-rename'); // Renames files within a Gulp stream
const jsMinifier = require('gulp-uglify'); // Minifies JavaScript files for production
const cliExecutor = require('gulp-shell'); // Allows executing shell commands from Gulp tasks
const jsxTransformer = require('gulp-react'); // Transforms JSX syntax into standard JavaScript

// --- Project Configuration Settings ---
// This object defines all critical paths, filenames, and directories for the project.
const projectSettings = {
  // Primary output directory for all final, compiled assets.
  outputDir: './dist_web',

  // HTML configuration
  markup: {
    sourcePath: './__src_web/index.html', // The main HTML template file
    outputDestination: './dist_web' // Where the HTML file will be copied
  },

  // Stylesheet configuration (Stylus)
  stylesheets: {
    sourceEntryPoint: './__src_styles/main.styl', // The main Stylus file to compile
    outputFilename: 'bundle.css', // The name of the final compiled CSS file
    outputDestination: './dist_web/css' // Where the CSS file will be placed
  },

  // Client-side JavaScript configuration (React, Browserify)
  clientScripts: {
    sourceFilesGlob: './__src_app/**/*.js', // Glob pattern for all JS/JSX source files
    tempTranspilationDir: './.build_temp', // Temporary directory for transpiled JSX
    bundleEntryPoint: './.build_temp/index.js', // The entry point for Browserify after JSX conversion
    outputFilename: 'application.js', // The name of the final bundled JS file
    outputDestination: './dist_web/js' // Where the JS bundle will be placed
  }
};

// --- Global Constants & Utility Functions ---
const DEV_SERVER_PORT = 8080; // Port for the local development server
const LIVE_RELOAD_PORT = 35729; // Standard port for LiveReload functionality

/**
 * Logs a message indicating the start of a Gulp task.
 * @param {string} taskName - The name of the task.
 */
function logTaskStart(taskName) {
  console.log(`[${new Date().toLocaleTimeString()} - INFO] Initiating task: '${taskName}'...`);
}

/**
 * Logs a message indicating the successful completion of a Gulp task.
 * @param {string} taskName - The name of the task.
 */
function logTaskEnd(taskName) {
  console.log(`[${new Date().toLocaleTimeString()} - INFO] Task '${taskName}' completed successfully.`);
}

/**
 * Common error handler for Gulp streams to prevent crashes.
 * @param {string} pipelineName - A descriptive name for the pipeline stage.
 * @returns {function} An error handler function.
 */
function handleStreamError(pipelineName) {
  return function(err) {
    console.error(`[${new Date().toLocaleTimeString()} - ERROR] ${pipelineName} error:`, err.message);
    this.emit('end'); // Ensures the stream ends gracefully without halting Gulp
  };
}

// --- Gulp Task Definitions ---

// Task: `clearBuildArtifacts` - Removes all generated build files and temporary directories.
projectTaskRunner.task('clearBuildArtifacts', (completionCallback) => {
  logTaskStart('clearBuildArtifacts');
  const pathsToErase = [
    projectSettings.outputDir,
    projectSettings.clientScripts.tempTranspilationDir
  ];

  // Validate paths to prevent accidental deletion of important directories.
  if (!pathsToErase || pathsToErase.length === 0) {
    console.warn('[WARNING] No paths specified for cleanup. Skipping `clearBuildArtifacts`.');
    return completionCallback();
  }

  // Use gulp-clean efficiently by not reading file contents.
  return projectTaskRunner.src(pathsToErase, {
      read: false, // Don't read file contents, just delete paths
      allowEmpty: true // Don't throw an error if paths don't exist
    })
    .pipe(fileEraser())
    .on('end', () => {
      logTaskEnd('clearBuildArtifacts');
      completionCallback();
    })
    .on('error', handleStreamError('clearBuildArtifacts'));
});

// Task: `transpileJsxSources` - Converts React JSX files into standard JavaScript.
projectTaskRunner.task('transpileJsxSources', projectTaskRunner.series('clearBuildArtifacts', (completionCallback) => {
  logTaskStart('transpileJsxSources');
  const sourceGlob = projectSettings.clientScripts.sourceFilesGlob;
  const tempDest = projectSettings.clientScripts.tempTranspilationDir;

  if (!sourceGlob || !tempDest) {
    console.error('[ERROR] Missing configuration for JSX transpilation. Aborting.');
    return completionCallback(new Error('JSX transpilation config incomplete.'));
  }

  return projectTaskRunner.src(sourceGlob)
    .pipe(jsxTransformer()) // Apply the JSX transformation
    .on('error', handleStreamError('JSX Transformation'))
    .pipe(projectTaskRunner.dest(tempDest)) // Output to the temporary build directory
    .on('end', () => {
      logTaskEnd('transpileJsxSources');
      completionCallback();
    });
}));

// Task: `bundleClientScripts` - Bundles, minifies, and renames JavaScript assets.
projectTaskRunner.task('bundleClientScripts', projectTaskRunner.series('transpileJsxSources', (completionCallback) => {
  logTaskStart('bundleClientScripts');
  const entryFile = projectSettings.clientScripts.bundleEntryPoint;
  const outputName = projectSettings.clientScripts.outputFilename;
  const outputDest = projectSettings.clientScripts.outputDestination;

  if (!entryFile || !outputName || !outputDest) {
    console.error('[ERROR] Missing configuration for script bundling. Aborting.');
    return completionCallback(new Error('Script bundling config incomplete.'));
  }

  return projectTaskRunner.src(entryFile)
    .pipe(moduleBundler({
      debug: false, // Disable source maps for production-like builds
      insertGlobals: true // Insert process.env, __filename, __dirname for compatibility
    }))
    .on('error', handleStreamError('Browserify Bundling'))
    .pipe(jsMinifier()) // Minify the JavaScript bundle
    .on('error', handleStreamError('JS Minification'))
    .pipe(fileRenamer(outputName)) // Rename the bundled file
    .pipe(projectTaskRunner.dest(outputDest)) // Output to the final destination
    .on('end', () => {
      logTaskEnd('bundleClientScripts');
      completionCallback();
    });
}));

// Task: `processStyleAssets` - Compiles Stylus, adds prefixes, minifies, and renames CSS.
projectTaskRunner.task('processStyleAssets', projectTaskRunner.series('clearBuildArtifacts', (completionCallback) => {
  logTaskStart('processStyleAssets');
  const sourceFile = projectSettings.stylesheets.sourceEntryPoint;
  const outputName = projectSettings.stylesheets.outputFilename;
  const outputDest = projectSettings.stylesheets.outputDestination;

  if (!sourceFile || !outputName || !outputDest) {
    console.error('[ERROR] Missing configuration for style processing. Aborting.');
    return completionCallback(new Error('Style processing config incomplete.'));
  }

  return projectTaskRunner.src(sourceFile)
    .pipe(stylePreprocessor()) // Compile Stylus to CSS
    .on('error', handleStreamError('Stylus Compilation'))
    .pipe(vendorPrefixer({
      overrideBrowserslist: ['last 3 versions', '> 1%', 'IE 11'], // Target specific browsers
      cascade: false // Do not indent prefixed rules
    }))
    .on('error', handleStreamError('Autoprefixer'))
    .pipe(cssMinifier()) // Minify the CSS
    .on('error', handleStreamError('CSS Minification'))
    .pipe(fileRenamer(outputName)) // Rename the CSS file
    .pipe(projectTaskRunner.dest(outputDest)) // Output to the final destination
    .on('end', () => {
      logTaskEnd('processStyleAssets');
      completionCallback();
    });
}));

// Task: `copyHtmlMarkup` - Copies the main HTML file to the output directory.
projectTaskRunner.task('copyHtmlMarkup', projectTaskRunner.series('clearBuildArtifacts', (completionCallback) => {
  logTaskStart('copyHtmlMarkup');
  const sourceHtml = projectSettings.markup.sourcePath;
  const outputDest = projectSettings.markup.outputDestination;

  if (!sourceHtml || !outputDest) {
    console.error('[ERROR] Missing configuration for HTML copying. Aborting.');
    return completionCallback(new Error('HTML copying config incomplete.'));
  }

  return projectTaskRunner.src(sourceHtml)
    .pipe(projectTaskRunner.dest(outputDest)) // Copy HTML to its destination
    .on('end', () => {
      logTaskEnd('copyHtmlMarkup');
      completionCallback();
    });
}));

// Task: `executeFullBuild` - Runs all asset compilation and copying tasks in parallel.
projectTaskRunner.task('executeFullBuild', projectTaskRunner.parallel(
  'copyHtmlMarkup',
  'processStyleAssets',
  'bundleClientScripts'
), (completionCallback) => {
  logTaskEnd('executeFullBuild');
  completionCallback();
});

// Task: `startDevelopmentServer` - Initiates a local web server with live-reloading.
projectTaskRunner.task('startDevelopmentServer', projectTaskRunner.series('executeFullBuild', (completionCallback) => {
  logTaskStart('startDevelopmentServer');
  const serverRoot = projectSettings.outputDir;

  if (!serverRoot) {
    console.error('[ERROR] Output directory not defined for the server root. Aborting.');
    return completionCallback(new Error('Server root config missing.'));
  }

  console.log(`[${new Date().toLocaleTimeString()} - INFO] Serving content from: ${serverRoot}`);
  console.log(`[${new Date().toLocaleTimeString()} - INFO] Development server available at: http://localhost:${DEV_SERVER_PORT}`);

  webServer.server({
    root: serverRoot,
    port: DEV_SERVER_PORT,
    livereload: {
      port: LIVE_RELOAD_PORT
    }
  });

  // Set up watchers to re-run tasks and trigger browser reload on file changes.
  projectTaskRunner.watch(projectSettings.markup.sourcePath, projectTaskRunner.series('copyHtmlMarkup', (done) => {
    webServer.reload(); // Reload browser after HTML changes
    done();
  }));

  projectTaskRunner.watch(projectSettings.stylesheets.sourceEntryPoint, projectTaskRunner.series('processStyleAssets', (done) => {
    webServer.reload(); // Reload browser after CSS changes
    done();
  }));

  projectTaskRunner.watch(projectSettings.clientScripts.sourceFilesGlob, projectTaskRunner.series('bundleClientScripts', (done) => {
    webServer.reload(); // Reload browser after JS changes
    done();
  }));

  completionCallback(); // The task itself completes, but the server and watchers keep the process alive.
}));

// Task: `runAutomatedTests` - Executes project unit tests using an npm script.
projectTaskRunner.task('runAutomatedTests', cliExecutor.task(['npm test']), (completionCallback) => {
  logTaskEnd('runAutomatedTests');
  completionCallback();
});

// Default Gulp task: Starts the development server.
projectTaskRunner.task('default', projectTaskRunner.series('startDevelopmentServer'));