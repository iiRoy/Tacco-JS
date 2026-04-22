// This file contains utilities for interacting with the Inch CI tool.
// It supports both local execution of Inch and interaction with its API endpoint.

'use strict'; // Enforce strict mode for cleaner code and error prevention.


// --- Module Dependencies ---
// These modules are required for various operations like shell commands,
// file system access, HTTP requests, and path manipulation.
var sh   = require( 'shelljs' ),       // Shell utilities for cross-platform commands
    sys  = require( 'sys' ),         // System utilities (deprecated, but used here for print)
    Path = require( 'path' ),       // Path manipulation utilities
    exec = require( 'child_process' ).exec, // For executing external commands (though shelljs.exec is also used)
    http = require( 'http' ),       // For making HTTP requests to the Inch API
    fs   = require( 'fs' );         // For file system operations, like reading files


// --- Configuration Constants ---
// Defines the default API endpoint for the Inch CI service.
var CLI_API_END_POINT = 'http://inch-ci.org/api/v1/cli';


/**
 * Main entry point for running Inch analysis.
 * It intelligently decides whether to run Inch locally or via its API.
 *
 * @param {Array<string>} inch_args - An array of arguments to pass to the Inch tool.
 * @param {string} filename - The path to the file containing the code dump to be analyzed.
 * @param {Function} callback - A callback function to be executed after Inch completion (for local runs).
 */
function run ( inch_args, filename, callback )
{
    // Initialize inch_args to an empty array if not provided, ensuring it's always iterable.
    inch_args = inch_args || [ ];

    // Check if a local Inch installation is available.
    if ( hasLocalInch() )
    {
        // If local Inch is found, prepare default arguments for JavaScript and file reading.
        var default_args = [ "--language=javascript", "--read-from-dump=" + filename ];

        // Concatenate user-provided arguments with default arguments and run local Inch.
        runLocalInch( inch_args.concat( default_args ), callback );
    }
    else
    {
        // If no local Inch is found, fall back to using the Inch API.
        runApiInch( inch_args, filename );
    }
}


/**
 * Executes Inch analysis by sending the code dump to the Inch CI API.
 * This is used when a local Inch installation is not available.
 *
 * @param {Array<string>} inch_args - Arguments to pass to the Inch API.
 * @param {string} filename - Path to the file containing the code dump to send.
 */
function runApiInch ( inch_args, filename )
{
    // Ensure inch_args is an array, even if null or undefined.
    inch_args = inch_args || [ ];

    // Read the content of the specified file (assumed to be a JSON dump).
    var json = JSON.parse( fs.readFileSync( filename ) );

    // Add the Inch arguments to the JSON payload.
    json[ 'args' ] = inch_args;

    // Convert the modified JSON object back into a string for the request body.
    var data = JSON.stringify( json );

    // Parse the Inch CLI API endpoint URL.
    var url = require( 'url' ).parse( getInchCliEndPoint() );

    // Define the HTTP request options.
    var options = {
        host: url.hostname,         // Hostname from the parsed URL.
        port: url.port,             // Port from the parsed URL.
        path: url.path,             // Path from the parsed URL.
        method: 'POST',             // HTTP method is POST for sending data.
        headers: {
            'Content-Type': 'application/json', // Specify content type as JSON.
            'Content-Length': Buffer.byteLength( data, 'utf8' ) // Set content length for the request body.
        }
    };


    // Create the HTTP request.
    var req = http.request( options, function ( res )
    {
        res.setEncoding( 'utf8' ); // Set response encoding to UTF-8.

        // Event listener for incoming data chunks from the response.
        res.on( 'data', function ( chunk )
        {
            sys.print( chunk ); // Print the chunk to the console.
        } );
    } );


    // Event listener for request errors.
    req.on( 'error', function ( e )
    {
        console.log( 'problem with request: ' + e.message ); // Log any request errors.
    } );


    // Write the JSON data to the request body.
    req.write( data );

    // End the request, sending all buffered data.
    req.end();
}


/**
 * Executes the locally installed Inch tool with the given arguments.
 *
 * @param {Array<string>} args - Arguments to pass to the local Inch command.
 * @param {Function} callback - Callback function to receive the output of the command.
 */
function runLocalInch ( args, callback )
{
    // Construct the full command string.
    var cmd = getInchCmd() + ' ' + args.join( ' ' );

    // Execute the command using shelljs and pass its output to the callback.
    callback( sh.exec( cmd ).output );
}


/**
 * Determines the command or path to the Inch executable.
 * It first checks an environment variable, then tries to find it in the PATH.
 *
 * @returns {string|null} The command string for Inch, or null if not found.
 */
function getInchCmd ( )
{
    // Check if INCH_PATH environment variable is set.
    if ( process.env.INCH_PATH )
    {
        // If set, construct the full path to the Inch executable.
        return Path.join( process.env.INCH_PATH, "bin", "inch" );
    }
    else
    {
        // Otherwise, try to find 'inch' in the system's PATH.
        return sh.which( 'inch' );
    }
}


/**
 * Retrieves the Inch CLI API endpoint.
 * Prioritizes an environment variable over the default constant.
 *
 * @returns {string} The URL of the Inch CLI API endpoint.
 */
function getInchCliEndPoint ( )
{
    // Check if INCH_CLI_API environment variable is set.
    if ( process.env.INCH_CLI_API )
    {
        // If set, use the value from the environment variable.
        return process.env.INCH_CLI_API;
    }
    else
    {
        // Otherwise, use the predefined constant.
        return CLI_API_END_POINT;
    }
}


/**
 * Checks if a local Inch installation is available and executable.
 *
 * @returns {boolean} True if local Inch is found, false otherwise.
 */
function hasLocalInch ( )
{
    // A simple check: if getInchCmd returns a non-empty string (truthy), then Inch is available.
    // The double-negation (!!) converts the truthy/falsy value to a boolean.
    return !! getInchCmd( );
}


// --- Module Exports ---
// Expose the 'run' function as the primary interface of this module.
module.exports = {
  run: run // The 'run' property exports the 'run' function.
};