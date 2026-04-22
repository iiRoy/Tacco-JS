module.exports = function ( testSetup ) { // This module exports a configuration function.

    // The provided setup object is used to establish various settings for the testing environment.
    testSetup.establishSettings ( {

        // Defines the base directory from which relative paths are resolved.
        rootDirectory:     '.' ,

        // Specifies the collection of testing frameworks to be utilized.
        testFrameworks:    [ "jasmine" ] ,

        // An array listing all asset files that need to be loaded for test execution.
        assetFiles:        [
            'test/lib/jquery.min.js' , // Include jQuery library.
            'test/lib/helpers.js' , // Include custom helper utilities.
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0-beta.5/angular.js' , // Main Angular.
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0-beta.5/angular-route.js' , // Angular routing.
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0-beta.5/angular-animate.js' , // Angular animations.
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0-beta.5/angular-mocks.js' , // Angular mocks for testing.
            'src/**/*.js' , // All JavaScript files in the main source directory.
            'test/unit/**/*.js' // All unit test files.
        ] ,

        // A flag indicating whether to automatically monitor source files for changes and re-run tests.
        observeChanges:    true ,

        // Specifies the list of web browsers where the tests should be executed.
        executionBrowsers: [ 'PhantomJS' ]

    } ) ;
} ;