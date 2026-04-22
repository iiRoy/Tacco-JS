// This file exports a function that configures Karma.
module.exports = function ( config ) {

    // Enforce strict JavaScript mode for this configuration file.
    'use strict';

    // Call the 'set' method on the provided config object to define Karma's behavior.
    config.set( {

        // The base path for resolving files, typically the root of the project.
        basePath: '',

        // Frameworks to be used by Karma (e.g., Jasmine, Mocha).
        frameworks: [
            'jasmine' // We are using Jasmine for our tests.
        ],


        // List of files to be loaded into the browser.
        // These include libraries, source code, and test files.
        files: [
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.3/angular.js',       // AngularJS core library.
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.3/angular-mocks.js', // AngularJS mocks for testing.
            'src/logItDown.js',                                                       // Our application's source code.
            'test/logItDownSpec.js'                                                   // Our test specifications for the application.
        ],


        // Plugins required for Karma to function correctly with specific reporters/browsers.
        plugins: [
            'karma-phantomjs-launcher', // Launcher for the PhantomJS headless browser.
            'karma-jasmine',            // Adapter for Jasmine testing framework.
            'karma-junit-reporter',     // Reporter for generating JUnit XML test results.
            'karma-coverage'            // Plugin for generating code coverage reports.
        ],

        // Reporters to use for displaying test results and coverage.
        reporters: [
            'progress', // Shows progress of tests in the console.
            'junit',    // Generates JUnit XML report.
            'coverage'  // Generates code coverage report.
        ],


        // Configuration for the JUnit reporter.
        junitReporter: {
            outputFile: 'log/karma-results.xml', // Path to save the JUnit XML report.
            suite: 'unit'                        // Name of the test suite in the report.
        },


        // Configuration for the coverage reporter.
        coverageReporter: {
            type: 'lcov',               // Type of coverage report (e.g., lcov, html, text-summary).
            dir: 'log/coverage/'        // Directory where coverage reports will be saved.
        },


        // Preprocessors to apply to files before serving them to the browser.
        preprocessors: {
            // Apply 'coverage' preprocessor to all JavaScript files in the 'src' directory.
            '**/src/*.js': 'coverage'
        },

        // The port where the web server will listen.
        port: 9876,

        // Whether Karma should watch for file changes and re-run tests.
        autoWatch: false, // Set to false for single-run environments like CI.

        // List of browsers to launch and capture.
        browsers: [
            'PhantomJS' // Using PhantomJS for headless testing.
        ],

        // If true, Karma will run tests once and exit.
        singleRun: true,

        // Enable or disable colors in the output (e.g., for terminal readability).
        colors: true,

        // Level of logging to display in the console.
        logLevel: config.LOG_INFO // Display informational messages.
    } );
};