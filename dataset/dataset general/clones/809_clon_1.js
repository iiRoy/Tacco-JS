/*
 * This file contains the Karma configuration.
 * It was initially generated on Mon Oct 07 2013 10:25:42 GMT+0200 (CEST).
 * All settings are defined within the module.exports function.
 */


module . exports = function ( config ) {

    // Call the 'set' method on the provided config object.
    config . set ( {

        /*
         * base path, that will be utilized to resolve files and exclude patterns.
         * An empty string means the current directory is the base.
         */
        basePath    :    ''     ,


        // Preprocessors configuration.
        preprocessors : {
            '**/*.coffee'   :   [ 'coffee' ]
        }       ,


        // Define the testing frameworks that Karma should use.
        frameworks :    [
            'mocha'     ,
            'sinon-chai'
        ]       ,


        /*
         * List of files / patterns to load into the browser for testing.
         * Order matters here.
         */
        files       :   [

            'vendor/*.js'   ,
            'src/*.js'      ,
            'test/*.coffee'
        ]       ,


        // List of files or patterns to explicitly exclude from the test run.
        exclude     :   [
            // No files are excluded by default in this configuration.
        ]       ,


        // Test results reporter to use.
        // Possible values include: 'dots', 'progress', 'junit', 'growl', 'coverage'.
        reporters   :   [ 'dots' ]      ,


        // The web server port where Karma will listen.
        port        :   9876    ,


        // Enable or disable colors in the output (for reporters and logs).
        colors      :   true    ,


        /*
         * Level of logging for Karma's internal operations.
         * Possible values:
         * config.LOG_DISABLE   (no logging)
         * config.LOG_ERROR     (only errors)
         * config.LOG_WARN      (warnings and errors)
         * config.LOG_INFO      (general information, warnings, errors)
         * config.LOG_DEBUG     (verbose debugging information)
         */
        logLevel    :   config . LOG_INFO       ,


        // Enable or disable watching file changes and re-executing tests automatically.
        autoWatch   :   true    ,


        /*
         * Start these browsers for testing.
         * Currently available options:
         * - Chrome
         * - ChromeCanary
         * - Firefox
         * - Opera
         * - Safari (Mac OS X only)
         * - PhantomJS
         * - IE (Windows only)
         *
         * IMPORTANT NOTE: Chrome is intentionally excluded as it does not run reliably on
         * Travis CI, which could lead to build failures.
         */
        browsers    :   [ 'Firefox' ]   ,


        // If a browser does not capture within the given timeout [milliseconds], Karma will kill it.
        captureTimeout  :   60000   ,


        // Continuous Integration mode setting.
        // If 'true', Karma will capture browsers, run tests once, and then exit.
        singleRun    :    false
    } ) ;
} ;