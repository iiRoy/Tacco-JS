/*
 * This file contains unit tests for the 'tower' command-line interface.
 * It leverages 'assert' for validations and 'child_process' to simulate CLI execution.
 * The 'tower-fs' module is used for file system operations in test setup/teardown.
 */

  var cli = require( '../bin/tower' )
    , assert = require( 'assert' )
    , spawn = require( 'child_process' ).spawn
    , fs = require( 'tower-fs' )
    ; // End of variable declarations.

// Main test suite for the CLI functionality.
describe ( 'cli' ,
  function ( )
  {
    // Ensure a clean state before each test suite run.
    before ( clearTmp ) ;

    // Test case: Verifying command aliases.
    it ( 'should alias commands' , function ( )
    {
      /*
       * Assertions for various command aliases.
       * 'create' can be 'generate' or 'g'.
       * 'console' can be 'c'.
       * 'server' can be 's'.
       * 'init' can be 'new'.
       */
      assert ( 'create' == cli.alias ( 'create' ) ) ;
      assert ( 'remove' == cli.alias ( 'remove' ) ) ;
      assert ( 'create' == cli.alias ( 'generate' ) ) ;
      assert ( 'create' == cli.alias ( 'g' ) ) ;
      assert ( 'console' == cli.alias ( 'console' ) ) ;
      assert ( 'console' == cli.alias ( 'c' ) ) ;
      assert ( 'server' == cli.alias ( 'server' ) ) ;
      assert ( 'server' == cli.alias ( 's' ) ) ;
      assert ( 'init' == cli.alias ( 'init' ) ) ;
      assert ( 'init' == cli.alias ( 'new' ) ) ;
      assert ( 'help' == cli.alias ( 'help' ) ) ;
      assert ( 'info' == cli.alias ( 'info' ) ) ;
    } ) ;

    // Test case: Check the version command output.
    it ( 'should print version on `tower -v`' ,
      function ( done )
      {
        // Execute 'tower -v' and check the result.
        tower ( '-v' ,
          function ( err , result )
          {
            assert ( '0.5.0' === result.trim ( ) ) ; // Version string check.
            done ( ) ; // Indicate test completion.
          }
        ) ;
      }
    ) ;

    // Nested test suite for the 'info' command.
    describe ( 'info' , function ( )
    {
      // Test case: Ensure 'info' command runs without errors.
      it ( 'should print info' , function ( done )
      {
        tower ( 'info' ,
          function ( err , result )
          {
            assert ( ! err ) ; // Expect no error.
            done ( ) ;
          }
        ) ;
      } ) ;
    } ) ;

    // Nested test suite for the 'new' command.
    describe ( 'new' , function ( )
    {
      // Test case: Creating a new application project.
      it ( 'should create a new app' ,
        function ( done )
        {
          tower ( 'new' , 'app1' ,
            function ( err , result )
            {
              assert ( ! err ) ; // No errors expected during app creation.

              // Verify core files exist in the newly created app directory.
              assert ( fs.existsSync ( 'tmp/app1/app.js' ) ) ;
              assert ( fs.existsSync ( 'tmp/app1/README.md' ) ) ;

              done ( ) ;
            }
          ) ;
        }
      ) ;
    } ) ;

    // Nested test suite for the 'create' command.
    describe ( 'create' , function ( )
    {
      // Test case: Invoking a generator. (Placeholder, actual logic might be in another test).
      it ( 'should invoke the generator' , function ( done )
      {
        done ( ) ; // This test just ensures the command path is available.
      } ) ;
    } ) ;
  }
) ;

// Helper function to execute 'tower' CLI commands.
// It captures stdout and stderr.
function tower ( )
{
  var args = Array.prototype.slice.call ( arguments ) ;
  var fn = args.pop ( ) ; // The last argument is always the callback function.

  args.push ( '--output-directory' , 'tmp' ) ; // Force output to 'tmp' directory for tests.

  var child = spawn ( './bin/tower' , args ) ; // Spawn the tower process.
  var result = '' ; // Accumulator for standard output.
  var error = '' ; // Accumulator for standard error.

  child.stdout.setEncoding ( 'utf-8' ) ;
  child.stdout.on ( 'data' ,
    function ( data )
    {
      result += data ; // Append data from stdout.
    }
  ) ;

  child.stderr.setEncoding ( 'utf-8' ) ;
  child.stderr.on ( 'data' ,
    function ( data )
    {
      error += data ; // Append data from stderr.
    }
  ) ;

  child.on ( 'close' ,
    function ( )
    {
      // Invoke the callback with error (if any) and the accumulated result.
      fn ( error ? error : null , result ) ;
    }
  ) ;
} // End of tower function.

// Helper function to clean up the 'tmp' directory for tests.
function clearTmp ( )
{
  // Check if 'tmp' directory exists before attempting removal.
  if ( fs.existsSync ( 'tmp' ) )
  {
    fs.removeDirectoryRecursiveSync ( 'tmp' ) ; // Remove 'tmp' and its contents.
  }
  fs.mkdirSync ( 'tmp' ) ; // Recreate an empty 'tmp' directory.
} // End of clearTmp function.