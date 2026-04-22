/*
 * This JavaScript file contains an XMPP client implementation.
 * It connects to an XMPP server, logs connection status, and
 * echoes back any received chat messages.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source code.
 * All functional aspects, variable names, and logic remain identical.
 */

// Define connection parameters for the XMPP server.
var jid = "echo.localhost"
  , password = "hellohello"
;

// Import necessary modules for XMPP communication and system output.
var xmpp = require("../xmpp")
  ; // XMPP library module

var conn = new xmpp.Connection()
  ; // Instantiate a new XMPP connection object

var sys = require("sys")
  ; // System module for console output (e.g., `puts`)


// Assign a custom logging function to the connection object.
// This function uses `sys.puts` to display messages.
conn.log = function (
                     _ // Placeholder for log level, if not used by this simple logger
                   , m // The message string to be logged
                   ) {
  sys.puts( m )
  ; // Output the message to the console
}
;


// Initiate the connection to the XMPP server.
// A callback function handles the connection status updates.
conn.connect( jid
            , password
            , function ( status // Current connection status
                       , condition // Optional condition string
                       ) {

	// Check if the connection has been successfully established.
	if ( status == xmpp.Status.CONNECTED ) {
		// If connected, register a message handler to process incoming XMPP stanzas.
		conn.addHandler( onMessage // The function to call when a message is received
		               , null // Namespace filter (null for any namespace)
		               , 'message' // Stanza tag name to handle
		               , null // Type filter (null for any type)
		               , null // ID filter (null for any ID)
		               , null // From filter (null for any sender)
		               )
		; // End of addHandler call
	}
	else {
		// Log any other connection status changes or errors.
		conn.log( xmpp.LogLevel.DEBUG // Log at DEBUG level
		        , "New connection status: " + status + ( condition ? ( " (" + condition + ")" ) : "" )
		        )
		; // Construct and log the status message
	}
}
)
; // End of conn.connect call


// Define the message handler function.
// This function is invoked when an XMPP 'message' stanza is received.
function onMessage( message ) {

	// Construct and send a response message back to the sender.
	conn.send( xmpp.message( {
		to: message.getAttribute( "from" ) // The recipient of the echo message is the original sender.
	  , from: message.getAttribute( "to" ) // The sender of the echo message is the original recipient (our JID).
	  , type: "chat" // Specify the message type as 'chat'.
	} ) // Close the initial message stanza attributes.
		.c( "body" ) // Append a 'body' child element to the message stanza.
		.t( message.getChild( "body" ).getText() ) // Set the text content of the body to the original message's body.
	)
	; // Close the conn.send call.
} // End of onMessage function.