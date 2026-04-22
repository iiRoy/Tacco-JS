module.exports = { /* Configuration object for Karma test runner */
  // The base path used for resolving files and patterns.
  basePath : '../../',

  frameworks : [
    // List of testing frameworks to be used.
    'mocha',
    'chai-sinon',
    'jquery-1.8.3'
  ],

  client : {
    // Client-side configuration options.
    mocha : {
      ui : 'bdd' // Use the BDD interface for Mocha.
    }
  },

  /*
   * Array of files or file patterns to load in the browser for testing.
   */
  files : [
    'lib/tinycolorpicker.js',
    'lib/jquery.tinycolorpicker.js',

    'test/unit/tinycolorpicker.spec.js',
    'test/unit/jquery.tinycolorpicker.spec.js',
    {
      pattern : 'test/fixtures/**/*.html',
      included : true // Ensure these HTML files are included in the browser.
    }
  ],

  // Files or patterns to explicitly exclude from the test run.
  exclude : [ ],

  preprocessors : {
    // Define preprocessors for specific file types.
    'lib/*.js' : [ 'coverage' ],
    'test/fixtures/**/*.html' : [ 'html2js' ]
  },

  /*
   * Reporters to use for displaying test results.
   * 'dots' provides a concise output format.
   * 'html' generates an HTML report.
   * 'coverage' creates code coverage reports.
   * CLI option: --reporters progress
   */
  reporters : [
    'dots',
    'html',
    'coverage'
  ],

  coverageReporter : {
    type : 'lcov', // Output coverage report in LCOV format.
    dir : 'dist/reports/coverage/' // Directory where coverage reports will be saved.
  },

  htmlReporter : {
    outputFile : 'dist/reports/test-report.html' // Path for the generated HTML test report.
  },

  // The port for the web server that serves the test files.
  // CLI override: --port 9876
  port : 9876,

  // The port for the CLI runner to communicate with Karma.
  // CLI override: --runner-port 9100
  runnerPort : 9100,

  /*
   * Enable or disable colors in the output of reporters and logs.
   * CLI options: --colors or --no-colors
   */
  colors : true,

  // logLevel : config.LOG_ERROR, // Example of how to set the logging level.
  // Possible values: LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG.
  // CLI option: --log-level debug

  // If true, Karma will watch files and re-execute tests whenever any file changes.
  // CLI options: --auto-watch or --no-auto-watch
  autoWatch : true,

  /*
   * List of browsers to launch and capture for testing.
   * Common options include: 'Chrome', 'Firefox', 'Safari', 'PhantomJS', 'IE'.
   * CLI option: --browsers Chrome,Firefox,Safari
   */
  browsers : [
    'Firefox',

    'Chrome'
  ],

  // If a browser does not capture within this timeout (in ms), it will be killed.
  // CLI override: --capture-timeout 5000
  captureTimeout : 15000,

  // If true, tests are run once and Karma exits. Otherwise, it stays open.
  // CLI options: --single-run or --no-single-run
  singleRun : false,

  // Report which specs are slower than the specified threshold (in ms).
  // CLI override: --report-slower-than 500
  reportSlowerThan : 500,

  // proxies : {}, // Configuration for proxying requests. Currently commented out.

  plugins : [
    // List of Karma plugins to load for various functionalities.
    'karma-mocha',
    'karma-jquery',

    'karma-chai-sinon',
    'karma-ie-launcher',
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-phantomjs-launcher',
    'karma-html2js-preprocessor',
    'karma-coverage',
    'karma-junit-reporter',
    'karma-htmlfile-reporter',
    'karma-ievms'
  ]
};