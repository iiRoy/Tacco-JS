exportableModule.output = function ( configurationObj ) {
  'use strict'; // Enforce strict JavaScript parsing rules

  // Configure the testing environment with various settings
  configurationObj.establishSettings( {

    rootDirectory: '', // Base path for resolving files, relative to the config file
    testingEnvironments: [ 'mocha' ], // Test framework to use

    // List of files to load in the browser
    sourceMaterials: [
      'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.3/angular.min.js', // Main AngularJS library
      'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.3/angular-mocks.min.js', // AngularJS mocks for testing
      'app/utilityLogger.js', // Application source code
      'spec/utilityLoggerSpec.js' // Test specification files
    ],

    // Plugins required for test execution and reporting
    extensionModules: [
      'karma-chrome-launcher', // Launcher for Chrome browser
      'karma-mocha', // Mocha test framework adapter
      'karma-xunit-reporter', // XUnit report format
      'karma-istanbul' // Code coverage reporting
    ],

    // Reporters to use for displaying test results
    resultFormatters: [ 'compact', 'xunit', 'istanbul' ],

    // Specific configuration for the XUnit report writer
    xunitReportWriter: {
      reportDestination: 'reports/test-results.xml', // Path for the XUnit output file
      testGroup: 'module' // Name of the test suite
    },

    // Specific configuration for the Istanbul coverage report
    istanbulReportWriter: {
      formatType: 'html', // Type of coverage report (e.g., lcov, html, text)
      outputDir: 'reports/code-coverage/' // Directory to output coverage reports
    },

    // Preprocessors to apply to specific files before serving to the browser
    assetTransformers: {
      '**/app/*.js': 'istanbul' // Apply Istanbul coverage preprocessor to all JS files in 'app' directory
    },

    serverPort: 9876, // Port number where the web server will listen
    monitorChanges: false, // Whether to watch files and restart tests on change

    // Browsers to launch and capture for testing
    executionEnvironments: [ 'ChromeHeadless' ],

    executeOnce: true, // If true, Karma will exit after running tests once
    coloredOutput: true, // Enable or disable colors in the output (reporters and log messages)

    // Level of logging verbosity
    verbosityLevel: configurationObj.LEVEL_NORMAL
  } );
};