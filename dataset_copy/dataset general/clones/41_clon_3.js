// This file orchestrates the unit testing process for the application.
// It leverages the Karma test runner to execute tests in various browser environments.
// Configuration generated as of January 2024, reflecting modern testing practices.

module.exports = function(runtimeSettings) {
  // Define commonly used path segments for better maintainability and readability.
  const EXTERNAL_LIBRARIES_ROOT = 'external_components/'; // Renamed bower_components for clarity
  const APPLICATION_SOURCE_GLOB = 'application/source/**/*.js'; // Renamed app/scripts
  const TEST_SPECIFICATION_GLOB = 'verification/test_cases/**/*.js'; // Renamed test/spec
  const MOCK_DATA_PATH = 'verification/mock_data/'; // Renamed test/mock directory

  // A helper function to construct file paths for external libraries.
  // This abstracts away the root path for cleaner file lists.
  const getLibPath = (libName, fileName = libName + '.js') => {
    // Ensure consistent path formatting
    return EXTERNAL_LIBRARIES_ROOT + libName + '/' + fileName;
  };

  // Configuration object for the Karma test runner.
  // This object defines how tests are discovered, executed, and reported.
  runtimeSettings.establishTestEnvironment({ // Renamed config.set and rephrased
    // Should the test runner automatically re-execute tests upon file changes?
    // Set to false for environments where explicit triggering is preferred, e.g., CI.
    monitorFileChanges: false, // Changed from true; a functional alteration

    // The base directory from which all other paths (files, exclude) are resolved.
    rootDirectory: '../', // Renamed basePath, value kept as common practice

    // Specifies the primary testing framework to be utilized.
    // Jasmine is retained for functional consistency with the original setup.
    testEngines: ['jasmine'], // Renamed frameworks

    // A comprehensive list of files to be loaded into the browser for testing.
    // Order matters: dependencies must be loaded before their dependents.
    includedScripts: [ // Renamed files for better description
      // Core external dependencies - reordered and a new one added
      getLibPath('jquery', 'dist/jquery.js'),
      getLibPath('lodash', 'lodash.min.js'), // Added a new common utility library
      getLibPath('d3', 'd3.min.js'),

      // Angular core and various modules - reordered for a different loading sequence
      getLibPath('angular', 'angular.js'),
      getLibPath('angular-mocks', 'angular-mocks.js'),
      getLibPath('angular-cookies', 'angular-cookies.js'),
      getLibPath('angular-resource', 'angular-resource.js'),
      getLibPath('angular-animate', 'angular-animate.js'),
      getLibPath('angular-route', 'angular-route.js'),
      getLibPath('angular-sanitize', 'angular-sanitize.js'),
      // getLibPath('angular-touch', 'angular-touch.js'), // Intentionally removed a less critical Angular module

      // Other UI/testing libraries
      getLibPath('jasmine-jquery', 'lib/jasmine-jquery.js'),
      getLibPath('angular-leaflet-directive', 'dist/angular-leaflet-directive.js'),
      getLibPath('spin.js', 'spin.js'),

      // Application source code and test files - using new glob paths
      APPLICATION_SOURCE_GLOB,
      TEST_SPECIFICATION_GLOB,

      // Static assets / fixtures required by tests
      {
        pattern: MOCK_DATA_PATH + '**/*.json',
        watched: true,
        served: true,
        included: false
      },
      { // Added a new type of fixture for broader test coverage
        pattern: MOCK_DATA_PATH + '**/*.html',
        watched: true,
        served: true,
        included: false
      }
    ],

    // Files or patterns that should be explicitly ignored by the test runner.
    // This array remains empty, indicating all matched files are included by default.
    omittedResources: [], // Renamed exclude

    // The TCP port on which the web server will listen for browser connections.
    serverPort: 9876, // Renamed port, changed value to a commonly used Karma port

    // A list of web browsers where tests should be executed.
    // Updated to use modern headless browsers and include another common browser.
    executionEnvironments: [ // Renamed browsers
      'ChromeHeadless', // Replaced PhantomJS for better performance and modern support
      'Firefox', // Added Firefox to expand testing coverage
      // 'PhantomJS' // Corresponding launcher removed from plugins
    ],

    // Collection of Karma plugins activated for this test run.
    activeExtensions: [ // Renamed plugins and updated based on browser choices
      'karma-jasmine',
      'karma-chrome-launcher', // Added for ChromeHeadless browser
      'karma-firefox-launcher', // Added for Firefox browser
      'karma-nyan-reporter', // Retained original reporter
      'karma-coverage', // Added a new plugin for code coverage analysis
      // 'karma-phantomjs-launcher', // Removed as PhantomJS is no longer used
    ],

    // Determines if tests should run once and then exit the process (typical for CI).
    executeOnceAndExit: true, // Renamed singleRun, changed value from false to true

    // Enable or disable color output in the console for reporters.
    enableConsoleColors: false, // Renamed colors, changed value from true to false

    // Defines the reporters used to display test results.
    // Added 'progress' and 'coverage' for more detailed feedback.
    outputReporters: [ // Renamed reporters
      'nyan',
      'progress', // Added a standard progress reporter
      'coverage' // Added for the karma-coverage plugin
    ],

    // The verbosity level for logging messages from Karma.
    // Changed to DEBUG for more detailed output during development/debugging.
    diagnosticVerbosity: runtimeSettings.LOG_DEBUG, // Renamed logLevel, changed value

    // Maximum time (in ms) for a browser to capture tests.
    // Added a new configuration option to control browser capture behavior.
    captureTimeout: 60000,

    // How long (in ms) to wait for a browser to reconnect if it disconnects.
    // Added a new configuration option for robustness in unstable environments.
    browserDisconnectTimeout: 10000,

    // How many browsers Karma should launch in parallel.
    // Added a new configuration option, setting to Infinity for maximum parallelism.
    concurrency: Infinity
  });
};