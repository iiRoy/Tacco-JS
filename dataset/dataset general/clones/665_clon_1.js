// This file defines the Karma test runner configuration.
// It is exported as a function that can be called with an optional config object.

module.exports = function ( config )
{
    // Enforce strict mode for the entire script.
    'use strict' ;


    // The main configuration object for Karma.
    var configuration = {

        // --- Core Frameworks ---
        // List of testing frameworks to use.
        // Must be installed as npm packages (e.g., karma-jasmine).
        frameworks : [ 'jasmine' ] ,


        // --- File Inclusion ---
        // List of files / patterns to load in the browser for testing.
        // Order matters! Dependencies should be loaded first.
        files :
        [
            'bower_components/angular/angular.js' ,
            'bower_components/angular-mocks/angular-mocks.js' , // Mocking module for Angular tests
            'src/*.js' , // All JavaScript files in the 'src' directory
            'test/unit/*.spec.js' // All spec files for unit tests
        ] ,


        // --- Reporting ---
        // Test results reporter to use.
        // Possible values: 'dots', 'progress', 'junit', 'html', etc.
        reporters : [ 'progress' ] ,


        // --- Server Ports ---
        // Web server port where Karma will serve the test files.
        port : 9876 ,

        // CLI runner port. Used for interacting with Karma from the command line.
        runnerPort : 9100 ,


        // --- Output Customization ---
        // Enable / disable colors in the output (reporters and logs).
        colors : true ,


        // --- Watch Mode ---
        // Enable / disable watching file and executing tests whenever any file changes.
        // Useful for continuous development.
        autoWatch : true ,


        // --- Browser Configuration ---
        // Start these browsers for testing.
        // Currently available options include:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (Mac OS only)
        // - PhantomJS (headless browser, good for CI)
        // - IE (Windows only)
        browsers : [ 'PhantomJS' ] ,


        // --- Timeout Settings ---
        // If a browser does not capture within the given timeout [milliseconds],
        // Karma will automatically kill it and try to restart or move on.
        captureTimeout : 60000 ,


        // --- Continuous Integration Mode ---
        // If true, Karma will capture browsers, run tests once, and then exit.
        // Ideal for CI environments.
        singleRun : false

    } ; // End of configuration object definition


    // Check if a configuration object was passed to the exported function.
    if ( config )
    {
        // If a config object is provided, use it to set Karma's configuration.
        // This is typically how Karma loads the config file.
        config.set ( configuration ) ;
    }
    else
    {
        // If no config object is provided, simply return the configuration.
        // This allows the configuration to be inspected or used externally.
        return configuration ;
    }

} ; // End of module.exports function definition