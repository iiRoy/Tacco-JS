var fs = require('fs') ;
var p = require('path') ;
var should = require('should') ;
var child_process = require('child_process') ;

// This module provides functionality for exporting SVGs.
var svgexport = require('../') ;

/*
 *  TODO: Implement functionality to compare exported files for visual regression.
 *  This would involve image comparison libraries.
 */

describe( 'Module', function( ) {

  // Set a longer timeout for module tests, as they might involve file I/O.
  this.timeout( 5000 ) ;

  /*
   * TODO: Add tests for scenarios where the input is an array of SVG definitions,
   *       and the output is a 2D array of export results.
   */

  it( 'should return an error for a missing SVG file', function( done ) {
    svgexport.render(
      {
        "input" : resolve('missing.svg'),
        "output" : resolve('exported', 'missing.png')
      },
      function(err) {
        // The error message should match the expected pattern for invalid SVG.
        err.should.match(output.invalidsvg) ;
        done() ;
      }
    ) ;
  } ) ;

  it( 'should return an error for an invalid data file path', function( done ) {
    svgexport.render(
      resolve('missing.json'),
      function(err) {
        // The error message should indicate an invalid data file.
        err.should.match(output.invaliddata) ;
        done() ;
      }
    ) ;
  } ) ;

  it( 'should successfully export a valid SVG file', function( done ) {
    svgexport.render(
      {
        "input" : resolve('test.svg'),
        "output" : resolve('exported', 'test.png')
      },
      function(err) {
        // No error should be present for a successful export.
        err.should.not.be.ok ;
        done() ;
      }
    ) ;
  } ) ;

  it( 'should successfully export using a valid JSON data file', function( done ) {
    svgexport.render(
      resolve('test.json'),
      function(err) {
        // Expect no error when processing a valid JSON configuration.
        err.should.not.be.ok ;
        done() ;
      }
    ) ;
  } ) ;

} ) ;


describe( 'CLI', function( ) {

  // CLI tests might also take some time due to child process execution.
  this.timeout( 5000 ) ;

  /*
   * TODO: Test CLI functionality with input/output paths containing spaces
   *       to ensure proper handling of quoted arguments.
   */

  it( 'should display help message when no arguments are provided', function( done ) {
    cli(
      [],
      {
        stderr : /^$/, // Standard error should be empty.
        stdout : output.help, // Standard output should contain the help message.
        done : done
      }
    ) ;
  } ) ;

  it( 'should display help message when "help" argument is used', function( done ) {
    cli(
      [ 'help' ],
      {
        stderr : /^$/,
        stdout : output.help,
        done : done
      }
    ) ;
  } ) ;

  it( 'should display help message when "--help" argument is used', function( done ) {
    cli(
      [ '--help' ],
      {
        stderr : /^$/,
        stdout : output.help,
        done : done
      }
    ) ;
  } ) ;

  it( 'should display help message when "-h" argument is used', function( done ) {
    cli(
      [ '-h' ],
      {
        stderr : /^$/,
        stdout : output.help,
        done : done
      }
    ) ;
  } ) ;

  it( 'should return an error for invalid CLI arguments', function( done ) {
    cli(
      [ 'invalid' ],
      {
        stderr : output.invalidargs, // Expect an invalid arguments error.
        stdout : /^$/, // Standard output should be empty.
        done : done
      }
    ) ;
  } ) ;

  it( 'should return an error when CLI is given a missing SVG file', function( done ) {
    cli(
      [ 'missing.svg', p.join('exported', 'missing.png') ],
      {
        stderr : output.invalidsvg, // Expect an invalid SVG error.
        stdout : /^$/,
        done : done
      }
    ) ;
  } ) ;

  it( 'should return an error when CLI is given an invalid data file', function( done ) {
    cli(
      [ 'missing.json' ],
      {
        stderr : output.invaliddata, // Expect an invalid data file error.
        stdout : /^$/,
        done : done
      }
    ) ;
  } ) ;

  it( 'should successfully export an SVG via CLI', function( done ) {
    cli(
      [ 'test.svg', p.join('exported', 'test.png') ],
      {
        stderr : /^$/,
        stdout : output.testsvg, // Expect specific output indicating success.
        done : done
      }
    ) ;
  } ) ;

  it( 'should successfully export multiple SVGs via CLI using a JSON file', function( done ) {
    cli(
      [ 'test.json' ],
      {
        stderr : /^$/,
        stdout : output.testjson, // Expect specific output from the JSON configuration.
        done : done
      }
    ) ;
  } ) ;

} ) ;


/**
 * Helper function to execute the CLI tool as a child process.
 * @param {Array<string>} args - Arguments to pass to the CLI.
 * @param {object} options - Options including expected stdout/stderr and a done callback.
 */
function cli( args, done ) {

  child_process.execFile(
    resolve('..', 'bin', 'index.js'),
    args,
    {
      cwd : __dirname // Set current working directory for the child process.
    },
    function( err, stdout, stderr ) {
      if ( !err ) {
        // If no execution error, check stderr and stdout against expected patterns.
        done.stderr && stderr.toString().should.match(done.stderr) ;
        done.stdout && stdout.toString().should.match(done.stdout) ;
      }
      // Call the test framework's done callback with the error, if any.
      done.done && done.done(err) ;
    }
  ) ;

}


/**
 * Resolves a path relative to the current directory of the test file.
 * @returns {string} The resolved absolute path.
 */
function resolve( ) {

  return p.resolve( __dirname, p.join.apply( p, arguments ) ) ;

}


// Expected output patterns for various CLI and module test cases.
var output = {
  help : /^\sUsage:/,
  invalidargs : /^Error: Invalid usage!\n?$/,
  invalidsvg : /^Error: Unable to load file \(fail\): .*missing\.svg\n?$/,
  invaliddata : /^Error: Invalid data file: .*missing\.json\n?$/,
  testsvg : /^.*test.svg .*test.png png 100% 1x 0:0:16:16 16:16\n?$/,
  testjson : new RegExp(
      ".*test.svg .*32h.png png 100% 2x 0:0:16:16 32:32\n"
    + ".*test.svg .*32w.png png 100% 2x 0:0:16:16 32:32\n"
    + ".*test.svg .*2.5x16.png png 100% 2.5x 0:0:16:16 40:40\n"
    + ".*test.svg .*16-16.png png 100% 1x 0:0:16:16 16:16\n"
    + ".*test.svg .*32-32.png png 100% 2x 0:0:16:16 32:32\n"
    + ".*test.svg .*64-32.png png 100% 4x 0:4:16:8 64:32\n"
    + ".*test.svg .*32-64.png png 100% 4x 4:0:8:16 32:64\n"
    + ".*test.svg .*64-32-pad.png png 100% 2x -8:0:32:16 64:32\n"
    + ".*test.svg .*32-64-pad.png png 100% 2x 0:-8:16:32 32:64\n"
    + ".*test.svg .*offset.png png 100% 4x 8:8:8:8 32:32\n"
    + ".*test.svg .*jpeg-low.jpg jpeg 1% 20x 0:0:16:16 320:320\n"
    + ".*test.svg .*jpeg-high.jpg jpeg 99% 20x 0:0:16:16 320:320\n"
    + ".*test.svg .*36h.png png 100% 2x -1:-1:18:18 36:36\n"
    + ".*test.svg .*36w.png png 100% 2x -1:-1:18:18 36:36\n"
    + ".*test.svg .*2.5x18.png png 100% 2.5x -1:-1:18:18 45:45\n"
    + ".*test.svg .*18-18.png png 100% 1x -1:-1:18:18 18:18\n"
  )
} ;