/*
 * This file contains a series of tests for the CLI functionality.
 * It uses 'tape' for testing and 'child_process' to execute CLI commands.
 */

/*
 * Core dependencies for test execution.
 */
var exec  =  require ( "child_process" ) . exec
var fs    =  require ( "fs" )

// Testing framework.
var test  =  require ( "tape" )

/*
 * Local utility functions and the main cssnext library.
 */
var utils   =  require ( "./utils" )
var cssnext =  require ( ".." )

/*
 * CLI test setup.
 * Prepare input and expected output for CLI interactions.
 */
var input   =  utils . readFixture ( "cli" )
var output  =  utils . readFixture ( "cli.expected" )

/*
 * Define the path to the cssnext executable.
 * Using 'node bin/cssnext' ensures cross-platform compatibility, especially for Windows.
 */
var cssnextBin  =  "node bin/cssnext" // Command to run the CLI tool.

/*
 * Main test suite for CLI operations.
 * All individual tests are wrapped in this 'tape' block.
 */
test ( "cli" ,  function ( t )  {
  // Initialize a counter for planned assertions.
  var planned  =  0

  /*
   * Test Case 1: Read from file, write to file.
   * Checks if the CLI can process an input file and save the result to an output file.
   */
  exec ( cssnextBin + " test/fixtures/cli.css test/fixtures/cli.output--io.css" ,  function ( err )  {
    if  ( err )  {
      throw  err // Propagate any execution errors.
    }
    var res  =  utils . readFixture ( "cli.output--io" )
    t . equal ( res ,  output ,  "should read from a file and write to a file" )
    utils . remove ( "cli.output--io" ) // Clean up the generated output file.
  } )
  planned += 1

  /*
   * Test Case 2: Read from file, write to stdout.
   * Verifies that the CLI can output processed CSS directly to standard output.
   */
  exec ( cssnextBin + " test/fixtures/cli.css" ,  function ( err ,  stdout )  {
    if  ( err )  {
      throw  err
    }
    t . equal ( stdout ,  output ,  "should read from a file and write to stdout" )
  } )
  planned += 1

  /*
   * Test Case 3: Read from stdin, write to stdout.
   * Confirms the CLI's ability to accept input via standard input.
   */
  var childProcess  =  exec ( cssnextBin ,  function ( err ,  stdout )  {
    if  ( err )  {
      throw  err
    }
    t . equal ( stdout ,  output ,  "should read from stdin and write to stdout" )
  } )
  childProcess . stdin . write ( new Buffer ( input ) )
  childProcess . stdin . end ( )
  planned += 1

  /*
   * Test Case 4: Handle non-existent input file.
   * Ensures the CLI returns an appropriate error when the input file is not found.
   */
  exec ( cssnextBin + " test/fixtures/cli.dont-exist.css" ,  function ( err ,  stdout ,  stderr )  {
    t . ok ( err  &&  err . code  ===  1 ,  "should return an error when input file is unreadable" )
    t . ok ( utils . contains ( stderr ,  "Unable to read file" ) ,  "should show that the input file is not found" )
  } )
  planned += 2

  /*
   * Test Case 5: Handle internal processing errors.
   * Checks if the CLI correctly reports errors encountered during CSS processing.
   */
  exec ( cssnextBin + " test/fixtures/cli.error.css" ,  function ( err ,  stdout ,  stderr )  {
    t . ok ( err  &&  err . code  ===  2 ,  "should throw an error" )
    t . ok ( utils . contains ( stderr ,  "encounters an error" ) ,  "should output a readable error" )
    t . ok ( utils . contains ( stderr ,  "If this error looks like a bug, please report it here" ) ,  "should show the url where to report bugs" )
  } )
  planned += 3

  /*
   * Test Case 6: Configuration file support.
   * Verifies that the CLI can load configuration from a specified JSON file.
   */
  exec ( cssnextBin + " --config test/fixtures/config.json test/fixtures/config.css" ,  function ( err ,  stdout )  {
    if  ( err )  {
      throw  err
    }
    t . equal ( stdout ,  utils . readFixture ( "config.expected" ) ,  "should read config file on --config" )
  } )
  planned += 1

  /*
   * Test Case 7: --browsers option.
   * Confirms that browser targets can be specified via a CLI option.
   */
  var noCustomPropInput  =  ":root{--foo:bar}baz{qux:var(--foo)}"
  var childProcessBrowsers  =  exec ( cssnextBin + " --browsers \"Firefox >= 31\"" ,  function ( err ,  stdout )  {
    if  ( err )  {
      throw  err
    }
    t . equal ( stdout ,  noCustomPropInput ,  "should have a --browsers option" )
  } )
  childProcessBrowsers . stdin . write ( new Buffer ( noCustomPropInput ) )
  childProcessBrowsers . stdin . end ( )
  planned += 1

  /*
   * Test Case 8: --verbose option.
   * Checks if the CLI provides verbose output when the option is enabled.
   */
  exec ( cssnextBin + " --verbose test/fixtures/cli.css test/fixtures/cli.output--verbose.css" ,  function ( err ,  stdout )  {
    if  ( err )  {
      throw  err
    }
    t . ok ( utils . contains ( stdout ,  "Output written" ) ,  "should log on --verbose" )
    utils . remove ( "cli.output--verbose" )
  } )
  planned += 1

  /*
   * Test Case 9: --no-import option.
   * Ensures that CSS @import rules are not processed when this option is used.
   */
  exec ( cssnextBin + " --no-import test/fixtures/import.css" ,  function ( err ,  stdout )  {
    if  ( err )  {
      throw  err
    }
    t . equal ( stdout ,  utils . readFixture ( "import" ) ,  "should not import on --no-import" )
  } )
  planned += 1

  /*
   * Test Case 10: --no-url option.
   * Verifies that relative URL adjustments are skipped with this option.
   */
  exec ( cssnextBin + " --no-url test/fixtures/url.css" ,  { cwd :  process . cwd ( ) } ,  function ( err ,  stdout )  {
    if  ( err )  {
      throw  err
    }
    t . equal ( stdout ,  utils . readFixture ( "url/dep" ) ,  "should not adjust url on --no-url" )
  } )
  planned += 1

  /*
   * Test Case 11: --compress option.
   * Tests CSS compression functionality.
   */
  exec ( cssnextBin + " --compress test/fixtures/compress.css" ,  function ( err ,  stdout )  {
    if  ( err )  {
      throw  err
    }
    t . equal ( stdout ,  utils . readFixture ( "compress.default.expected" ) . trim ( ) ,  "should compress on --compress" )
  } )
  planned += 1

  /*
   * Test Case 12: --sourcemap option.
   * Confirms that source maps are generated when requested.
   */
  exec ( cssnextBin + " --sourcemap test/fixtures/sourcemap.css" ,  function ( err ,  stdout )  {
    if  ( err )  {
      throw  err
    }
    t . equal ( stdout ,  utils . readFixture ( "sourcemap.expected" ) . trim ( ) ,  "should add sourcemap on --sourcemap" )
  } )
  planned += 1

  /*
   * Test Case 13: Disabling all features.
   * Iterates through all available features and disables them to ensure the output remains unchanged.
   */
  var toSpace   =  require ( "to-space-case" )
  var toSlug    =  require ( "to-slug-case" )
  var features  =  Object . keys ( cssnext . features )
  var no        =  "--no-"  +  features . map ( function ( feature )  {  return  toSlug ( feature ) } ) . join ( " --no-" )
  features . forEach ( function ( feature )  {
    var slug    =  toSlug ( feature )
    var output  =  utils . readFixture ( "features/"  +  slug )
    exec ( cssnextBin + " " + no + " test/fixtures/features/" + slug + ".css" ,  function ( err ,  stdout )  {
      if  ( err )  {
        throw  err
      }
      t . equal ( stdout ,  output ,  "should not modify input of '"  +  toSpace ( feature )  +  "' fixture if all features are disabled" )
    } )
  } )
  planned += features . length

  /*
   * Test Case 14: --watch option with missing input/output.
   * Expects an error when the --watch option is used without specifying input or output files.
   */
  exec ( cssnextBin + " --watch" ,  function ( err ,  stdout ,  stderr )  {
    t . ok ( err  &&  err . code  ===  3 ,  "should return an error when <input> or <output> are missing when `--watch` option passed" )
    t . ok ( utils . contains ( stderr ,  "--watch option need" ) ,  "should show an explanation when <input> or <output> are missing when `--watch` option passed" )
  } )
  planned += 2

  /*
   * Test Case 15: --watch option with missing output.
   * Expects an error when --watch is used with only an input file, but no output.
   */
  exec ( cssnextBin + " --watch test/fixtures/cli.css" ,  function ( err ,  stdout ,  stderr )  {
    t . ok ( err  &&  err . code  ===  3 ,  "should return an error when <output> is missing when `--watch` option passed" )
    t . ok ( utils . contains ( stderr ,  "--watch option need" ) ,  "should show an explanation when <output> is missing when `--watch` option passed" )
  } )
  planned += 2

  /*
   * Test Case 16: --watch option functionality (error handling and import watching).
   * This block contains more complex tests for the watch mode, including error reporting and dynamic import watching.
   * It is skipped on CI environments (Travis, Appveyor) due to potential issues with process killing.
   */
  if  ( ! process . env . TRAVIS  &&  ! process . env . APPVEYOR )  {
    /*
     * Sub-test 16.1: Watch for errors in input file.
     * Starts a watch process on a file with errors and checks if errors are reported.
     */
    var watchProcess  =  exec ( cssnextBin + " --watch test/fixtures/cli.error.css test/fixtures/cli.output--watch.css" ,  function ( err )  {
      t . ok ( err  &&  err . signal  ===  "SIGTERM" ,  "should only be killed by an interrupt when `--watch` option passed" )
      if  ( err  &&  ! err . killed )  {
        throw  err
      }
    } )

    var msgWatch  =  "should output error messages when `--watch` option passed"
    var watchTimeout  =  setTimeout ( function ( )  {
      t . fail ( msgWatch )
      watchProcess . kill ( )
    } ,  5000 )
    watchProcess . stderr . on ( "data" ,  function ( data )  {
      if  ( utils . contains ( data ,  "encounters an error" ) )  {
        t . pass ( msgWatch )
        clearTimeout ( watchTimeout )
        watchProcess . kill ( )
      }
    } )
    planned += 2

    /*
     * Sub-test 16.2: Watch for imported files.
     * Verifies that the watcher also monitors files that are imported.
     */
    var watchOut            =  "test/fixtures/cli.output--watch-import.css"
    var watchImportProcess  =  exec ( cssnextBin + " --watch test/fixtures/cli.watch-import.css "  +  watchOut ,  function ( err )  {
      if  ( err  &&  ! err . killed )  {
        throw  err
      }
    } )

    // Using /**/ as content for empty files to make watch work reliably.
    fs . writeFileSync ( "test/fixtures/cli.watch-import.css" ,  "/**/ @import 'cli.watch-import-import.css';" )

    // Allow time for the watcher to detect changes and process.
    setTimeout ( function ( )  {
      // Check if the output file has been updated by the watcher.
      t . equal ( fs . readFileSync ( watchOut ,  { encoding : "utf8" } ) ,  "/**/ watch{}" ,  "should update the file" )

      // Modify the source file again, removing the import.
      fs . writeFileSync ( "test/fixtures/cli.watch-import.css" ,  "/**/" )

      // Wait again for the watcher to re-process.
      setTimeout ( function ( )  {
        t . equal ( fs . readFileSync ( watchOut ,  { encoding : "utf8" } ) ,  "/**/" ,  "should update the file, again" )

        // Get the modification time of the output file.
        var outStat  =  fs . statSync ( watchOut )
        setTimeout ( function ( )  {
          // Trigger a change in the previously imported file (which should no longer be watched).
          var now  =  ( new Date ( ) ) . getTime ( )
          fs . utimesSync ( "test/fixtures/cli.watch-import-import.css" ,  now ,  now )

          setTimeout ( function ( )  {
            // Verify that the output file's modification time has NOT changed.
            var outStatAfter  =  fs . statSync ( watchOut )
            t . equal ( outStat . mtime . getTime ( ) ,  outStatAfter . mtime . getTime ( ) ,  "should not modify a file if a previously imported file is modified" )

            // Clean up and kill the watch process.
            utils . remove ( "cli.output--watch-import" )
            watchImportProcess . kill ( )
          } ,  2000 )
        } ,  2000 )
      } ,  2000 )
    } ,  4000 )

    planned += 3
  }

  // Final assertion to ensure all planned tests were executed.
  t . plan ( planned )
} )