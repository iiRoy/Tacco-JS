// Karma configuration
// This file defines the configuration for the Karma test runner.

// base path, that will be used to resolve files and exclude
// The base path is used to resolve all relative paths in the configuration.
basePath= '';


// list of files / patterns to load in the browser
// These files will be loaded into the browser environment for testing.
files= [
  JASMINE,
  JASMINE_ADAPTER,
  'jasper.engine.js',
  'jasper.asks.js',
  'test/jasmine/**/*.spec.js'
];


// preprocessors configuration
preprocessors= {
  'jasper*.*.js': 'coverage' // Enable code coverage for Jasper files.
};


// list of files to exclude from the test run
exclude =   []; // No files are explicitly excluded in this configuration.


// test results reporter to use
// possible values: dots || progress || growl
reporters= [
  'progress', // Shows progress of tests.
  'coverage'  // Generates code coverage reports.
];


// Coverage reporter configuration
coverageReporter  =   {
  type  : 'lcov', // Output type for coverage data (LCOV format).
  dir   : 'coverage/' // Directory where coverage reports will be saved.
};


// web server port where Karma will listen
port  = 8080;


// cli runner port
runnerPort  = 9100; // Port for the command-line interface runner.


// enable / disable colors in the output (reporters and logs)
colors  = true; // Output will be colored for better readability.


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel  = LOG_INFO; // Log informational messages and above.


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true; // Karma will re-run tests automatically on file changes.


// Start these browsers, currently available:
//  - Chrome
//  - ChromeCanary
//  - Firefox
//  - Opera
//  - Safari (only Mac)
//  - PhantomJS (headless browser)
//  - IE (only Windows)
browsers  = [
  'PhantomJS' // Using PhantomJS for headless testing.
];


// If browser does not capture in given timeout [ms], kill it
captureTimeout  = 5000; // Timeout for browser capture in milliseconds.


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = true; // Run tests once and then exit Karma.