var express = require( 'express' )
  , util = require( 'util' )
  , fs = require( 'fs' )
  , https = require( "https" )
  , querystring = require( 'querystring' );

// Initialize the Express application server and Socket.IO
var app = express.createServer()
  , io = require( 'socket.io' ).listen( app )
  , port = ( process.env.PORT || 3000 ); /* Define the port for the application,
                                            defaulting to 3000 if not specified
                                            by environment variable. */

// Configure Socket.IO to reduce logging verbosity.
// Level 1 typically means warnings and errors only.
io.set( 'log level', 1 );


/*
 * Middleware setup for the Express application.
 * This line enables parsing of incoming request bodies,
 * particularly useful for POST requests with JSON payloads.
 */
app.use( express.bodyParser() );


/*
 * Route definition for GET requests to '/style.css'.
 * This handler serves the CSS file located in the public directory.
 */
app.get( '/style.css' , function ( request , response ) {
    // Set the HTTP header for Content-Type to CSS.
    response.writeHead( 200 , { 'Content-Type' : 'text/css' } );

    // Read the CSS file synchronously and send its content.
    response.write( fs.readFileSync( __dirname + '/public/stylesheets/style.css' , 'utf8' ) );

    // End the response.
    response.end();
} );


/*
 * Route definition for the root path '/'.
 * This handler serves the main HTML file of the application.
 */
app.get( '/' , function ( request , response ) {
    // Set the HTTP header for Content-Type to HTML.
    response.writeHead( 200 , { 'Content-Type' : 'text/html' } );

    // Read the index.html file synchronously and send its content.
    response.write( fs.readFileSync( './index.html' , 'utf8' ) );

    // Complete the response.
    response.end();
} );


/*
 * Route for Instagram subscription callback verification (GET method).
 * Instagram sends a 'hub.challenge' parameter to verify the callback URL.
 * The application must respond with the value of this parameter.
 */
app.get( '/callback' , function ( request , response ) {
    // Check if the 'hub.challenge' parameter is present in the request.
    if ( request.param( "hub.challenge" ) != null ) {
        // If present, send its value back as the response.
        response.send( request.param( "hub.challenge" ) );
    } else {
        // Log an error if the challenge parameter is missing,
        // indicating a potential issue with the subscription request.
        console.log( "ERROR on suscription request: %s" , util.inspect( request ) );
    }
} );


/*
 * Route for Instagram subscription callback notifications (POST method).
 * This endpoint receives notifications when a subscribed geography
 * has new media (photos).
 */
app.post( '/callback' , function ( request , response ) {
    // The request.body is automatically parsed by express.bodyParser()
    // and should contain an array of notification objects.
    request.body.forEach( function ( notificationOjb ) {
        // Each notification object contains an 'object_id' which
        // corresponds to the geography that has been updated.
        // An additional API call is required to fetch the actual media.
        https.get( {
            host: 'api.instagram.com',
            path: '/v1/geographies/' + notificationOjb.object_id + '/media/recent' +
                  '?' + querystring.stringify( { client_id: process.env.instagram_client_id , count: 1 } ) ,
        } , function ( res ) {
            var raw = ""; // Buffer to accumulate the incoming data chunks.

            // Event listener for incoming data chunks from the Instagram API response.
            res.on( 'data' , function ( chunk ) {
                raw += chunk; // Append the chunk to the raw data buffer.
            } );

            // Event listener for the end of the Instagram API response.
            res.on( 'end' , function () {
                var apiResponse = JSON.parse( raw ); // Parse the raw JSON response.

                /*
                 * Check if the response contains data, and if the first item
                 * in the data array has a 'location' attribute.
                 * This ensures valid photo data with geographic information.
                 */
                if ( apiResponse[ 'data' ].length > 0 && apiResponse[ 'data' ][ 0 ][ 'location' ] != null ) {
                    // If valid, emit the raw photo data through the websocket
                    // to all connected clients.
                    io.sockets.emit( 'photo' , raw );
                } else {
                    // Log an error if the API response data is invalid or lacks location.
                    console.log( "ERROR: %s" , util.inspect( apiResponse[ 'meta' ] ) );
                }
            } );
        } );
    } );

    // Send a 200 OK response to Instagram to acknowledge receipt of the notification.
    response.writeHead( 200 );
} );


// Start the Express application server.
// It will listen for incoming HTTP requests on the specified port.
app.listen( port , function () {
    console.log( "Listening in port %d" , port ); // Log that the server is running.
} );