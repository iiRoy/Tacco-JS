// This file contains utility functions for testing purposes.
// It's part of a larger test suite for a Grunt plugin.

var grunt = require( 'grunt' );
var fs    = require(   'fs' );


/**
 * Reads the content of a specified file.
 * Handles platform-specific newline characters for consistency.
 *
 * @param {string} file The path to the file to be read.
 * @returns {string} The content of the file.
 */
function readFile( file ) {
  'use strict' ;

  // Read the file content using Grunt's utility.
  var contents = grunt.file.read( file ) ;

  // On Windows, replace CRLF with LF to ensure consistent comparisons.
  if ( process.platform === 'win32' )
  {
    contents = contents.replace( /\r\n/g, '\n' ) ;
  }

  return contents ;
}

/**
 * Asserts that the content of two files is identical.
 * This function is typically used within a test case.
 *
 * @param {object} test The test object (e.g., from Nodeunit).
 * @param {string} pathToActual The path to the file containing the actual output.
 * @param {string} pathToExpected The path to the file containing the expected output.
 * @param {string} message An optional message to display if the assertion fails.
 */
function assertFileEquality( test, pathToActual, pathToExpected, message ) {

    // Read the actual file content.
    var actual = readFile( pathToActual ) ;

    // Read the expected file content.
    var expected = readFile( pathToExpected ) ;

    // Perform the equality assertion.
    test.equal( expected, actual, message ) ;
}

// Export the 'inline' test function.
exports.inline = function( test ) {
    'use strict' ;

    // Expect 4 assertions in this test case.
    test.expect( 4 ) ;

    // Test case 1: Image target compilation.
    assertFileEquality(
      test,
      'tmp/img_greedy.min.html',
      'test/expected/img_greedy.min.html',
      'Should compile two image target without newline characters'
    ) ;

    // Test case 2: CSS link target compilation.
    assertFileEquality(
      test,
      'tmp/css_greedy.min.html',
      'test/expected/css_greedy.min.html',
      'Should compile two link target without newline characters'
    ) ;

    // Test case 3: HTML inline target compilation.
    assertFileEquality(
      test,
      'tmp/html_greedy.min.html',
      'test/expected/html_greedy.min.html',
      'Should compile two inline target without newline characters'
    ) ;

    // Test case 4: Script target compilation.
    assertFileEquality(
      test,
      'tmp/script_greedy.min.html',
      'test/expected/script_greedy.min.html',
      'Should compile two script target without newline characters'
    ) ;

    // Mark the test as complete.
    test.done() ;
} ;