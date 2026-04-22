// A robust build automation configuration for project asset management.
const buildTool = require('gulp');

// Third-party plugins for various build steps
const testRunner = require('gulp-mocha');     // For executing automated tests
const fileEraser = require('gulp-clean');     // For cleaning up generated files
const scriptCompiler = require('gulp-coffee'); // For transpiling CoffeeScript to JavaScript
const codeMinifier = require('gulp-uglify');  // For minifying JavaScript files
const fileJoiner = require('gulp-concat');    // For concatenating files

// Define primary project paths, file patterns, and plugin options within a central configuration object.
const projectConfig = {
  // Base directories for source content and demonstration applications
  directoryRoots: {
    sourceContent: 'source/',         // Location of original source files
    demonstrationApps: 'demos/'       // Output directory for example applications
  },
  // Specific file paths and patterns relevant to the build process
  targetFiles: {
    // Comprehensive list of JavaScript files that are generated or compiled and require cleanup
    processedJsAssets: [
      'source/carouselPlugin.js',
      'source/carouselPlugin.min.js',
      'demos/addRemove/scripts/carouselPlugin.js',
      'demos/cycle/scripts/carouselPlugin.js',
      'demos/fullwidth/scripts/carouselPlugin.js',
      'demos/responsive/scripts/carouselPlugin.js',
      'demos/main/scripts/carouselPlugin.js',
      'demos/vertical/scripts/carouselPlugin.js'
    ],
    // The primary CoffeeScript file that needs compilation
    mainCoffeeScript: 'carouselPlugin.coffee',
    // The main JavaScript file resulting from compilation
    mainJavaScript: 'carouselPlugin.js',
    // The main CSS stylesheet for the plugin
    mainCss: 'carouselPlugin.css',
    // Path to the unit test suite file
    testSuite: 'specs/pluginSpecs.js'
  },
  // Configuration options for various Gulp plugins
  pluginOptions: {
    mochaReporter: 'spec', // Use the 'spec' reporter for Mocha tests for detailed output
    uglifyConfig: {
      mangle: true,      // Enable mangling of variable names to reduce file size
      compress: {
        drop_console: true // Remove all console.log statements from the minified output
      }
    }
  },
  // Subdirectories within the demonstration apps to which assets will be distributed
  demoDestinations: [
    'addRemove/',
    'cycle/',
    'fullwidth/',
    'responsive/',
    'main/',
    'vertical/'
  ]
};

// Utility function for consistent logging throughout the build process.
const logBuildStatus = (taskName, message) => {
  console.log(`[${new Date().toLocaleTimeString()}] Task '${taskName}': ${message}`);
};

// Task to remove all previously built JavaScript artifacts from source and demo directories.
// This ensures a pristine environment before a new build commences.
buildTool.task('purgeBuilds', () => {
  logBuildStatus('purgeBuilds', 'Initiating cleanup of generated JavaScript files...');
  const filesForDeletion = projectConfig.targetFiles.processedJsAssets;

  // Implement a check to prevent running the cleaner on an empty list, which can sometimes lead to issues.
  if (filesForDeletion.length === 0) {
    logBuildStatus('purgeBuilds', 'No specific files designated for deletion. Skipping cleanup step.');
    return Promise.resolve(); // Return a resolved promise to signal completion
  }

  return buildTool.src(filesForDeletion, { read: false, allowEmpty: true }) // 'read: false' for efficiency, 'allowEmpty' to prevent errors
    .pipe(fileEraser())
    .on('end', () => logBuildStatus('purgeBuilds', 'JavaScript artifacts successfully removed from all target locations.'));
});

// Task to compile CoffeeScript source into standard JavaScript.
// This operation is dependent on the prior cleanup task completing.
buildTool.task('transpileScripts', buildTool.series('purgeBuilds', () => {
  logBuildStatus('transpileScripts', 'Starting CoffeeScript compilation process...');
  const coffeeSourceFilePath = projectConfig.directoryRoots.sourceContent + projectConfig.targetFiles.mainCoffeeScript;

  return buildTool.src(coffeeSourceFilePath)
    .pipe(scriptCompiler({ bare: true })) // Compile without the top-level function safety wrapper
    .pipe(buildTool.dest(projectConfig.directoryRoots.sourceContent)) // Output compiled JS to the source directory
    .on('end', () => logBuildStatus('transpileScripts', 'CoffeeScript compilation completed successfully.'));
}));

