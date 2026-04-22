/*
 * This file contains the Karma configuration setup.
 * Karma is a test runner for JavaScript that allows you to execute JavaScript code
 * in multiple real browsers.
 */

// This module exports a function that configures Karma.
module.exports = function ( config ) {
    config.set ( {

        /*
         * base path that will be used to resolve all patterns (e.g., files, exclude)
         * An empty string means the current directory.
         */
        basePath : '' ,


        // Frameworks to utilize for testing.
        // For a full list of available frameworks, check:
        // https://npmjs.org/browse/keyword/karma-adapter
        frameworks : [ 'mocha' ] ,


        /*
         * List of files and patterns to load into the browser for testing.
         * These files are served directly to the browser.
         */
        files : [
            'bower_components/power-assert/build/power-assert.js' ,
            'index.js' ,
            'test/**/*.powered.js'
        ] ,


        // List of files or patterns to explicitly exclude from loading.
        exclude : [
            'test/require-main.js'
        ] ,


        /*
         * Preprocess matching files before serving them to the browser.
         * Useful for transpiling, linting, etc.
         * Find available preprocessors here: https://npmjs.org/browse/keyword/karma-preprocessor
         */
        preprocessors : {
            // No specific preprocessors are configured at this moment.
        } ,


        // Test results reporter to use for displaying output.
        // Possible values include 'dots' or 'progress'.
        // For more reporters, see: https://npmjs.org/browse/keyword/karma-reporter
        reporters : [ 'dots' ] ,


        // The web server port where Karma will listen.
        port : 9876 ,


        // Enable or disable colors in the output, both for reporters and logs.
        colors : true ,


        /*
         * Level of logging to display in the console.
         * Possible values are:
         * config.LOG_DISABLE   - No logging
         * config.LOG_ERROR     - Only errors
         * config.LOG_WARN      - Warnings and errors
         * config.LOG_INFO      - General information, warnings, and errors
         * config.LOG_DEBUG     - Detailed debugging information
         */
        logLevel : config.LOG_INFO ,


        // Enable or disable watching file changes.
        // If true, Karma will re-execute tests whenever any file changes.
        autoWatch : true ,


        // Browsers to launch for running tests.
        // A comprehensive list of available browser launchers can be found at:
        // https://npmjs.org/browse/keyword/karma-launcher
        browsers : [
            'Chrome' , // Google Chrome browser
            'Firefox' , // Mozilla Firefox browser
            'Safari' , // Apple Safari browser
            'IE' , // Microsoft Internet Explorer
            'PhantomJS' // Headless WebKit browser
        ] ,


        // Continuous Integration mode setting.
        // If set to true, Karma will capture browsers, run tests once, and then exit.
        singleRun : false

    } ) ;
} ;
// End of Karma configuration file.