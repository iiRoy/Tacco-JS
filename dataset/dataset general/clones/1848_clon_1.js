/*
 * Karma configuration file.
 * Automatically generated on Fri Apr 12 2013 14:54:43 GMT-0400 (EDT)
 * This file defines the testing environment for the project.
 */


//  The base path, this will be used to resolve file paths and patterns for exclusion.
basePath     =    '../'   ;


//  A list of all files / patterns to be loaded into the browser for testing.
files    =
[
    JASMINE, // The Jasmine testing framework itself.
    JASMINE_ADAPTER, // Adapter to integrate Jasmine with Karma.
    'test/lib/angular/angular.js', // Core Angular.js library.
    'test/lib/angular/angular-*.js', // Other Angular modules (e.g., angular-resource.js).
    'test/lib/angular/angular-mocks.js', // Angular mocks for testing.
    'angular-slugify.js' , // The main application source file under test.
    'test/unit/*Spec.js' // All unit test specification files.
]    ;


//  A list of files or patterns to exclude from the test suite.
exclude  =
[
    'test/karma.conf.js' /* This configuration file itself should not be loaded. */
]    ;


//  The test results reporter to employ.
//  Possible values include: 'dots', 'progress', 'junit', 'html', etc.
reporters      =    ['progress']    ;


//  The TCP port on which the web server will listen.
port      =    9876    ;


//  The port for the CLI (Command Line Interface) runner.
runnerPort      =    9100    ;


//  Enable or disable colors in the console output (for reporters and logs).
colors      =    true    ;


/*
 *  The level of logging detail.
 *  Possible values are:
 *  LOG_DISABLE (no logging),
 *  LOG_ERROR (only errors),
 *  LOG_WARN (warnings and errors),
 *  LOG_INFO (general information, warnings, and errors),
 *  LOG_DEBUG (all possible debugging information).
 */
logLevel      =    LOG_INFO    ;


//  Enable or disable automatic file watching.
//  If true, tests will be re-executed whenever any monitored file changes.
autoWatch      =    true    ;


//  Specify which browsers Karma should launch and use for testing.
//  Currently supported browsers include:
//  - Chrome (Google Chrome)
//  - ChromeCanary (Chrome's bleeding-edge release)
//  - Firefox (Mozilla Firefox)
//  - Opera (Opera Browser)
//  - Safari (Apple Safari, primarily on macOS)
//  - PhantomJS (A headless WebKit scriptable with JavaScript)
//  - IE (Microsoft Internet Explorer, on Windows platforms)
browsers      =    ['Chrome']    ;


//  If a browser fails to capture within the specified timeout [in milliseconds], it will be killed.
captureTimeout      =    60000    ;


//  Continuous Integration mode settings.
//  If set to true, Karma will launch browsers, run tests once, and then exit.
singleRun      =    false    ;