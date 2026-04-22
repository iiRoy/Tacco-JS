// This file exports a function to configure Karma for testing.
// It sets up the testing environment for an Angular project,
// including frameworks, browsers, and file preprocessors.

'use strict'; // Enforce strict mode for cleaner code and error handling.


// Export the main configuration function. This function will be called by Karma
// and receive the `config` object to set up the test runner.
module.exports = function ( config ) {

    // Call the 'set' method on the provided config object to define
    // all the necessary Karma configuration properties.
    config.set( {

        // The base path used to resolve all relative paths in 'files' and 'exclude'.
        // An empty string means the current directory of the config file.
        basePath    :   '' ,


        // List of testing frameworks to use.
        // We are using Jasmine for writing our tests.
        frameworks  :   [ 'jasmine' ] ,


        // Level of logging to display in the console.
        // Possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel    :   config.LOG_INFO ,


        // A list of browsers that Karma should launch and capture.
        // PhantomJS is a headless browser, good for CI environments.
        browsers    :   [ 'PhantomJS' ] ,


        // If true, Karma will exit after all tests have been run.
        // This is typically desired for CI/CD pipelines.
        singleRun    :   true ,


        // List of reporters to use for test results.
        // 'dots' provides a concise output, 'coverage' generates code coverage reports.
        reporters   :   [ 'dots' , 'coverage' ] ,


        // List of files / patterns to load in the browser.
        // These files will be loaded in order.
        files       :   [

            // Angular core library
            'components/angular/angular.js' ,

            // Angular mocks for testing
            'components/angular-mocks/angular-mocks.js' ,

            // Our MD5 utility script
            'src/md5.js' ,

            // The main Angular Gravatar module build file
            'build/angular-gravatar.js' ,

            // Our test specifications
            'build/spec/tests.js'

        ] ,


        // Preprocessors to use before serving files to the browser.
        // Here, we're configuring the 'coverage' preprocessor to instrument
        // our main application's build file for code coverage analysis.
        preprocessors:  {

            // Apply 'coverage' preprocessor to the angular-gravatar.js file.
            'build/angular-gravatar.js' :   'coverage'

        }

    } ) ; // End of the config.set() method call.

} ; // End of the module.exports function definition.

// End of Karma configuration file.