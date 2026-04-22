/*
 * This file sets up a simple HTTP server to demonstrate routing and
 * serving different content types based on the request URL.
 * It's designed for testing purposes, showcasing various endpoint behaviors.
 */

// Core Node.js modules for HTTP server and file system operations.
var http = require('http') , fs = require('fs') ;


// Create an HTTP server instance.
// This server will handle incoming requests and route them appropriately.
var httpSrv = http.createServer( function ( req , res ) {

    // Log the incoming request URL for debugging purposes.
    console.log ( "req.url" , req.url ) ;

    // Delegate the request handling to the RouteManager's findRoute method.
    RouteManager.findRoute ( req , res ) ;

} ) ; // End of http.createServer callback function.


// RouteManager object: responsible for mapping URLs to handler functions.
var RouteManager = {
    "findRoute" : function ( req , res ) {
        // Attempt to retrieve a handler function based on the request URL.
        var handler = this.routes [ req.url ] ;

        // If no handler is found for the given URL, throw an error.
        if ( ! handler ) {
            throw "cannot find route " + req.url ;
        }

        // Execute the found handler function, preserving the 'this' context.
        handler.call ( this , req , res ) ;
    } , // End of findRoute method.

    // 'routes' object: A collection of URL-to-handler mappings.
    "routes" : {

        // Handler for "/json" endpoint: serves a JSON file.
        "/json" : function ( req , res ) {
            // this.sleep(5000); // Optional: uncomment to simulate a blocking delay.

            // Read the JSON message from the local file system synchronously.
            var message = fs.readFileSync ( './message.json' , 'utf8' ) ;

            // Set HTTP status code to 200 (OK) and Content-Type header to application/json.
            res.writeHead ( 200 , { 'Content-Type' : 'application/json' } ) ;

            // Write the file content to the response body.
            res.write ( message.toString ( ) ) ;

            // End the HTTP response.
            res.end ( ) ;
        } ,

        // Handler for "/xml" endpoint: serves an XML file.
        "/xml" : function ( req , res ) {
            // Read the XML message from the local file system.
            var message = fs.readFileSync ( './message.xml' , 'utf8' ) ;

            // Set HTTP status code to 200 (OK) and Content-Type header to application/xml.
            res.writeHead ( 200 , { 'Content-Type' : 'application/xml' } ) ;

            // Write the XML content to the response body.
            res.write ( message.toString ( ) ) ;

            // End the HTTP response.
            res.end ( ) ;
        } ,

        // Handler for a specific URL with query parameters: demonstrates header interaction.
        "/120/json?arg1=hello&arg2=world" : function ( req , res ) {
            // Check if a custom "test-header" is present in the request.
            if ( ! req.headers [ "test-header" ] ) {
                throw "no test-header found!!" ;
            }

            // Set a response header named "test-response-header" with the value from the request's "test-header".
            res.setHeader ( "test-response-header" , req.headers [ "test-header" ] ) ;

            // Internally call the handler for the "/json" route to serve content.
            this.routes [ "/json" ] ( req , res ) ;
        } ,

        // Handler for "/json?post" endpoint: processes incoming POST data.
        "/json?post" : function ( req , res ) {
            // Attach an event listener for 'data' events on the request stream.
            req.on ( 'data' , function ( data ) {
                // Log the received data to the server console.
                console.log ( "[SERVER] data = " , data ) ;

                // Set HTTP status code to 200 (OK) and Content-Type to application/json.
                res.writeHead ( 200 , { 'Content-Type' : 'application/json' } ) ;
                // res.writeHead(200, {'Content-Type': 'text/plain'}); // Alternative: serve as plain text.

                // Write the received data back as the response body.
                res.write ( data.toString ( ) ) ;

                // End the HTTP response.
                res.end ( ) ;
            } ) ;

        } ,

        // Handler for "/json/empty" endpoint: sends an empty JSON response (204 No Content).
        "/json/empty" : function ( req , res ) {
            // Set HTTP status code to 204 (No Content) with JSON content type.
            res.writeHead ( 204 , { 'Content-Type' : 'application/json' } ) ;
            res.end ( ) ; // End response with no body.
        } ,

        // Handler for "/xml/empty" endpoint: sends an empty XML response (204 No Content).
        "/xml/empty" : function ( req , res ) {
            // Set HTTP status code to 204 (No Content) with XML content type.
            res.writeHead ( 204 , { 'Content-Type' : 'application/xml' } ) ;
            res.end ( ) ; // End response with no body.
        }

    } , // End of 'routes' object.

    /*
     * Utility method to simulate a blocking delay.
     * WARNING: This is a synchronous, blocking operation and should be used with caution
     * in a Node.js environment as it will block the event loop.
     */
    "sleep" : function ( ms ) {
        var stop = new Date ( ).getTime ( ) ;
        while ( new Date ( ).getTime ( ) < stop + ms ) {
            ; // Busy-wait loop to consume CPU cycles.
        }
    }

} ; // End of RouteManager object definition.


// Register an 'error' event listener for the HTTP server.
httpSrv.on ( 'error' , function ( err ) {
    // Log any errors encountered by the server.
    console.error ( 'error starting http test server' , err ) ;
} ) ;

// Instruct the HTTP server to begin listening for incoming connections on port 4444.
httpSrv.listen ( 4444 ) ;


// Output a confirmation message to the console once the server is listening.
console.log ( 'http server Listening on port ' + 4444 ) ;