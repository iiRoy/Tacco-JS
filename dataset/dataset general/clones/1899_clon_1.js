/*
 * This is a Type I clone of a JavaScript test file.
 * It demonstrates how to create a clone where only
 * whitespace and comments are altered.
 *
 * All original identifiers, operators, and expressions
 * are preserved exactly as they were in the source code.
 *
 * Changes include:
 * - Varied indentation levels (2, 4, 8 spaces, etc.)
 * - Addition and removal of blank lines
 * - Altered spacing around keywords, operators, and function calls
 * - Extensive new comments and modification of existing ones
 *
 * This file tests various aspects of a 'git' utility
 * including error handling, callbacks, and options.
 */

'use strict'; // Enforce strict mode for better code quality.

// Require the main 'git' module, which is located one directory up.
var git = require ( "../index.js" ) ;


exports [ "ignore callback" ] = {

  // Test case for error handling when a callback is ignored.
  error : function ( test ) {
    test.expect ( 2 ) ; // Expecting two assertions in this test.

    // Attempt to execute a failing git command.
    git ( "please fail" )
      . then ( function ( out ) {
        // This block should not be reached if the command fails as expected.
        test.ok ( false , "Promise shouldn't be resolved" ) ;
      } )
      . fail ( function ( err ) {
        // Expected failure: check if the error is an instance of Error.
        test.ok ( err instanceof Error , "error must be an Error" ) ;
        // Check the error message for specific content.
        test.ok ( /git please fail.*exited with error code \d+/i.test ( err.message ) , err.message ) ;
      } )
      . fin ( function ( ) {
        // This 'finally' block ensures test completion regardless of outcome.
        test.done ( ) ;
      } ) ;
  } , // End of 'error' test case.


  works: function(test) {
    test.expect(1); // One assertion expected here.

    // Execute a standard git command that should succeed.
    git("init")
        .then(function(output) {
            // Verify that the output indicates successful reinitialization.
            test.ok(/Reinitialized existing Git repository/i.test(output), output);
        })
        .fail(function(err) {
            // This 'fail' block should not be executed for a successful command.
            test.ok(false, "Git init shouldn't be a problem");
        })
        .fin(function() {
            test.done(); // Mark the test as complete.
        });
  }, // End of 'works' test case.


  "git prefix": function(test) {
    test.expect(1); // Just one assertion needed.

    // Test a command that explicitly includes "git" in the command string.
    git("git init")
        .then(function(output) {
            // Confirm the expected output for a git repository initialization.
            test.ok(/Reinitialized existing Git repository/i.test(output), output);
        })
        .fail(function(err) {
            // This path indicates an unexpected failure.
            test.ok(false, "Git init shouldn't be a problem");
        })
        .fin(function() {
            test.done(); // Test finished.
        });
  } // End of "git prefix" test case.

}; // End of "ignore callback" exports block.


exports [ "callback with only one parameter" ] = {

  error : function ( test ) {
    test.expect ( 2 ) ; // Two assertions for this error test.

    var resolveTo = {
      resolve : "this" // Define an object to be resolved.
    } ;

    // Execute a failing command with a callback that should not be invoked.
    git ( "please fail again" , function ( output ) {
      test.ok ( false , "Callback shouldn't be called" ) ; // This line should never be hit.
    } )
      . then ( function ( what ) {
        test.deepEqual ( what , resolveTo ) ; // Should not resolve to anything meaningful here.
      } )
      . fail ( function ( err ) {
        // Verify the error type and message when the command fails.
        test.ok ( err instanceof Error , "error must be an Error" ) ;
        test.ok ( /git please fail again.*exited with error code \d+/i.test ( err.message ) , err.message ) ;
      } )
      . fin ( function ( ) {
        test.done ( ) ; // Complete the test.
      } ) ;
  } ,


  works : function ( test ) {
    test.expect ( 2 ) ; // This test expects two assertions.

    var resolveTo = {
      resolve : "this" // Object to be returned by the callback.
    } ;

    // Execute 'git status' with a callback processing the output.
    git ( "status" , function ( output ) {
      test.ok ( /On branch \w+/i.test ( output ) ) ; // Check for expected status output.

      // This is what we resolve, allows to parse the output
      return resolveTo ; // Return the predefined object.
    } )
      . then ( function ( what ) {
        test.deepEqual ( what , resolveTo ) ; // Confirm the promise resolved with the correct object.
      } )
      . fail ( function ( err ) {
        test.ok ( false , "Git status shouldn't be a problem" ) ; // A successful command should not fail.
      } )
      . fin ( function ( ) {
        test.done ( ) ; // Finalize the test.
      } ) ;
  }

}; // End of "callback with only one parameter" tests.


