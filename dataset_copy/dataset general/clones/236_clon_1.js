/*
 * This is a server-side JavaScript application
 * using Node.js modules for web functionality.
 *
 * It handles map testing submissions and orchestrates
 * communication with external map test servers.
 */

// Core Node.js modules for networking and file system operations.
var http = require('http') ; // HTTP module for making requests.
var FormData = require('form-data') ; // For handling multipart/form-data.
var fs = require('fs') ; // File System module for file operations.

// Express.js framework for building web applications.
var express = require('express') ;

// Event handling utilities.
var EventEmitter = require('events').EventEmitter ; // Base class for event emitters.
var util = require('util') ; // Utility module, includes inherits.


// Initialize the Express application instance.
var app = express ( ) ;


// Configure Express middleware for the application.

// Serve static files from the 'static' directory.
app.use ( express.static ( 'static' ) ) ;


// Middleware to parse URL-encoded bodies (e.g., from HTML forms).
app.use ( express.urlencoded ( ) ) ;
// Middleware to parse JSON bodies (e.g., from API requests).
app.use ( express.json ( ) ) ;


// Define a custom class 'DeferredData' that extends EventEmitter.
function DeferredData ( payload ) {
    // Call the constructor of the parent EventEmitter class.
    EventEmitter.call ( this ) ;
    // Assign the provided payload to an instance property.
    this.payload = payload ;
}
// Establish the inheritance chain from EventEmitter for DeferredData.
util.inherits ( DeferredData, EventEmitter ) ;

// Add a 'pause' method to the DeferredData prototype.
DeferredData.prototype.pause = function ( ) {
    console.log ( 'pause' ) ; // Simply logs a message indicating a pause.
} ;

// Add a 'resume' method to the DeferredData prototype.
DeferredData.prototype.resume = function ( ) {
    console.log ( 'resume' ) ; // Logs a message indicating resumption.

    // Schedule the data emission to happen in the next tick of the event loop.
    process.nextTick ( function ( ) {
        console.log ( 'sending' , this.payload ) ; // Log what payload is being sent.
        this.emit ( 'data' , this.payload ) ; // Emit the 'data' event with the stored payload.
        this.emit ( 'end' ) ; // Emit the 'end' event to signal completion.
    } . bind ( this ) ) ; // Ensure 'this' context refers to the DeferredData instance.
} ;


// Define a POST route for '/test' to handle map submission requests.
app.post ( '/test' , function ( req , res ) {
    // Parse the 'logic' field from the request body, expected to be a JSON string.
    var logic = JSON.parse ( req.body.logic ) ;
    // Decode the 'layout' field from base64 encoding into a Node.js Buffer.
    var layout = new Buffer ( req.body.layout , 'base64' ) ;
    
    // Determine the target URL for the map test server based on the 'eu' flag.
    if ( req.body.eu == 'true' )
      // If 'eu' is true, randomly select one of two European test map servers.
      var url = Math.random ( ) < 0.5 ? 'http://maptest.newcompte.fr/testmap' : 'http://justletme.be:8080/testmap' ;
    else
      // Otherwise, use the default North American test map server.
      var url = 'http://tagpro-maptest.koalabeast.com/testmap' ;

    /*
     * This entire block of code is commented out. It appears to be an older
     * or alternative implementation for submitting form data.
     * It demonstrates using the 'http.request' method directly for a POST request.
     * The original comments within it indicated placeholder file streams,
     * which have been preserved in their commented state.
     */
    /*
    var form = new FormData ( ) ;
    var request = http.request ( {
      method: 'post' ,
      host: 'tagpro-maptest.koalabeast.com' ,
      path: '/testmap' ,
      headers: form.getHeaders ( )
    } ) ;

    form.pipe ( request ) ;
    form.append ( 'logic' , fs.createReadStream ( '1.png' ) ) ; // Original comment: new Buffer(JSON.stringify(logic)));
    form.append ( 'layout' , fs.createReadStream ( '1.json' ) ) ; // Original comment: layout);


    request.on ( 'response' , function ( testServerRes ) {
      console.log ( testServerRes.headers ) ;
      console.log ( testServerRes.statusCode ) ;
      res.send ( JSON.stringify ( {
        location: testServerRes.headers.location
      } ) ) ;
      testServerRes.on ( 'data' , function ( d ) {
        console.log ( d.toString ( ) ) ;
      } ) ;
    } ) ;
    */
    
    
    // Create a new FormData instance for the actual submission.
    var form = new FormData ( ) ;
    
    // Write the parsed logic JSON to a temporary file 'temp.json'.
    fs.writeFileSync ( 'temp.json' , new Buffer ( JSON.stringify ( logic ) ) ) ;
    // Write the decoded layout buffer to a temporary file 'temp.png'.
    fs.writeFileSync ( 'temp.png' , layout ) ;

    // Append the temporary files as readable streams to the form data.
    form.append ( 'logic' , fs.createReadStream ( 'temp.json' ) ) ;
    form.append ( 'layout' , fs.createReadStream ( 'temp.png' ) ) ;
    
    // Submit the constructed form data to the determined URL.
    form.submit ( url , function ( err , testRes ) {
      // Check if an error occurred during the form submission.
      if ( err ) {
        // If there's an error, send a user-friendly error message.
        res.send ( 'Sorry, we could not start up a test map. ' + err.toString ( ) ) ;
      } else {
        // If submission is successful, resume the response stream from the test server.
        testRes.resume ( ) ;
        // Send the headers received from the test server back to the client.
        res.send ( testRes.headers ) ;
      }
    } ) ;
    
    /*
     * This is another commented-out block, similar in nature to the first one.
     * It represents a different approach to handling the HTTP request and response
     * using event listeners for 'data' and 'response' events directly on the request.
     * This section has also been preserved in its commented form.
     */
    /*
    var request = http.request ( {
      method: 'post' ,
      host: 'tagpro-maptest.koalabeast.com' ,
      path: '/testmap' ,
      headers: form.getHeaders ( )
    } ) ;

    form.pipe ( request ) ;
    
    
    form.on ( 'data' , function ( d ) {
      console.log ( d.toString ( ) ) ;
    } ) ;

    request.on ( 'response' , function ( res2 ) {
      console.log ( res2.headers ) ;
      console.log ( res2.statusCode ) ;
      res2.on ( 'data' , function ( d ) {
        console.log ( d.toString ( ) ) ;
      } ) ;
      res.send ( res2.headers ) ;
    } ) ;
*/

} ) ; // End of the app.post('/test') route handler definition.

// Start the Express server and make it listen for incoming requests on port 8060.
app.listen ( 8060 ) ; // The application is now active and ready to serve requests.