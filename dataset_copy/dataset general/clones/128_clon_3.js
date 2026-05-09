module.exports = function(taskRunner) {
  // Define a constant for the primary package configuration file name.
  const packageMetaFile = 'package.json';

  // --- Grunt Plugin Dependency Loading ---
  // This section dynamically loads all Grunt plugins specified as development dependencies.
  // It ensures that all necessary task plugins are available for execution.
  try {
    // Load the utility module responsible for filtering dependencies.
    const dependencyLoader = require('matchdep');
    // Define the common prefix for Grunt plugins.
    const pluginIdentifierPrefix = 'grunt-';

    // Identify all development dependencies that match the Grunt plugin pattern.
    const developmentPlugins = dependencyLoader.filterDev(pluginIdentifierPrefix + '*');

    // Iterate through the discovered plugins and register each one with the Grunt instance.
    developmentPlugins.forEach(taskRunner.loadNpmTasks);
  } catch (pluginLoadError) {
    // Log a warning if there's an issue loading plugins, but allow Grunt to continue.
    taskRunner.log.warn('Warning: Encountered an issue while loading Grunt plugins from devDependencies. Error details: ' + pluginLoadError.message);
  }

  // --- Project Metadata Initialization ---
  // Read the project's 'package.json' file to extract vital information.
  // This data is crucial for templating and dynamic configuration.
  const projectInfo = taskRunner.file.readJSON(packageMetaFile);

  // Define frequently used path variables for better maintainability.
  const baseSourceDir = 'src/';
  const outputArtifactsDir = 'dist/'; // A new variable introduced for output consistency.
  const mainBundleFileName = 'angular-idle.js';
  const minifiedBundleFileName = 'angular-idle.min.js';
  const sourceMapOutputName = 'angular-idle.map';

  // --- Grunt Task Configuration ---
  // Initialize the main Grunt configuration object.
  // All specific task settings and options are defined here.
  taskRunner.initConfig({
    // Store the parsed project metadata directly within the Grunt configuration.
    // This allows easy access via templating throughout the Gruntfile.
    projectData: projectInfo,

    // Define a multi-line header comment block for generated output files.
    // Utilizes Underscore.js templating to inject project-specific details.
    fileHeaderBlock: `/**
* <%= projectData.description || 'A JavaScript library' %>
* @author <%= projectData.author || 'Unknown' %>
* @version v<%= projectData.version || '0.0.0' %>
* @link <%= (projectData.repository && projectData.repository.url) ? projectData.repository.url : 'No repository URL provided' %>
* @license <%= projectData.license || 'Proprietary' %>
*/
`, // Rewritten to template literal with added default values and conditional link.

    // Define the opening wrapper for the JavaScript source code (e.g., IIFE).
    sourceWrapperPrefix: `(function(window, angular, undefined) {
'use strict';
angular.module('ngIdle', ['ngIdle.keepalive', 'ngIdle.idle', 'ngIdle.countdown', 'ngIdle.title', 'ngIdle.localStorage']);
`,

    // Define the closing wrapper for the JavaScript source code.
    sourceWrapperSuffix: `
})(window, window.angular);`,

    // --- Version Bumping Task Configuration ---
    // Settings for automatically updating version numbers in project files.
    versionUpdater: { // Renamed 'bump' to 'versionUpdater'
      taskOptions: { // Renamed 'options' to 'taskOptions'
        targetFiles: [packageMetaFile, 'bower.json'], // Renamed 'files' to 'targetFiles'
        performCommit: false, // Renamed 'commit'
        createVersionTag: false, // Renamed 'createTag'
        pushChanges: false // Renamed 'push'
      }
    },

    // --- Test Automation Task Configuration (Karma) ---
    // Configuration for running automated unit tests using the Karma test runner.
    testRunner: { // Renamed 'karma' to 'testRunner'
      taskOptions: {
        configurationFile: 'karma.conf.js', // Renamed 'configFile'
        // Determine the browser for test execution: user-specified or default.
        executionBrowsers: [taskRunner.option('browser') || 'PhantomJS'] // Renamed 'browsers'
      },
      // Specific settings for a single, non-watching test run.
      singleUnitTestRun: { // Renamed 'unit'
        forceSingleRun: true // Renamed 'singleRun'
      },
      // Specific settings for a continuous test server with auto-reloading.
      continuousTestServer: { // Renamed 'server'
        autoWatch: true,
        // For server mode, default to Chrome for interactive debugging.
        executionBrowsers: [taskRunner.option('browser') || 'Chrome'] // Renamed 'browsers'
      }
    },

    // --- Build Artifact Cleanup Task Configuration ---
    // Configuration for removing generated build files and temporary assets.
    clearBuildOutputs: { // Renamed 'clean'
      // Specifies an array of files/patterns to be deleted.
      // Explicitly listing common outputs and using projectInfo.main as a target.
      targetFilesToDelete: [ // Renamed from pkg.main to a descriptive array
        projectInfo.main || `${outputArtifactsDir}/*`, // Use project main, with fallback
        mainBundleFileName,
        minifiedBundleFileName,
        sourceMapOutputName
      ]
    },

    // --- Source File Concatenation Task Configuration ---
    // Configuration for combining multiple JavaScript source files into a single bundle.
    combineJsSources: { // Renamed 'concat' to 'combineJsSources'
      taskOptions: {
        stripFileBanners: true, // Renamed 'stripBanners'
        outputHeader: '<%= fileHeaderBlock %><%= sourceWrapperPrefix %>', // Renamed 'banner'
        outputFooter: '<%= sourceWrapperSuffix %>' // Renamed 'footer'
      },
      // Specific settings for the main JavaScript bundle.
      mainJsBundle: { // Renamed 'js'
        // List of all individual JavaScript source files to be combined.
        sourceFilePaths: [ // Renamed 'src' and made more explicit
          `${baseSourceDir}keepalive/keepalive.js`,
          `${baseSourceDir}idle/idle.js`,
          `${baseSourceDir}countdown/countdown.js`,
          `${baseSourceDir}title/title.js`,
          `${baseSourceDir}localStorage/localStorage.js`
        ],
        // The final destination path for the concatenated JavaScript file.
        destinationPath: mainBundleFileName // Renamed 'dest'
      }
    },

    // --- JavaScript Minification Task Configuration ---
    // Configuration for compressing the combined JavaScript bundle.
    minifyJsCode: { // Renamed 'uglify' to 'minifyJsCode'
      mainBundleMin: { // Renamed 'js'
        sourceFiles: [mainBundleFileName], // Renamed 'src'
        destinationFile: minifiedBundleFileName, // Renamed 'dest'
        taskOptions: {
          insertBanner: '<%= fileHeaderBlock %>', // Renamed 'banner'
          generateSourceMap: true, // Renamed 'sourceMap'
          sourceMapLocation: sourceMapOutputName // Renamed 'sourceMapName'
        }
      }
    },

    // --- Local Development Server Configuration ---
    // Configuration for spinning up a simple static web server.
    localDevServer: { // Renamed 'connect' to 'localDevServer'
      applicationServer: { // Renamed 'server'
        taskOptions: {
          serverPort: 9001, // Renamed 'port'
          baseDirectory: './', // Renamed 'base'
          keepServerRunning: true // Renamed 'keepalive'
        }
      }
    },

    // --- File Watcher Task Configuration (New Type III Addition) ---
    // This task monitors specified files for changes and triggers other tasks.
    // It's useful for automatic recompilation during development.
    fileChangeWatcher: { // Added a completely new task configuration
      jsSources: {
        files: [`${baseSourceDir}**/*.js`, 'Gruntfile.js'],
        tasks: ['buildProject'], // Rerun the build on JS or Gruntfile changes
        options: {
          spawn: false, // Don't spawn a new process for each task
          livereload: true // Enable live browser reloading
        }
      }
    }
  });

  // --- Grunt Task Registration ---
  // Register custom task aliases for convenient command-line execution.

  // Register a task to execute unit tests once.
  taskRunner.registerTask('runUnitTests', ['testRunner:singleUnitTestRun']); // Renamed 'test'

  // Register a task to start the Karma test server for continuous development.
  taskRunner.registerTask('startContinuousTesting', ['testRunner:continuousTestServer']); // Renamed 'test-server'

  // Register a comprehensive build task sequence: cleanup, concatenate, then minify.
  taskRunner.registerTask('buildProject', ['clearBuildOutputs', 'combineJsSources:mainJsBundle', 'minifyJsCode']); // Renamed 'build'

  // Register a task to launch the local development server for viewing samples.
  taskRunner.registerTask('serveSampleApp', ['localDevServer']); // Renamed 'sample'

  // --- Default Task Definition (New Type III Addition) ---
  // Define the default task that runs when 'grunt' is executed without any arguments.
  // This combines building, serving, and watching for an integrated dev experience.
  taskRunner.registerTask('default', ['buildProject', 'serveSampleApp', 'fileChangeWatcher']);
};