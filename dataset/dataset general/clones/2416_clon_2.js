'use strict'; // Enforce strict parsing and execution rules.

// This module exports a function to define configuration settings for a testing harness.
module.exports = function ( testOptions ) {
    // Invoke the configuration method on the provided setup object.
    testOptions.configure
    ( {

        // Specifies the base directory for resolving relative paths within the project.
        rootDirectory: '' ,

        // Declares the test frameworks to be utilized for the test execution.
        testEngines: [
            'mocha'
        ] ,

        // Sets the logging verbosity level for the test runner's console output.
        verbosityLevel: testOptions.VERBOSITY_INFO ,

        // Enumerates the target browser environments where tests will be executed.
        targetEnvironments: [
            'ChromeHeadless'
        ] ,

        // Determines if the test suite should run once and then terminate.
        runOnce: true ,

        // Lists the result formatters or handlers for generating test reports.
        outputHandlers: [
            'spec' ,
            'html'
        ] ,

        // Defines the collection of source files and assets to be loaded for testing.
        sourceAssets: [
            'thirdparty/angular/angular.min.js' ,
            'thirdparty/angular-mock/angular-mock.js' ,
            'source/hash_util.js' ,
            'dist/angular-avatar-service.js' ,
            'dist/tests/unit.js'
        ] ,

        // Specifies preprocessing rules to apply to certain files before execution.
        preprocessingRules: {
            'dist/angular-avatar-service.js': 'istanbul' // Applies Istanbul for code coverage analysis.
        }

    } ) ;
};