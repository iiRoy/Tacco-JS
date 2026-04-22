'use strict';

// Required modules for Grunt tasks and path manipulation.
var grunt = require( 'grunt' ),
    path  = require( 'path' ); /* Node.js path module */

/*
 * =========================================================
 *  Nodeunit Reference Guide
 *  (See: https://github.com/caolan/nodeunit for more details)
 *
 *  Core Test Methods:
 *  - test.expect(numAssertions) : Declare the number of assertions expected.
 *  - test.done()               : Mark the end of a test case.
 *
 *  Assertion Functions:
 *  - test.ok(value, [message])         : Asserts that 'value' is truthy.
 *  - test.equal(actual, expected, [message]) : Asserts deep equality.
 *  - test.notEqual(actual, expected, [message]) : Asserts deep inequality.
 *  - test.deepEqual(actual, expected, [message]) : Asserts deep equality for objects/arrays.
 *  - test.notDeepEqual(actual, expected, [message]) : Asserts deep inequality for objects/arrays.
 *  - test.strictEqual(actual, expected, [message]) : Asserts strict equality (===).
 *  - test.notStrictEqual(actual, expected, [message]) : Asserts strict inequality (!==).
 *  - test.throws(block, [error], [message]) : Asserts that a function throws an error.
 *  - test.doesNotThrow(block, [error], [message]) : Asserts that a function does NOT throw an error.
 *  - test.ifError(value)               : Asserts that 'value' is falsy.
 * =========================================================
 */

exports.php2html = {

  // Set up method, executed before each test.
  setUp: function ( done ) {
    // Perform any necessary setup operations here.
    done(); // Indicate that setup is complete.
  },

  // Test case for default configuration.
  default: function ( test ) {
    test.expect( 2 ); // Expecting two assertions in this test.

    // Read and normalize the actual HTML content from the default output.
    var actual = grunt.file.read( 'tmp/default/fixtures/index.html' ).replace( /[\s\r\n]/gm, '' );
    // Read and normalize the expected HTML content for comparison.
    var expected = grunt.file.read( 'test/expected/index-replace.html' ).replace( /[\s\r\n]/gm, '' );
    test.equal( actual, expected, 'should show HTML content with test H1' ); // First assertion.

    // Repeat for another file in the default configuration.
    actual = grunt.file.read( 'tmp/default/some-other-fixtures/info.html' ).replace( /[\s\r\n]/gm, '' );
    expected = grunt.file.read( 'test/expected/info.html' ).replace( /[\s\r\n]/gm, '' );
    test.equal( actual, expected, 'should show HTML content' ); // Second assertion.

    test.done(); // All assertions made, test finished.
  },

  // Test case for 'dest-as-target' configuration.
  'dest-as-target': function ( test ) {
    test.expect( 2 ); // Two assertions expected.

    // Check the index.html file.
    var actual = grunt.file.read( 'tmp/dest-as-target/index.html' ).replace( /[\s\r\n]/gm, '' );
    var expected = grunt.file.read( 'test/expected/index.html' ).replace( /[\s\r\n]/gm, '' );
    test.equal( actual, expected, 'should show HTML content with test H1' );

    // Check the info.html file.
    actual = grunt.file.read( 'tmp/dest-as-target/info.html' ).replace( /[\s\r\n]/gm, '' );
    expected = grunt.file.read( 'test/expected/info.html' ).replace( /[\s\r\n]/gm, '' );
    test.equal( actual, expected, 'should show HTML content' );

    test.done();
  },

  // Test case for handling the first error.
  'first-error': function ( test ) {
    test.expect( 2 );

    // Verify that the error file was NOT created.
    test.equal( grunt.file.exists( 'tmp/only-index/error.html' ), false, 'file should NOT be created on error.' );
    // Verify that the index file was created despite the error.
    test.equal( grunt.file.exists( 'tmp/only-index/index.html' ), true, 'index file should be created even if first processed file is gets error' );

    test.done();
  },

  // Test case for 'first-error-nohalt' configuration.
  'first-error-nohalt': function ( test ) {
    test.expect( 1 ); // Only one assertion here.

    // In nohalt mode, the error file SHOULD be created.
    test.equal( grunt.file.exists( 'tmp/nohalt/error.html' ), true, 'file should be created on error.' );

    test.done();
  },

  // Test case for 'first-error-ignored' configuration.
  'first-error-ignored': function ( test ) {
    test.expect( 2 );

    // Check if the error-ignored file exists.
    test.equal( grunt.file.exists( 'tmp/only-index/error-ignored.html' ), true, 'file should be created when error is ignored.' );

    // Compare its content.
    var actual = grunt.file.read( 'tmp/only-index/error-ignored.html' ).replace( /[\s\r\n]/gm, '' );
    var expected = grunt.file.read( 'test/expected/error-ignored.html' ).replace( /[\s\r\n]/gm, '' );
    test.equal( actual, expected, 'it should output expected html' );

    test.done();
  },

  // Test case for the 'processTest' functionality.
  'processTest': function ( test ) {
    test.expect( 1 ); // Expecting a single assertion.

    var actual = grunt.file.read( 'tmp/processTest/index.html' );
    var expected = ':-)'; // The expected processed output.
    test.equal( actual, expected, 'should show :-)' );

    test.done();
  },

  // Test case for environment variables handling.
  'environment': function ( test ) {
    // Determine the path separator based on the operating system.
    var docrootfix = process.platform === 'win32' ? '\\' : '';
    test.expect( 5 ); // Expecting five assertions for different environment variables.

    // Verify DOCUMENT_ROOT.
    test.equal( grunt.file.read( 'tmp/test/env/DOCUMENT_ROOT.html' ), process.cwd() + docrootfix, 'DOCUMENT_ROOT should be cwd()' );
    // Verify PHP_SELF.
    test.equal( grunt.file.read( 'tmp/test/env/PHP_SELF.html' ), '/test/env/PHP_SELF.php', 'PHP_SELF schould be relative script path' );
    // Verify REQUEST_URI.
    test.equal( grunt.file.read( 'tmp/test/env/REQUEST_URI.html' ), '/test/env/REQUEST_URI.php', 'REQUEST_URI schould be relative script path' );
    // Verify SCRIPT_NAME.
    test.equal( grunt.file.read( 'tmp/test/env/SCRIPT_NAME.html' ), '/test/env/SCRIPT_NAME.php', 'SCRIPT_NAME schould be relative script path' );
    // Verify SCRIPT_FILENAME.
    test.equal( grunt.file.read( 'tmp/test/env/SCRIPT_FILENAME.html' ), path.join( process.cwd(), 'test/env/SCRIPT_FILENAME.php' ), 'SCRIPT_FILENAME schould be absolute script path' );
    test.done();
  },

  // Test case for retrieving data via GET.
  'getData': function ( test ) {
    // Read expected and actual data, normalizing whitespace.
    var expected = grunt.file.read( 'test/expected/get.html' ).replace( /[\s\t\r\n]+/gm, '' ),
        actual   = grunt.file.read( 'tmp/data/get.html' ).replace( /[\s\t\r\n]+/gm, '' );

    test.expect( 1 ); // Expect one assertion.
    test.equal( actual, expected, 'Should output data from query string' );
    test.done();
  },

  // Test case for router functionality.
  'router': function ( test ) {
    var expected = '/myroute'; // The expected route output.
    var actual = grunt.file.read( 'tmp/router/myroute.html' ).replace( /[\s\t\r\n]+/gm, '' );
    test.expect( 1 ); // One assertion expected.
    test.equal( actual, expected, 'Should output request uri passed to router' );
    test.done();
  }

}; // End of exports.php2html object.