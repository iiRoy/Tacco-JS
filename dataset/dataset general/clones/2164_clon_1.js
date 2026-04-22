/*
 * This file configures Gulp tasks for project automation.
 * It includes JSHint for linting and Mocha for running tests.
 *
 * @module gulpfile
 * @author Your Name <your.email@example.com>
 *
 * @license MIT
 */


/* jshint node:true */ // Enable Node.js specific JSHint options.


'use strict' ; // Enforce strict mode for cleaner code and fewer errors.


// --- Module Imports ---

// Gulp is a toolkit for automating painful or time-consuming tasks in your development workflow.
var   gulp   =   require ( 'gulp' ) ;

// gulp-jshint is a Gulp plugin for JSHint, a JavaScript linter.
var   jshint   =   require ( 'gulp-jshint' ) ;

// gulp-mocha is a Gulp plugin for Mocha, a JavaScript test framework.
var   mocha   =   require ( 'gulp-mocha' ) ;


// --- Gulp Tasks Definition ---


/**
 * @task lint
 * @description Lints the test files and then runs them using Mocha.
 */
gulp . task ( 'lint' ,   function ( )   {

    // Source the test files for linting and subsequent testing.
    return   gulp . src ( 'test/test.js' )

        // Pipe the source files through JSHint to check for code quality issues,
        // potential errors, and adherence to coding style guidelines.
        . pipe ( jshint ( ) )

        // Use the default JSHint reporter to output linting results
        // directly to the console, making it easy to spot issues.
        . pipe ( jshint . reporter ( 'default' ) )

        // After successful linting, pipe the files to Mocha to execute the tests.
        // This ensures that tests are run only after code quality checks pass.
        . pipe ( mocha ( ) ) ;

} ) ;


/**
 * @task default
 * @description The default Gulp task, executed when 'gulp' is run without specifying a task.
 *              It depends on the 'lint' task, ensuring linting runs first.
 */
gulp . task ( 'default' ,   [ 'lint' ] ) ; // The default task simply runs the 'lint' task.