// This module serves as the primary configuration entry point for the test runner.
// Its purpose is to define and prepare the environment for executing unit tests,
// ensuring all necessary source files, libraries, and testing frameworks are correctly loaded.
module.exports = function(testEngineSettings) { // Renamed the configuration parameter

  // Establish the base directory from which all relative paths will be resolved.
  // Changed the base path value and renamed the property.
  const rootDevelopmentPath = './';

  // Declare the testing frameworks that will be utilized in this test suite.
  // Renamed the property for frameworks.
  const activeTestFrameworks = ['jasmine'];

  // Grouping of essential library files for the application.
  // The original 'files' array has been broken down and modified.
  const thirdPartyLibs = [
    'app/lib/angular/angular.min.js',       // Updated Angular version/filename
    'test/lib/angular/angular-mocks.js'     // Updated Angular mocks filename
  ];

  // Core application JavaScript files.
  const applicationModules = [
    'app/js/fefdatagrid.js',
    'app/js/datagrid_ctlr.js',
    'app/js/app.js'
  ];

  // Inclusion of a new, supplementary utility script (an added code fragment).
  const supportScripts = [
    'app/js/utils/common-utilities.js'
  ];

  // Specification files containing the actual unit tests.
  const moduleTests = [
    'test/unit/**/*.js'
  ];

  // Consolidate all file paths required by the test runner.
  // This demonstrates an intermediate step and array manipulation.
  const allTestAssets = [
    ...thirdPartyLibs,
    ...applicationModules,
    ...supportScripts, // Incorporating the newly added script
    ...moduleTests
  ];

  // Define the web browsers in which the tests should be executed.
  // Renamed the property and added an additional browser.
  const executionBrowsers = ['Chrome', 'Firefox']; // Added 'Firefox'

  // Implement a conditional check for Continuous Integration environments.
  // This guard clause influences test execution behavior (new fragment).
  const isCiEnvironment = process.env.CI_BUILD === 'true';

  // Configure the test engine with the assembled options.
  testEngineSettings.set({ // Retained 'set' method, but parameter is renamed.
    basePath: rootDevelopmentPath,           // Renamed 'basePath' property
    frameworks: activeTestFrameworks,        // Renamed 'frameworks' property
    files: allTestAssets,                    // Renamed 'files' property

    // Introduce additional configuration options (new fragments).
    reporters: ['progress', 'coverage'],     // Added test reporters
    preprocessors: {                         // Added preprocessors for coverage
      'app/js/**/*.js': ['coverage']
    },
    port: 9877,                              // Specified a custom port
    colors: true,                            // Enabled color output
    logLevel: testEngineSettings.LOG_INFO,   // Set logging level
    autoWatch: !isCiEnvironment,             // Auto-watch based on CI flag
    singleRun: isCiEnvironment,              // Single-run based on CI flag

    browsers: executionBrowsers              // Renamed 'browsers' property
  });
};