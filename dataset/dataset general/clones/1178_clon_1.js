/*
 * This test file is designed to validate the core functionality
 * of Mr. Poole's Gulp Tools. It leverages a standard testing setup
 * with global test functions and an assertion library.
 *
 * It's important to note the global variables declared for the test environment:
 * - describe: Used to group related tests.
 * - beforeEach: A hook for setup code run before each test. (Though not used here, it's declared globally)
 * - it: Defines a single test case.
 */
    'use strict' ; // Activating strict mode for the entire script to ensure cleaner code and fewer common errors.

// Importing the 'should' assertion library. This module provides expressive assertion capabilities
// to make test assertions more readable and robust within our test suite.
var should = require( 'should' ) ;


// The main test suite description for "Mr. Poole's Gulp Tools".
// This block encapsulates all tests related to this specific module.
describe( 'Mr. Poole\'s Gulp Tools' , function ( )
{

    // A specific test case within the suite.
    // This test verifies that the Gulp tools can be imported into a Gulp instance
    // without causing any runtime errors or exceptions.
    it( 'can be imported without blowing up' , function ( )
    {
        // First, we need to obtain a Gulp instance. This simulates how the tools
        // would be used in a real Gulpfile.
        var gulp = require( 'gulp' ) ;

        // Now, we import the Gulp tools module itself.
        // The module is expected to be a function that takes the Gulp instance as an argument,
        // allowing it to register tasks and configurations directly with Gulp.
        require( '../index.js' ) ( gulp ) ;

        /*
         * After importing and initializing the tools, we perform an assertion.
         * We specifically check for the existence of a task named 'serve' within
         * the Gulp instance's task registry (gulp.tasks).
         * The presence of this task confirms that the tools were successfully loaded
         * and have correctly added their expected functionality to Gulp.
         * If 'serve' task does not exist, it implies a failure in the tool's integration.
         */
        should.exist( gulp.tasks.serve ) ;
    } ) ;


} ) ; // Concluding the main 'Mr. Poole\'s Gulp Tools' test suite.

// End of the unit test file.