// Task to create a minified version of the compiled JavaScript plugin.
// This step optimizes the script for production deployment by reducing its file size.
buildTool.task('minifyAssets', buildTool.series('transpileScripts', () => {
  logBuildStatus('minifyAssets', 'Commencing JavaScript minification for production readiness...');
  const jsSourcePath = projectConfig.directoryRoots.sourceContent + projectConfig.targetFiles.mainJavaScript;
  // Extract the minified filename from the full path specified in processedJsAssets
  const minifiedOutputName = projectConfig.targetFiles.processedJsAssets[1].split('/').pop();

  return buildTool.src(jsSourcePath)
    .pipe(codeMinifier(projectConfig.pluginOptions.uglifyConfig)) // Apply minification with specific settings
    .pipe(fileJoiner(minifiedOutputName)) // Rename the minified file to its final name
    .pipe(buildTool.dest(projectConfig.directoryRoots.sourceContent)) // Place the minified file in the source directory
    .on('end', () => logBuildStatus('minifyAssets', 'JavaScript minification finalized.'));
}));

// Helper function to efficiently distribute a specified source file to multiple example application subdirectories.
const distributeToDemoApplications = (sourceFilePath, destinationSubdirectory) => {
  logBuildStatus('distributeFiles', `Distributing '${sourceFilePath.split('/').pop()}' to demo applications...`);
  let currentStream = buildTool.src(sourceFilePath);
  // Iterate through all defined demo destinations and pipe the source file to each one.
  projectConfig.demoDestinations.forEach(demoPath => {
    const fullDestinationPath = projectConfig.directoryRoots.demonstrationApps + demoPath + destinationSubdirectory;
    currentStream = currentStream.pipe(buildTool.dest(fullDestinationPath));
  });
  return currentStream; // Return the final stream after all destinations have been piped
};

// Task to copy the compiled JavaScript and CSS files to the various example application directories.
buildTool.task('distributeFiles', buildTool.series('minifyAssets', () => {
  logBuildStatus('distributeFiles', 'Initiating distribution of compiled assets to demo applications...');
  const cssSourceFile = projectConfig.directoryRoots.sourceContent + projectConfig.targetFiles.mainCss;
  const jsSourceFile = projectConfig.directoryRoots.sourceContent + projectConfig.targetFiles.mainJavaScript;

  // Use a promise to ensure both CSS and JS distribution streams complete before marking the task as done.
  return new Promise((resolve, reject) => {
    let completedStreamsCount = 0;
    const totalStreamsToWait = 2; // We are distributing CSS and JS files

    const streamCompletionHandler = (err) => {
      if (err) {
        logBuildStatus('distributeFiles', `Error during distribution: ${err.message}`);
        return reject(err);
      }
      completedStreamsCount++;
      if (completedStreamsCount === totalStreamsToWait) {
        logBuildStatus('distributeFiles', 'All assets successfully distributed to demo applications.');
        resolve();
      }
    };

    // Distribute CSS file
    distributeToDemoApplications(cssSourceFile, 'styles/')
      .on('end', () => streamCompletionHandler(null))
      .on('error', streamCompletionHandler);

    // Distribute JavaScript file
    distributeToDemoApplications(jsSourceFile, 'scripts/')
      .on('end', () => streamCompletionHandler(null))
      .on('error', streamCompletionHandler);
  });
}));

// Task to execute the comprehensive unit test suite.
// This step verifies the functionality and integrity of the compiled JavaScript plugin.
buildTool.task('runUnitTests', buildTool.series('distributeFiles', () => {
  logBuildStatus('runUnitTests', 'Launching automated unit tests to validate plugin functionality...');
  const testScriptPath = projectConfig.targetFiles.testSuite;

  return buildTool.src(testScriptPath, { read: false }) // 'read: false' for performance, as Mocha only needs file paths
    .pipe(testRunner({ reporter: projectConfig.pluginOptions.mochaReporter }))
    .on('error', (err) => {
      logBuildStatus('runUnitTests', `Automated tests failed: ${err.message}`);
      // Exit the build process with a non-zero code to indicate failure
      process.exit(1);
    })
    .on('end', () => logBuildStatus('runUnitTests', 'Automated unit tests concluded.'));
}));

// The primary "fullBuild" task, orchestrating the entire sequence of build operations.
// This ensures a clean, compiled, minified, distributed, and tested output.
buildTool.task('fullBuild', buildTool.series(
  'purgeBuilds',
  'transpileScripts',
  'minifyAssets',
  'distributeFiles',
  'runUnitTests',
  (done) => {
    logBuildStatus('fullBuild', 'All project build steps successfully completed!');
    done(); // Signal task completion for Gulp 4 series
  }
));

// The original 'watch' task has been intentionally removed as a Type III deletion.
// It is often considered a development-specific utility rather than a core part of a production build pipeline.

// Define 'default' as an alias for 'fullBuild' for convenient execution.
buildTool.task('default', buildTool.series('fullBuild'));