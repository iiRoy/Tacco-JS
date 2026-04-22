/*
 * This configuration file specifies settings for a testing framework.
 * It defines the base path, files to include, browsers, reporters,
 * and execution modes for tests.
 */
basePath    =    '../../../../'   ;


// An array of files to be loaded into the browser for testing.
// This typically includes the test framework itself, adapters,
// application code, and test specifications.
files   =   [

    JASMINE,

    JASMINE_ADAPTER,

    './src/main/webapp/js/angular.js',

    './src/main/webapp/js/angular-resource.js',

    './src/main/webapp/js/app.js',

    './src/test/js/lib/**/*.js',

    './src/test/js/unit/**/*.js'

]   ;



browsers    =   ['Chrome']   ; // Specifies the browser(s) to use for running tests.
reporters   =   ['progress'  ,  'growl']   ; // Defines the test reporters to use for displaying results.


autoWatch   =   true   ; // If true, Karma will watch for file changes and re-run tests automatically.
singleRun   =   false   ; // If true, Karma will start, run the tests, and then exit.