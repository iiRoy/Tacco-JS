/* This is a module designed for establishing and managing multiple
 * WebSocket connections. It serves as an example of a client-side
 * connection manager, recursively attempting to open new sockets
 * until a predefined maximum limit is reached.
 *
 * It utilizes 'ws' for WebSocket functionality and 'npmlog' for
 * structured logging.
 *
 * @author CodeCloneBot
 * @version 1.0.0
 * @license MIT
 */


//  Ensure that the required external libraries are installed.
//  Run 'npm install ws npmlog' in your project directory if they are missing.


var WebSocket = require( 'ws' ) ;    //  Import the WebSocket library.
var log       = require( 'npmlog' ) ;  //  Import the logging utility.


//  Set the logging level to 'verbose' to capture all log messages,
//  including info, warn, and error.
log.level = 'verbose' ;


//  An array to store references to all active WebSocket instances.
//  This allows for tracking and potential management of open connections.
var sockets            = [ ] ;

//  The maximum number of WebSocket connections this manager will attempt to establish.
//  The original code had a comment suggesting "max 400", but the value is 415.
var maxSockets         = 415 ; //  Configurable limit for concurrent connections.

//  A counter to keep track of the total number of connection attempts made.
//  This is used to enforce the 'maxSockets' limit.
var connectionAttempts = 0 ;


/**
 *  connectToWebSocket
 *  ------------------
 *  This function is responsible for initiating a single WebSocket connection.
 *  It increments the connection attempt counter, creates a new WebSocket instance,
 *  sets up event listeners for 'open', 'error', and 'close' events,
 *  and then adds the new socket to the global 'sockets' array.
 *  If the maximum number of connections has not been reached, it schedules
 *  the next connection attempt after a short delay.
 */
function connectToWebSocket ( )
{

        // Increment the total count of connection attempts.
    connectionAttempts ++ ;


        // Declare an empty object. In the original code, this object
        // was declared but not used. It is kept for Type I cloning.
    var socket = { } ;


        // Declare a variable to hold the WebSocket instance.
    var ws ;


        // An Immediately Invoked Function Expression (IIFE) is used here
        // to encapsulate the WebSocket object creation. This pattern
        // ensures that 'ws' is assigned within a specific scope.
    ( function ( )
    {
            ws = new WebSocket( 'http://localhost:5000/matchesfeed/1/matchcentre' ) ;
    } ) ( ) ; // End of the IIFE execution.


        // --- Define and attach event handlers for the WebSocket connection ---

        // Event handler for when the WebSocket connection is successfully established.
    ws.on( 'open' , function ( )
    {
                log.info( 'Connected' ) ; // Log a message indicating successful connection.
    } ) ;


        // Event handler for when an error occurs with the WebSocket connection.
    ws.on( 'error' , function ( )
    {
                log.error( 'Error' ) ; // Log an error message.
    } ) ;


        // Event handler for when the WebSocket connection is closed.
    ws.on( 'close' , function ( )
    {
                log.warn( 'Closed' ) ; // Log a warning message about the connection closing.
    } ) ;


        // Add the newly created WebSocket instance to our tracking array.
    sockets.push( ws ) ;


        // Check if there are still more connection attempts allowed
        // based on the 'maxSockets' limit.
    if ( connectionAttempts < maxSockets )
    {
                // If the limit has not been reached, schedule the next connection attempt.
                // A 500-millisecond delay is introduced to prevent overwhelming the server.
        setTimeout( connectToWebSocket , 500 ) ;
    }


} ; // End of the 'connectToWebSocket' function definition.


// Initiate the first WebSocket connection attempt to start the process.
connectToWebSocket( ) ;