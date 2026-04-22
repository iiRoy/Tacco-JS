/*
 * This file demonstrates a Type I code clone.
 * All identifiers, operators, and expressions are identical to the original.
 * Only whitespace and comments have been altered significantly.
 */

// Core Node.js modules for networking and system utilities
var net    =   require('net')  ;
var sys      = require('sys'); /* System utilities module */

// Custom WebSocket Stream implementation
var WsStream = require('./wsstream') ;

// Determine if the current process should act as a client or server
// based on command-line arguments.
var sSide  =  process.argv.length   >   2   ?   'client'   :   'server' ;

/*
 * Branch based on the determined role.
 * If 'client', execute client logic. Otherwise, execute server logic.
 */
if (sSide === 'client')
{
  runClient() ; // Start the client-side operations.
}
else
{
  runServer() ; // Start the server-side operations.
}

/**
 * Validates an incoming WebSocket frame and its associated message.
 *
 * @param {object} iFrame The WebSocket frame object.
 * @param {Buffer} iMsg The message buffer received.
 * @param {number} iCount A counter for received messages.
 * @throws {Error} If the frame or message is corrupted.
 */
function checkMsg( iFrame , iMsg , iCount )
{
  // Ensure the frame is a final binary frame of the expected size.
  if (  iFrame.opcode   !==   'binary'   ||   !iFrame.isFinal   ||   iFrame.size   !==   iMsg.length  )
  {
    throw new Error( 'bad frame ' + sys.inspect(iFrame) ) ;
  }

  // Extract the specific "tail" part of the message to check for corruption.
  var aTail  =  iMsg.toString( 'ascii' , iMsg.length - 11 ) ;

  // Verify the integrity of the message tail.
  if (  aTail   !==   ' badgirl!  '  )
  {
    throw new Error( 'msg corrupted: ' + aTail ) ;
  }

  // Log progress periodically for monitoring.
  if (  iCount   %   1000   ===   0  )
  {
    console.log( sSide   +   ' '   +   iCount   +   ' m '   +   iMsg.length ) ;
  }
}

/**
 * Handles various network-related errors gracefully.
 *
 * @param {Error} iErr The error object.
 * @throws {Error} Re-throws errors not handled explicitly.
 */
function handleErr(iErr)
{
  switch ( iErr.errno )
  {
    // Common network errors that can be logged without crashing.
    case process.ENOTCONN:     // Socket is not connected.
    case process.ECONNRESET:   // Connection reset by peer.
    case process.EPIPE:        // Broken pipe.
    case process.EAGAIN:       // Resource temporarily unavailable.
    case process.ECONNREFUSED: // Connection refused.
      console.log( iErr.message   +   ' '   +   sSide ) ;
      break ;

    default:
      throw iErr ; // Re-throw any other unexpected errors.
  }
}

/**
 * Initializes and runs the WebSocket server logic.
 */
