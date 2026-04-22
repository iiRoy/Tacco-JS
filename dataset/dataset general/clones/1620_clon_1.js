/*
 * Karma Configuration File
 *
 * This configuration was originally generated on a specific date in June 2013.
 * Changes below reflect purely cosmetic modifications (whitespace, comments)
 * to demonstrate Type-I code cloning, maintaining exact functional equivalence.
 */


// Defines the base path for resolving files and patterns.
// This path is relative to the location of this configuration file.
basePath     = '';


// This section lists all the files and patterns that Karma should load
// into the browser for testing.
// It includes test frameworks, external libraries, application source,
// and test specifications.
files        = [
    JASMINE, // The Jasmine testing framework itself.
    JASMINE_ADAPTER, // Adapter for Jasmine to work with Karma.

    // External libraries loaded from CDNs.
    'https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js',
    'http://code.angularjs.org/1.1.5/angular.min.js',
    'http://code.angularjs.org/1.1.5/angular-mocks.js',

    // Our own application source files.
    'src/**/*.js',

    // All test specification files.
    'test/**/*Spec.js'
];


// This array specifies files or patterns that should be explicitly
// excluded from the loading process, even if they match patterns in 'files'.
exclude      = [
    // No files are explicitly excluded in this configuration.
];


// The test results reporter to be used.
// Possible options include: 'dots', 'progress', 'junit', 'html', etc.
// 'progress' shows a simple progress bar and test counts.
reporters    = [ 'progress' ];


// The port number on which the Karma web server will listen.
port         = 9876;


// The port for the CLI runner, used for communication between the
// Karma server and the command-line interface.
runnerPort   = 9100;


// A boolean flag to enable or disable colored output in the console
// for reporters and logs.
colors       = true;


// Sets the level of logging detail that Karma will output.
// Options range from least to most verbose:
// LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG
logLevel     = LOG_INFO;


// When set to true, Karma will watch for changes in the specified files
// and automatically re-execute tests whenever a change is detected.
autoWatch    = true;


// An array specifying which browsers Karma should launch and use for testing.
// Common options include: 'Chrome', 'Firefox', 'PhantomJS', 'Safari', 'IE'.
// PhantomJS is a headless browser, useful for CI environments.
browsers     = [ 'PhantomJS' ];


// The maximum time (in milliseconds) a browser is allowed to remain
// disconnected before Karma considers it as captured and kills it.
captureTimeout = 60000;


// Continuous Integration mode setting.
// If 'true', Karma will launch browsers, run tests once, and then exit.
// If 'false', Karma will stay running, waiting for file changes.
singleRun    = false;