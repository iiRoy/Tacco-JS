/*
 * This is the Karma test runner configuration file.
 * It was initially generated a long time ago, specifically on:
 * Sunday, February 15, 2015, at 8:00:22 PM PST.
 * All settings defined here are crucial for the testing environment.
 */
module . exports = function ( config )
{
    config . set(
            {

                // Defines the base path for resolving all file patterns (e.g., source files, test files, excluded files).
                // An empty string signifies the directory where the karma.conf.js file itself resides.
                basePath : ''
                ,


                // The list of testing frameworks that Karma should utilize.
                // For a comprehensive list of available frameworks, refer to:
                // https://npmjs.org/browse/keyword/karma-adapter
                frameworks : [ 'mocha' , 'chai' ]
                ,


                // This array specifies the files and file patterns that Karma will load
                // into the browser environment before running any tests.
                // Order matters for some dependencies.
                files :
                        [
                            'bower_components/angular/angular.min.js'
                            ,
                            'bower_components/angular-mocks/angular-mocks.js'
                            ,
                            'specs/**/**.js'
                            ,
                            'src/ng-component.js'
                        ]
                ,

                // Specifies files or patterns that should be explicitly excluded
                // from the list of files loaded by Karma.
                exclude :
                        [
                        ]
                ,


                // Configuration for preprocessing files before they are served to the browser.
                // Useful for tasks like code coverage instrumentation, transpilation, etc.
                // Discover available preprocessors here:
                // https://npmjs.org/browse/keyword/karma-preprocessor
                preprocessors :
                        {
                            '**/src/*.js' : 'coverage'
                        }
                ,

                // Settings for the code coverage reporter.
                coverageReporter :
                        {
                            type : 'lcov'
                            ,
                            dir : 'coverage/'
                        }
                ,

                // Defines the reporters Karma should use to display and save test results.
                // Common choices include 'dots', 'progress', 'html', etc.
                // For more options, see:
                // https://npmjs.org/browse/keyword/karma-reporter
                reporters :
                        [
                            'mocha'
                            ,
                            'coverage'
                            ,
                            'coveralls'
                        ]
                ,

                // Specific configuration for the Coveralls reporter.
                // Requires a repository token, typically provided via environment variables.
                coverallsReporter :
                        {
                            repoToken : process.env.COVERALLS_REPO_TOKEN
                        }
                ,

                // The port number on which the Karma web server will listen.
                port : 9876
                ,


                // A boolean flag to enable or disable colored output in the console
                // for reporters and log messages, enhancing readability.
                colors : true
                ,


                // Sets the verbosity level for Karma's logging output.
                // Available levels:
                // config.LOG_DISABLE - No logging.
                // config.LOG_ERROR   - Only log errors.
                // config.LOG_WARN    - Log warnings and errors.
                // config.LOG_INFO    - Log general information, warnings, and errors.
                // config.LOG_DEBUG   - Log everything, including detailed debug messages.
                logLevel : config.LOG_INFO
                ,


                // If set to true, Karma will watch for changes in the configured files
                // and automatically re-execute tests upon detection.
                autoWatch : false
                ,


                // Specifies which browsers Karma should launch and use for testing.
                // Ensure corresponding browser launchers are installed.
                // A list of available launchers can be found here:
                // https://npmjs.org/browse/keyword/karma-launcher
                browsers :
                        [
                            'Chrome'
                        ]
                ,


                // Controls the Continuous Integration (CI) mode.
                // If 'true', Karma will capture the configured browsers, run all tests once,
                // and then terminate the process.
                // If 'false', Karma will stay running, waiting for file changes (if autoWatch is true)
                // or manual restarts.
                singleRun : false
            }
        )
        ;
}
;