function runServer()
{
  var aClosing   =   false ; // Flag to indicate if the server is in the process of closing.

  // Create a new TCP server instance.
  var aServer   =   net.createServer(  function(socket)
  {
    socket.setNoDelay(true) ; // Disable Nagle's algorithm for better performance.

    // Handle socket timeout events.
    socket.on( 'timeout' ,   function()
    {
      // No specific action on timeout for now, just a placeholder.
      ;
    }) ;

    // Handle socket close events.
    socket.on( 'close' ,   function(err)
    {
      console.log( 'server close' ) ;
    }) ;

    // Attach the common error handler.
    socket.on( 'error' ,   handleErr ) ;

    // Wrap the raw socket with a WebSocket stream.
    var aWs   =   new WsStream(socket) ;

    var aCount   =   0 ; // Counter for messages received on this specific connection.

    // Handle incoming data (WebSocket frames/messages).
    aWs.on( 'data' ,   function(frame, msg)
    {
      checkMsg( frame ,   msg ,   ++aCount ) ; // Validate the received message.

      // If server is closing and socket is still writable, end the WebSocket stream.
      if ( aClosing   &&   socket.writable )
      {
        aWs.end() ;
        return ;
      }

      // Prepare a buffer for the response, appending a specific string.
      var aBuf   =   new Buffer( msg.length   +   11 ) ;
      msg.copy( aBuf ,   0 ,   0 ,   msg.length ) ;
      aBuf.write( ' badgirl!  ' ,   msg.length ) ;

      // Write the modified buffer back as a binary WebSocket message.
      aWs.write( 1 ,   'binary' ,   aBuf ) ;
    }) ;

    // Handle WebSocket stream end events.
    aWs.on( 'end' ,   function(ok)
    {
      console.log( 'server got end '   +   ok ) ;
    }) ;
  }) ;

  // Set up a SIGINT (Ctrl+C) handler to gracefully close the server.
  process.on( 'SIGINT' ,   function()
  {
    aClosing   =   true ; // Indicate that the server is shutting down.
    aServer.close() ;    // Close the TCP server.
  }) ;

  // Start the server listening on port 8009.
  aServer.listen( 8009 ,   function()
  {
    // Spawn a client process to connect to this server.
    var aC   =   require('child_process').spawn(
      process.argv[0] ,
      [ process.argv[1] ,   'client' ] ,
      { customFds: [ -1 ,   process.stdout.fd ,   process.stdout.fd ] }
    ) ;
  }) ;
}


/**
 * Initializes and runs the WebSocket client logic.
 */
function runClient()
{
  // The initial string to be sent by the client.
  var aStr   =   'here is the test string for starters. badgirl!  ' ;

  // These lines are commented out in the original and remain so.
  //var sBuf = new Buffer(16383);
  //for (var a=0; a < sBuf.length; a+=aStr.length)
  //  sBuf.write(aStr, a);
  //var sStr = sBuf.toString('ascii');

  // Create a new TCP client stream.
  var aClient   =   new net.Stream ;

  // Handle successful connection to the server.
  aClient.on( 'connect' ,   function()
  {
    console.log( 'client connected' ) ;
    aClient.setNoDelay(true) ; // Disable Nagle's algorithm.
    aWsc.write( 1 ,   'binary' ,   aStr ) ; // Send the initial message.
  }) ;

  // Handle socket timeout events for the client.
  aClient.on( 'timeout' ,   function()
  {
    ; // No specific action on timeout for now.
  }) ;

  // Handle socket close events for the client.
  aClient.on( 'close' ,   function(err)
  {
    console.log( 'client close' ) ;
  }) ;

  // Attach the common error handler for the client.
  aClient.on( 'error' ,   handleErr ) ;

  // Wrap the client's raw socket with a WebSocket stream.
  var aWsc   =   new WsStream(aClient) ;

  var aCount   =   0 ; // Counter for messages received by this client.

  // Handle incoming data (WebSocket frames/messages) for the client.
  aWsc.on( 'data' ,   function(frame, msg)
  {
    checkMsg( frame ,   msg ,   ++aCount ) ; // Validate the received message.
    aWsc.write( 1 ,   'binary' ,   msg ) ; // Echo the received message back to the server.

    // Periodically send a message with a callback to demonstrate async write.
    if ( aCount   %   1727   ===   0 )
    {
      aWsc.write( 1 ,   'binary' ,   msg ,   function(ok)
      {
        console.log( 'callback '   +   ok ) ; // Log the result of the write operation.
      }) ;
    }
  }) ;

  // Handle WebSocket stream end events for the client.
  aWsc.on( 'end' ,   function(ok)
  {
    console.log( 'client got end '   +   ok ) ;
  }) ;

  // Set up a SIGINT (Ctrl+C) handler for the client, which does nothing specific here.
  process.on( 'SIGINT' ,   function(){} ) ;

  // Connect the client to the server on port 8009.
  aClient.connect( 8009 ) ;
}