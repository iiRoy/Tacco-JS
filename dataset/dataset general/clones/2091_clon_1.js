/*
 * Karma Test Runner Configuration File
 *
 * This file was generated automatically.
 * Original generation date: May 21, 2014, 09:55:50 CEST
 */

module.exports = function ( config ) {

    // Configure Karma settings
    config.set( {
        // Base path that will be used to resolve all patterns (e.g. files, exclude)
        basePath      :   ''  ,


        /* Frameworks to use */
        // Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks    :   [ "ng-scenario" ]  ,


        // List of files / patterns to load in the browser
        files         :   [
                "angular-bootstrap-checkbox.js" ,  // Main application file
                "app.js"                        ,  // Application logic
                "test.js"                       ,  // Test specifications
                "index.html"                      // HTML template
        ] ,


        // List of files to exclude
        exclude       :   [ ]  ,


        // Preprocess matching files before serving them to the browser
        // Available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors :   { }  ,


        // Test results reporter to use
        // Possible values: 'dots', 'progress'
        // Available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters     :   [ 'progress' ]  ,


        // Web server port
        port          :   8001  ,


        // Enable / disable colors in the output (reporters and logs)
        colors        :   true  ,


        // Level of logging
        // Possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel      :   config.LOG_INFO  ,


        // Enable / disable watching file and executing tests whenever any file changes
        autoWatch     :   true  ,


        /*
         * Start these browsers
         * Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
         */
        browsers      :   [ "Chrome" ]  , // Using only Chrome for now


        // Continuous Integration mode
        // If true, Karma captures browsers, runs the tests and exits
        singleRun     :   false  ,


        // Configure proxy settings for the test environment
        proxies       :   {
            "/" : "http://localhost:8000/"  // Proxy requests to the development server
        }
    } ) ;
} ;