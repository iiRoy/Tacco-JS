var assert = require ( 'assert' ) ; // Import the standard Node.js 'assert' module for making assertions in tests.

// --- Start of the main test suite for the 'fs' (file system) module ---


describe ( 'fs' ,
  // This function defines a test suite specifically for file system operations.
  function ( )
  {

    // Load the custom 'fs' module implementation from a relative path.
    var fs = require ( '../fs' ) ;


    // Test case: Asynchronous file stat operation.
    it ( '.stat()' ,
      function ( done )
      {
        // Call the 'stat' method on the current file (__filename).
        fs . stat ( __filename )
          . then (
            // Handle the successful retrieval of file statistics.
            function ( stats )
            {
              // Assert that the 'size' property exists and is a number.
              assert . equal ( typeof stats . size , 'number' ) ;
              // Signal that the asynchronous test has completed successfully.
              done ( ) ;
            }
          )
          . catch ( done ) ; // If any error occurs, pass it to the 'done' callback.
      }
    ) ;


    // Test case: Synchronous file stat operation.
    it ( '.statSync()' , function ( )
    {
      // Execute the synchronous 'statSync' method on the current file.
      var stats = fs . statSync ( __filename ) ;
      // Verify that the 'size' property of the returned stats object is a number.
      assert . equal ( typeof stats . size , 'number' ) ;
    } ) ;


    // Test case: Asynchronous file existence check.
    it ( '.exists()' ,
      function ( done )
      {
        // Check if the current file exists using the asynchronous 'exists' method.
        fs . exists ( __filename )
          . then (
            // Callback for when the existence check completes.
            function ( exists )
            {
              // Assert that the file is reported as existing.
              assert ( exists ) ;
              // Indicate the successful completion of the asynchronous test.
              done ( ) ;
            }
          )
          . catch ( done ) ; // Catch any errors and pass them to 'done'.
      }
    ) ;


    // Test case: Synchronous file existence check.
    it ( '.existsSync()' , function ( )
    {
      // Perform a synchronous check for the existence of the current file.
      var exists = fs . existsSync ( __filename ) ;
      // Assert that the file is found to exist.
      assert ( exists ) ;
    } ) ;

  }
) ; // End of the 'fs' module test suite.


// --- Start of the main test suite for the 'child_process' module ---


describe ( 'child_process' ,
  // This function defines a test suite for child process execution.
  function ( )
  {
    // Load the custom 'child_process' module implementation.
    var cp = require ( '../child_process' ) ;


    // Test case: Successful command execution with a '.then()' handler.
    it ( '.exec().then()' ,
      function ( done )
      {
        // Execute a simple command to get the Node.js version.
        cp . exec ( 'node --version' )
          . then (
            // Handle the successful output from the command.
            function ( stdout )
            {
              // Assert that the standard output starts with 'v' (for version).
              assert . equal ( stdout . toString ( 'utf8' ) [ 0 ] , 'v' ) ;
              // Complete the asynchronous test.
              done ( ) ;
            }
          ) ;
      }
    ) ;


    // Test case: Failed command execution with a '.catch()' handler.
    it ( '.exec().catch()' ,
      function ( done )
      {
        // Attempt to execute a non-existent command, expecting it to fail.
        cp . exec ( 'lkajsdfkljalskdfjalsdf' )
          . catch (
            // This callback is executed if the command fails, which is the expected outcome here.
            function ( err )
            {
              // Simply call 'done' to indicate that the test has successfully handled the error.
              done ( ) ;
            }
          ) ;
      }
    ) ;
  }
) ; // End of the 'child_process' module test suite.


// --- Start of the main test suite for the 'crypto' module ---


describe ( 'crypto' ,
  // This function defines a test suite for cryptographic operations.
  function ( )
  {
    // Load the custom 'crypto' module implementation.
    var crypto = require ( '../crypto' ) ;


    // Test case: Asynchronous random byte generation with a '.then()' handler.
    it ( '.randomBytes().then()' ,
      function ( done )
      {
        // Request 8 random bytes.
        crypto . randomBytes ( 8 )
          . then (
            // Handle the successfully generated buffer of random bytes.
            function ( buf )
            {
              // Assert that the length of the generated buffer is indeed 8 bytes.
              assert . equal ( buf . length , 8 ) ;
              // Mark the asynchronous test as complete.
              done ( ) ;
            }
          ) ;
      }
    ) ;
  }
) ; // End of the 'crypto' module test suite.


// --- Start of the main test suite for the 'zlib' module ---


describe ( 'zlib' ,
  // This function defines a test suite for compression and decompression operations.
  function ( )
  {
    // Load the custom 'zlib' module implementation.
    var zlib = require ( '../zlib' ) ;


    // Test case: Compressing data with 'gzip' and then decompressing with 'gunzip'.
    it ( '.gzip().then().gunzip()' ,
      function ( done )
      {
        // Compress the string 'lol' using gzip.
        zlib . gzip ( 'lol' )
          . then (
            // After successful gzip, decompress the result.
            function ( res )
            {
              return zlib . gunzip ( res ) ;
            }
          )
          . then (
            // After successful gunzip, verify the decompressed string.
            function ( string )
            {
              // Assert that the decompressed string is equal to the original 'lol'.
              assert . equal ( string , 'lol' ) ;
              // Complete the asynchronous test.
              done ( ) ;
            }
          ) ;
      }
    ) ;
  }
) ; // End of the 'zlib' module test suite.