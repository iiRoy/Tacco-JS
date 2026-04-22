/*
 * This JavaScript file manages a web-based terminal interface.
 * It establishes a WebSocket connection for real-time communication
 * and handles terminal input/output operations.
 */


window . start = function ( )
{
  // Declare all local variables at the beginning of the function scope.
  var div,
      l,
      socket,
      terminal;

  // Obtain the current document's location object to construct the WebSocket URL.
  l = document . location ;

  // Initialize a WebSocket connection using socket.io.
  // The connection URL is built from the current protocol and host.
  // The socket instance is also stored globally on the 'window' object for later access.
  socket = window . socket = io . connect ( l . protocol + "//" + l . host ) ;

  // Instantiate a new VT100 terminal emulator object.
  // It's initialized with 80 columns, 25 rows, and associated with the "terminal" ID.
  terminal = new VT100 ( 80 , 25 , "terminal" ) ;

  // Set up a character input handler for the terminal.
  // This function is called whenever a character is typed in the terminal.
  terminal . getch ( function ( ch , t )
  {
    // Emit the received character 'ch' over the WebSocket connection under the 'data' event.
    return socket . emit ( 'data' , ch ) ;
  } ) ;

  // Get a reference to the HTML div element that serves as the terminal display area.
  div = document . getElementById ( 'terminal' ) ;

  // Set the cursor visibility and state.
  // The cursor is set to visible (1) and blinking (true) within the 'div' element.
  terminal . curs_set ( 1 , true , div ) ;

  // Give focus to the terminal div element so it can receive keyboard input.
  div . focus ( ) ;

  // Register an event listener for incoming 'data' messages from the WebSocket server.
  socket . on ( 'data' , function ( data )
  {
    // Check if the received data matches a specific exit sequence.
    if ( data === "\r\nexit\r\n" )
    {
      leave ( ) ; // If it does, call the 'leave' function to terminate the session.
    }

    // Write the received data to the terminal display.
    return terminal . write ( data ) ;
  } ) ;

  // Register an event listener for the 'end' event, signaling the termination of the WebSocket connection.
  return socket . on ( 'end' , function ( data )
  {
    // Hide the terminal cursor when the session ends.
    terminal . curs_set ( 0 , true ) ;

    // Write any final data received before the connection closed to the terminal.
    return terminal . write ( data ) ;
  } ) ;
} ; // End of the 'start' function definition.


/*
 * This function handles the process of leaving or terminating the terminal session.
 * It sends a 'kill' command to the server if a socket connection is active.
 */
window . leave = function ( )
{
  var socket ; // Declare a local variable to hold the socket reference.

  // Check if a global socket connection exists (i.e., 'window.socket' is not null or undefined).
  if ( ( socket = window . socket ) != null )
  {
    // If a socket exists, emit a 'kill' event to the server to signal termination.
    socket . emit ( 'kill' ) ;
  }

  // Clear the global socket reference by setting it to null.
  // This effectively disconnects the client-side socket instance.
  return socket = null ;
} ;