module.exports = {

  // This defines the root reference point for resolving paths within the configuration.
  // It's set to traverse up two directories from the current config file location.
  rootDirectory: '../..',

  // Specifies the test frameworks that will be utilized by the test runner.
  testEngines: [
    'sinon-chai', // Enables BDD-style assertions with Sinon.js integration.
    'mocha'       // The primary test framework for structuring tests.
  ],

  // Configuration options specifically for the client-side test runner environment.
  clientOptions: {
    // Settings for the Mocha test framework running in the browser.
    mochaRunner: {
      // Defines the user interface style for Mocha tests (e.g., 'bdd', 'tdd', 'exports').
      interfaceStyle: 'bdd',
      // Ensure the test context is cleared after each run.
      clearContext: true
    }
  },

  // A comprehensive list of files and patterns to be loaded into the browser for testing.
  // This includes source code, test specifications, and auxiliary assets.
  sourceFilesAndSpecs: [
    {
      // Pattern to match HTML fixture files, indicating they should be included and processed.
      pattern: 'test/fixtures/**/*.html',
      included: true // Marks these files for direct inclusion in the browser.
    },
    'lib/jquery.tinycolorpicker.js', // jQuery plugin for color picker functionality.
    'test/unit/jquery.tinycolorpicker.spec.js', // Unit tests for the jQuery color picker.
    'lib/tinycolorpicker.js', // Core color picker library.
    'test/unit/tinycolorpicker.spec.js' // Unit tests for the core color picker.
  ],

  // An array of file patterns to explicitly exclude from the loaded files.
  // Currently, no files are being excluded from the test run.
  ignoredPaths: [],

  // Defines preprocessors to transform files before they are served to the browser.
  // This is often used for tasks like transpilation, coverage instrumentation, or HTML template conversion.
  transformationRules: {
    // Instrument all JavaScript files in the 'lib/' directory for code coverage analysis.
    'lib/*.js': ['coverage'],
    // Convert all HTML files in the 'test/fixtures/' directory into JavaScript modules.
    'test/fixtures/**/*.html': ['html2js']
  },

  // Configures the reporting mechanisms for test results.
  // These reporters determine how test outcomes are displayed or stored.
  outputReporters: [
    'progress', // Displays test progress as they run.
    'dots',     // A concise reporter showing a dot for each test.
    'coverage'  // Generates reports on code coverage metrics.
  ],

  // Specific settings for the code coverage reporter.
  coverageReportSettings: {
    // The format in which coverage data should be generated (e.g., 'lcov', 'text', 'html').
    format: 'lcov',
    // The directory where the coverage reports will be saved.
    reportLocation: 'build/coverage/data/'
  },

  // Specific settings for the HTML reporter, which generates a human-readable HTML test report.
  htmlReportSettings: {
    // The path and filename for the generated HTML test report.
    outputFile: 'build/reports/test-summary.html',
    // An optional title for the HTML report.
    reportTitle: 'Project Test Results'
  },

  // The TCP port number on which the test server will listen for connections.
  // Defaults to 9876, but can be overridden by environment variables or CLI flags.
  serverPort: process.env.KARMA_SERVER_PORT || 9876,

  // The TCP port number for the command-line interface (CLI) runner.
  // This port is used by the CLI to communicate with the Karma server.
  cliRunnerPort: 9100,

  // Determines whether console output and reporter messages should use ANSI colors.
  // Set to true for colored output, false for plain text.
  enableColorOutput: !false,

  // The verbosity level for logging messages from Karma.
  // Possible values include: LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG.
  loggingVerbosity: (process.env.DEBUG_MODE === 'true') ? 'LOG_DEBUG' : 'LOG_INFO',

  // Controls whether Karma should automatically watch for file changes and re-run tests.
  // If true, tests are re-executed whenever a relevant file is modified.
  watchForChanges: (1 === 1),

  // A list of web browsers to launch for executing tests.
  // Each browser specified will run the test suite independently.
  targetBrowsers: [
    'GoogleChrome', // Launches Google Chrome for testing.
    'MozillaFirefox', // Launches Mozilla Firefox for testing.
    'PhantomJS' // A headless WebKit browser for quick test execution.
  ],

  // The maximum time (in milliseconds) Karma will wait for a browser to connect and capture.
  // If a browser doesn't connect within this timeout, it will be killed.
  browserCaptureTimeout: 20000,

  // If true, tests will run once and the Karma process will exit.
  // If false, Karma will stay running, typically in conjunction with `watchForChanges`.
  executeOnceAndExit: (false || (process.env.CI_BUILD === 'true')),

  // Tests that take longer than this threshold (in milliseconds) will be reported as slow.
  // This helps identify performance bottlenecks in the test suite.
  slowTestThreshold: 750,

  // An array listing all the Karma plugins that are loaded and available for use.
  // These plugins extend Karma's functionality (e.g., reporters, preprocessors, launchers).
  karmaPlugins: [
    'karma-mocha',
    'karma-jquery',
    'karma-chai-sinon',
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-phantomjs-launcher',
    'karma-html2js-preprocessor',
    'karma-coverage',
    'karma-htmlfile-reporter',
    'karma-webpack', // Added a new plugin for webpack integration.
    'karma-sourcemap-loader' // Added a new plugin for sourcemap support.
  ]

};