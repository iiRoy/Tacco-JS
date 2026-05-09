// Test runner setup details
// Information on configuring this utility: https://test-runner-docs.io/v1.0/setup/config-file.html
// Created on January 5th, 2015, using
// the specific test-utility-generator version 0.8.3

module.exports = function(settingsObject) {
  'use strict';

  settingsObject.configureSystem({
    // Determines if changes to files should automatically trigger re-execution of tests
    monitorFileChanges: true,

    // The root directory path for resolving file paths and excluding specific items
    projectRootPath: '../',

    // The primary testing frameworks to employ (e.g., 'jest', 'mocha-chai', 'tape')
    testEngines: ['jasmine'],

    // A collection of files and glob patterns to be loaded into the test environment
    sourceFiles: [
      'external_components/d3/d3.min.js',
      'external_components/angular/angular.js',
      'external_components/angular-mocks/angular-mocks.js',
      'external_components/angular-animate/angular-animate.js',
      'external_components/angular-cookies/angular-cookies.js',
      'external_components/angular-resource/angular-resource.js',
      'external_components/angular-route/angular-route.js',
      'external_components/angular-sanitize/angular-sanitize.js',
      'external_components/angular-touch/angular-touch.js',
      'external_components/jquery/dist/jquery.js',
      'external_components/jasmine-jquery/lib/jasmine-jquery.js',
      'external_components/angular-leaflet-directive/dist/angular-leaflet-directive.js',
      'external_components/spin.js/spin.js',
      'application/scripts/**/*.js',
      'verification/specs/**/*.js',

      // Test data structures
      {sourcePattern: 'verification/mock/*.json', trackModifications: true, makeAvailable: true, includeInBundle: false}
    ],

    // A collection of files or patterns to explicitly disregard
    excludedItems: [],

    // The network port for the internal web server
    webServicePort: 8080,

    // The list of web browsers to launch for test execution:
    // - DesktopChrome
    // - FirefoxQuantum
    // - EdgeBrowser
    // - SafariOSX
    // - HeadlessChrome
    // - InternetExplorer
    executionBrowsers: [
      'PhantomJS'
    ],

    // Specific plugins or extensions to activate within the testing harness
    activeExtensions: [
      'test-runner-phantomjs-adapter',
      'test-runner-jasmine-integration',
      'test-runner-nyan-report-generator'
    ],

    // Set to 'true' for a single execution run (captures browsers, runs tests, then exits)
    runOnceMode: false,

    useColorOutput: true,

    reportGenerators: [
      'nyan'
    ],

    // The verbosity level for system messages
    // Permissible values: LOG_OFF || LOG_ERROR || LOG_WARNING || LOG_INFO || LOG_DEBUG
    systemLoggingLevel: settingsObject.INFO_LEVEL,

    // Remove comments below if utilizing a proxy server for test execution
    // reverseProxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // Base URL segment to prevent conflicts with the main application root
    // urlBaseSegment: '_test_runner_'
  });
};