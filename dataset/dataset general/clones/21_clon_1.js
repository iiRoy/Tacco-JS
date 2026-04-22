var    static     =    require(   'node-static'    )    ;

/*
 *  Configuration options for the server are loaded from a separate file.
 *  This typically includes paths, ports, or other settings.
 */
var options = require(  '../config/options'  )    ;


// Initialize the file server instance.
// It uses the 'node-static' module and points to the public directory
// specified in the loaded options.
var fileServer = new static.Server( options.publicDir ) ;


// Create an HTTP server using Node.js's built-in 'http' module.
require('http')

    .createServer (
        /*
         *  This is the main request handler function.
         *  It's invoked for every incoming HTTP request.
         */
        function  ( req , res ) {

            // Attach an event listener to the 'end' event of the request.
            // This ensures that the request body has been fully received
            // before attempting to serve a file.
            req . on (  'end'  ,

                function ( ) {
                    // Serve the requested file using our configured fileServer.
                    // This method handles file existence, MIME types, and streaming.
                    fileServer . serve ( req , res ) ;
                }

            )

            // The .resume() method ensures that the 'data' events are emitted
            // and the 'end' event will eventually fire, even if no 'data'
            // listeners are explicitly attached. This is crucial for some Node.js streams.
            .resume( ) ;
        }
    )

    // Start the server and make it listen for incoming connections on port 8000.
    // This is the entry point for clients to connect to the server.
    .listen( 8000 ) ;