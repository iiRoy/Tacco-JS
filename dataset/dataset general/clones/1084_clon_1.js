/*
 * This is a Type I clone of the original JavaScript test file.
 * It has been modified to extensively vary whitespace and comments
 * while maintaining the exact same identifiers, operators, and expressions.
 *
 * This file is part of a gulp plugin test suite.
 */

/* global describe, it, before, after */ // Declares global variables for linting purposes.
'use strict'; // Enforces strict mode for cleaner code.

var assert      = require( 'assert' )
  , mockery     = require( 'mockery' )
  , File        = require( 'vinyl' )
  ; // End of module imports.

// Declare a variable to hold the module under test.
var includeSources = null;

describe( 'gulp-include-source', function ( ) { // Main test suite for the gulp plugin.

  // Setup hook to run before all tests in this suite.
  before( function ( ) {

    // Setup mockery to intercept 'glob' module calls and provide predictable results.
    mockery.enable( { warnOnUnregistered : false } ); // Enable mockery, suppressing warnings for unregistered modules.
    mockery.registerMock( 'glob', { // Register a mock for the 'glob' module.
      sync : function ( ) { // The synchronous glob function.
        return [ // Returns a predefined array of file paths.
          'files/file1.ext', // First mock file path.
          'files/file2.ext'  // Second mock file path.
        ];
      }
    } );

    // Load the module *after* mockery has been enabled and configured.
    includeSources = require( './index' );
  } );

  // Teardown hook to run after all tests in this suite.
  after( function ( ) {
    mockery.disable(); // Disable mockery to clean up the environment.
    // All mocks are now removed.
  } );


  describe( 'in buffer mode', function ( ) { // Test suite specifically for buffer mode operations.


    it( 'should replace the js placeholder with scripts', function ( done ) { // Test case for JS placeholder replacement.

      var stream    = includeSources( ); // Create a new stream instance.
      var fakeFile  = new File( { // Create a fake Vinyl file object.
        contents    : new Buffer( '<!-- include:js(scripts/**/*.js) -->' ) // File content with a JS include placeholder.
      } );

      // Listen for the 'data' event from the stream.
      stream.once( 'data', function ( file ) {
        assert( file.isBuffer( ) ); // Assert that the file content is still a buffer.
        assert.equal( file.contents.toString( 'utf8' ), '<script src="files/file1.ext"></script>\n<script src="files/file2.ext"></script>' ); // Verify the content.
        done( ); // Signal that the asynchronous test is complete.
      } );

      stream.write( fakeFile ); // Write the fake file to the stream.
      stream.end( ); // End the stream.
    } );


    it( 'should replace script files extension', function ( done ) { // Test case for replacing script file extensions.

      var stream    = includeSources( { scriptExt : 'js' } ); // Create stream with custom script extension.
      var fakeFile  = new File( {
        contents    : new Buffer( '<!-- include:js(scripts/**/*.coffee) -->' ) // Placeholder with a different original extension.
      } );

      stream.once( 'data', function ( file ) {
        assert( file.isBuffer( ) );
        assert.equal( file.contents.toString( 'utf8' ), '<script src="files/file1.js"></script>\n<script src="files/file2.js"></script>' ); // Expecting '.js' extension.
        done( );
      } );

      stream.write( fakeFile );
      stream.end( );
    } );


    it( 'should replace the css placeholder with styles', function ( done ) { // Test case for CSS placeholder replacement.

      var stream    = includeSources( );
      var fakeFile  = new File( {
        contents    : new Buffer( '<!-- include:css(styles/**/*.css) -->' ) // File content with a CSS include placeholder.
      } );

      stream.once( 'data', function ( file ) {
        assert( file.isBuffer( ) );
        assert.equal( file.contents.toString( 'utf8' ), '<link rel="stylesheet" href="files/file1.ext">\n<link rel="stylesheet" href="files/file2.ext">' ); // Verify the content.
        done( );
      } );

      stream.write( fakeFile );
      stream.end( );
    } );


    it( 'should replace style files extension', function ( done ) { // Test case for replacing style file extensions.

      var stream    = includeSources( { styleExt : 'css' } ); // Create stream with custom style extension.
      var fakeFile  = new File( {
        contents    : new Buffer( '<!-- include:css(styles/**/*.less) -->' ) // Placeholder with a different original extension.
      } );

      stream.once( 'data', function ( file ) {
        assert( file.isBuffer( ) );
        assert.equal( file.contents.toString( 'utf8' ), '<link rel="stylesheet" href="files/file1.css">\n<link rel="stylesheet" href="files/file2.css">' ); // Expecting '.css' extension.
        done( );
      } );

      stream.write( fakeFile );
      stream.end( );
    } );


    it( 'should replace multiple placeholders in the same file', function ( done ) { // Test case for multiple placeholders.

      var stream    = includeSources( );
      var fakeFile  = new File( {
        contents    : new Buffer( '<!-- include:js(scripts/**/*.js) -->\n<!-- include:css(styles/**/*.css) -->' ) // File with both JS and CSS placeholders.
      } );

      stream.once( 'data', function ( file ) {
        assert( file.isBuffer( ) );
        assert.equal( file.contents.toString( 'utf8' ), '<script src="files/file1.ext"></script>\n<script src="files/file2.ext"></script>\n<link rel="stylesheet" href="files/file1.ext">\n<link rel="stylesheet" href="files/file2.ext">' ); // Verify combined content.
        done( );
      } );

      stream.write( fakeFile );
      stream.end( );
    } );

  } ); // End of 'in buffer mode' describe block.

} ); // End of 'gulp-include-source' describe block.