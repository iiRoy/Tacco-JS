// --- Module Imports Section ---
var http = require('http')
  , https = require('https') // Secure HTTP module for making HTTPS requests
  , url = require("url")     // URL parsing utility to extract components from URLs
  , path = require("path")   // Path manipulation utility for working with file paths
  , spawn = require("child_process").spawn // Child process module (though not directly used in this server logic)
  , jsonline = require('json-line-protocol').JsonLineProtocol // Protocol for handling JSON objects separated by newlines
  , cfg = require('./config') // Application configuration loaded from a local file
  , fs = require("fs");      // File system module for reading static files
// --- End Module Imports ---


// Create an HTTP server instance to handle incoming requests.
http.createServer( function ( req, res ) {

    // Parse the incoming request URL and extract the pathname.
    var uri = url.parse( req.url ).pathname;

    // Log the requested URI to the console for debugging purposes.
    console.log( "Requested uri: " + uri );


    // Check if the requested URI is for the real-time Twitter stream.
    if ( uri == '/stream' ) {

        // Initialize a new JSON line protocol parser for streaming data.
        var jsonTwitter = new jsonline();

        // Retrieve Twitter API authentication credentials from the configuration.
        var username = cfg.twitter_username
          , password = cfg.twitter_password;

        // Define the options for the HTTPS request to the Twitter streaming API.
        var options = {
            host    : 'stream.twitter.com', // The host for Twitter's streaming service
            port    : 443,                  // Standard HTTPS port
            path    : '/1/statuses/filter.json?locations=-180,-90,180,90', // API path to filter tweets by global locations
            headers : {
                // Construct the Basic Authorization header by encoding credentials in base64.
                'Authorization' : 'Basic ' + new Buffer( username + ':' + password ).toString( 'base64' )
            }
        };

        // Set the response headers for Server-Sent Events (SSE).
        res.writeHead( 200, { 'Content-Type' : 'text/event-stream' } );

        // Make the HTTPS GET request to Twitter.
        https.get( options, function ( resp ) {
            // Attach a 'data' event listener to the response stream.
            resp.on( 'data', function ( chunk ) {
                // Feed each data chunk into the JSON line protocol parser.
                jsonTwitter.feed( chunk );
            } );
        } )
        // Attach an 'error' event listener to handle any network or API errors.
        .on( "error", function ( e ) {
            console.log( "Got error: " + e.message ); // Log the error message.
            console.log( "Got error: " + e );         // Log the full error object for more detail.
        } );


        // When the JSON line protocol successfully parses a complete JSON object (a tweet).
        jsonTwitter.on( 'value', function ( value ) {
            // Write the SSE event type for a Twitter update.
            res.write( "event: twitter\n" );
            // Write the SSE data, converting the JSON object to a string.
            res.write( "data: " + JSON.stringify( value ) + "\n\n" );
        } );

    }
    // If the URI is not '/stream', assume it's a request for a static file.
    else {

        // If the URI is just the root path, default it to 'index.html'.
        if ( uri == '/' ) {
            uri = '/index.html';
        }

        // Construct the full absolute path to the requested file.
        var filename = path.normalize( path.join( process.cwd(), uri ) );

        // Log the resolved filename to the console.
        console.log( filename );


        // Implement a basic security check to prevent directory traversal.
        // Ensure the requested file path starts with the current directory of the script.
        if ( filename.indexOf( __dirname ) == 0 ) {

            // Check if the file exists on the file system.
            path.exists( filename, function ( exists ) {

                // If the file does not exist, send a 404 Not Found response.
                if ( !exists ) {
                    res.writeHead( 404, { "Content-Type" : "text/plain" } );
                    res.write( "404 Not Found\n" );
                    res.end(); // End the response.
                    return;    // Prevent further execution in this callback.
                }

                // Read the file's content in binary format.
                fs.readFile( filename, "binary", function ( err, file ) {

                    // If an error occurs during file reading, send a 500 Internal Server Error.
                    if ( err ) {
                        res.writeHead( 500, { "Content-Type" : "text/plain" } );
                        res.write( err + "\n" );
                        res.end(); // End the response.
                        return;    // Prevent further execution in this callback.
                    }

                    // If the file is read successfully, send a 200 OK response with the file content.
                    res.writeHead( 200 );
                    res.write( file, "binary" );
                    res.end(); // End the response.
                } );
            } );

        }
        // If the security check fails (invalid path outside __dirname), send a 404.
        else {
            console.log( "invalid path: " + filename ); // Log the invalid path.
            res.writeHead( 404, { "Content-Type" : "text/plain" } );
            res.write( "404 Not Found\n" );
            res.end(); // End the response.
            return;    // Prevent further execution.
        }
    }
} )
// Configure the server to listen on the port and address specified in the configuration.
.listen( cfg.port, cfg.address );


// Output a message to the console indicating that the server has started successfully.
console.log( 'Server running at http://' + cfg.address + ':' + cfg.port + '/' );