// This file contains unit tests for the graphic generator.
// Global variables for JSHint/ESLint are declared here.
/* jshint expr:true */
/* global describe, beforeEach, it */

'use strict'; // Enforce strict mode for better error handling and cleaner code.


// Core Node.js module for path manipulation.
var path =    require('path');

// Helper utilities for Yeoman generator testing.
var helpers = require('yeoman-generator').test;



// Main test suite for the 'graphic' generator.
describe(  'graphic generator', function ( ) {

  // Setup function to run before each test.
  beforeEach(  function ( done ) {

    // Create a temporary directory for testing purposes.
    helpers.testDirectory( path.join( __dirname , 'temp' ) , function ( err ) {

      // Handle any errors that occur during directory creation.
      if ( err ) {
        return done( err ) ; // Exit early if an error is present.
      }

      // Initialize the generator application instance.
      // The first argument is the generator namespace, the second is an array of local paths.
      this.app = helpers.createGenerator( 'graphic:app' , [
        '../../app' // Relative path to the generator being tested.
      ] ) ;

      // Signal that the asynchronous beforeEach setup is complete.
      done( ) ;

    } .bind( this ) ) ; // Ensure 'this' context is correctly bound.

  } ) ;


  // Test case: Verify that the generator creates the expected files.
  it( 'creates expected files' , function ( done ) {

    // Define an array of files that are expected to be generated.
    var expected = [
      // Add any additional files you anticipate should exist after generation here.
      '.jshintrc' ,       // JSHint configuration file.
      '.editorconfig'     // Editor configuration file for consistent coding styles.
    ] ;


    // Mock user prompts for the generator.
    // In this case, 'someOption' is set to true.
    helpers.mockPrompt( this.app , {
      'someOption' : true
    } ) ;

    // Set a generator option to skip npm/bower installation for faster testing.
    this.app.options[ 'skip-install' ] = true ;

    // Run the generator with empty options and a callback function.
    this.app.run( { } , function ( ) {

      // Assert that all files in the 'expected' array exist.
      helpers.assertFiles( expected ) ;

      // Signal that the asynchronous test case is complete.
      done( ) ;

    } ) ;

  } ) ;

} ) ;