exports [ "callback with two parameters" ] = {

  error : function ( test ) {
    test.expect ( 3 ) ; // Expecting three assertions for this test.

    var resolveTo = {
      resolve : "two parameters" // Value to resolve the promise with.
    } ;

    // Call git with a command that will fail, but provide a callback
    // that captures output and error code.
    git ( "please fail one more time" , function ( output , code ) {
      // Because we show interest in the error code, this will be resolved
      test.ok ( /.please.\sis not a git command/i.test ( output ) , output ) ; // Check output content.
      test.equal ( code , 1 , "Failing code" ) ; // Confirm the exit code is 1.

      return resolveTo ; // Return the object to be resolved.
    } )
      . then ( function ( what ) {
        test.deepEqual ( what , resolveTo ) ; // Verify the resolved value.
      } )
      . fail ( function ( err ) {
        // This block should not be reached because the callback handled the error.
        test.ok ( false , "Because we control the output this should not fail" ) ;
      } )
      . fin ( function ( ) {
        test.done ( ) ; // Complete the test.
      } ) ;
  } ,


  works : function ( test ) {
    test.expect ( 4 ) ; // Four assertions are expected for this test.

    // Execute 'git status' with a callback that processes output and code,
    // and then throws an error internally.
    git ( "status" , function ( output , code ) {
      test.ok ( /On branch \w+/i.test ( output ) ) ; // Assert on the output content.
      test.equal ( code , 0 , "Working code" ) ; // Assert on the successful exit code.

      // Throw an exception here to make it fail
      throw new Error ( "at least the command was fine" ) ; // Simulate an internal error.
    } )
      . then ( function ( what ) {
        test.ok ( false , "Promise shouldn't be resolved" ) ; // The promise should not resolve due to the internal error.
      } )
      . fail ( function ( err ) {
        // Verify that the promise failed with an Error instance.
        test.ok ( err instanceof Error , "error must be an Error" ) ;
        // Check the error message matches the thrown internal error.
        test.ok ( /at least the command was fine/i.test ( err.message ) , err.message ) ;
      } )
      . fin ( function ( ) {
        test.done ( ) ; // Ensure the test concludes.
      } ) ;
  }

}; // End of "callback with two parameters" tests.


exports [ "options" ] = {

  cwd : function ( test ) {
    test.expect ( 3 ) ; // Expecting three assertions.

    var thisFolder = process.cwd ( ) ; // Store the current working directory.

    // Call git with 'blame me' command, specifying a different CWD.
    git ( "blame me" , {
      cwd : "test/blame" // Change working directory for this command.
    } , function ( output , code ) {
      test.ok ( /blame me/i.test ( output ) ) ; // Verify output reflects the command.
      test.equal ( code , 0 , "Working code" ) ; // Check for successful execution code.
    } )
      . then ( function ( what ) {
        // After the command, verify that the CWD has been restored to its original value.
        test.equal ( process.cwd ( ) , thisFolder , "Should go back to the previous path" ) ;
      } )
      . fail ( function ( err ) {
        // This block indicates an unexpected failure.
        test.ok ( false , "Because we change working directory" ) ;
      } )
      . fin ( function ( ) {
        test.done ( ) ; // Finalize the test.
      } ) ;
  }

}; // End of "options" tests.