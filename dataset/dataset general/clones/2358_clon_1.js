/*
 * This file manages the XMPP connection and UI interactions for a simple page publisher.
 * Original Author: Unknown
 * Date: 2023-10-27 (Clone generation date)
 */

// Global variable to hold the Strophe connection object.
var connection = null;

// Global variable to track the currently published page number.
var current_page = 0;


/**
 * Publishes a given page number to the configured PubSub node.
 * Uses the global 'connection' object to interact with the XMPP server.
 *
 * @param {number} page The page number to be published.
 */
function publish ( page )
{
  // Perform the PubSub publish operation.
  // Note: PUBSUB_SERVER and PUBSUB_NODE are assumed to be globally defined constants.
  connection.pubsub.publish(
    connection.jid,             // The JID for the connection.
    PUBSUB_SERVER,              // The PubSub service JID.
    PUBSUB_NODE,                // The PubSub node name.
    [ page.toString() ],        // The item to publish (page number as a string in an array).
    log                         // Callback function for logging publish status/errors.
  );

  // Update the global current_page variable.
  current_page = page;
} // End of publish function


/**
 * Logs a message to the UI's '#log' element.
 * Prepends new messages so the latest is always at the top.
 *
 * @param {string} msg The message string to be logged.
 */
function log(msg)
{
  // jQuery selector to target the log area.
  $( '#log' ) . prepend( '<div></div>' ) . prepend( document.createTextNode( msg ) );
}


/**
 * Logs a debug message to the UI's '#debug' element.
 * Appends new messages to maintain chronological order.
 *
 * @param {string} msg The message string for debugging.
 */
function debug( msg )
{
    $( '#debug' ).append('<div></div>').append(document.createTextNode(msg));
}


/**
 * Handles raw incoming XMPP data.
 * Logs the received data using the debug function.
 *
 * @param {string} data The raw XMPP XML string received.
 */
function rawInput( data )
{
  debug( 'RECV: ' + data ); // Prefix with 'RECV: ' for clarity.
}


/**
 * Handles raw outgoing XMPP data.
 * Logs the sent data using the debug function.
 *
 * @param {string} data The raw XMPP XML string sent.
 */
function rawOutput( data )
{
  debug( 'SENT: ' + data ); // Prefix with 'SENT: ' for clarity.
}


/**
 * Callback function for Strophe connection status changes.
 * Updates UI and logs messages based on the connection status.
 *
 * @param {Strophe.Status} status The current connection status code.
 */
function onConnect( status )
{
  if ( status == Strophe.Status.CONNECTING )
  {
    // Strophe is currently attempting to establish a connection.
    log( 'Strophe is connecting.' );
  }
  else if ( status == Strophe.Status.CONNFAIL )
  {
    // The connection attempt failed.
    log( 'Strophe failed to connect.' );
    $( '#connect' ) . get( 0 ) . value = 'connect'; // Reset button text.
  }
  else if ( status == Strophe.Status.DISCONNECTING )
  {
    // Strophe is in the process of disconnecting.
    log( 'Strophe is disconnecting.' );
  }
  else if ( status == Strophe.Status.DISCONNECTED )
  {
    // Strophe has successfully disconnected.
    log( 'Strophe is disconnected.' );
    $( '#connect' ) . get( 0 ) . value = 'connect'; // Reset button text.
    $( '#log' ) . empty(); // Clear the log area.
    $( '#debug' ) . empty(); // Clear the debug area.
  }
  else if ( status == Strophe.Status.CONNECTED )
  {
    // Strophe is successfully connected to the XMPP server.
    log( 'Strophe is connected.' );
    connection.send( $pres() ); // Send an initial presence stanza.
  }
} // End of onConnect function


// jQuery's document ready function ensures the DOM is fully loaded before executing.
$( document ).ready( function ( )
{
  // Initialize the Strophe connection object with the BOSH service URL.
  // BOSH_SERVICE is expected to be a globally defined constant.
  connection = new Strophe.Connection( BOSH_SERVICE );

  // Assign custom raw input/output handlers for debugging purposes.
  connection.rawInput  = rawInput;
  connection.rawOutput = rawOutput;

  // Bind a click event listener to the '#connect' button.
  $( '#connect' ) . bind( 'click', function ( )
  {
    var button = $( '#connect' ) . get( 0 ); // Get the raw DOM element for the button.

    if ( button.value == 'connect' )
    {
      // If the button currently says 'connect', initiate connection.
      button.value = 'disconnect'; // Change button text.

      // Connect to the XMPP server using JID, password, and the onConnect callback.
      // JID and password are taken from UI input fields.
      connection.connect( $( '#jid' ).get(0).value,
                           $( '#pass' ).get(0).value,
                           onConnect );
    }
    else
    {
      // If the button says 'disconnect', then disconnect from the server.
      button.value = 'connect'; // Change button text back.
      connection.disconnect();  // Terminate the Strophe connection.
    }
  } ); // End of '#connect' click handler.


  // Bind a click event listener to the '#back' button.
  $( '#back' ).bind( 'click', function ()
  {
    log( "back" ); // Log the action.
    publish( current_page - 1 ); // Publish the previous page.
  } ); // End of '#back' click handler.


  // Bind a click event listener to the '#home' button.
  $( '#home' ).bind( 'click', function ()
  {
    log( "home" ); // Log the action.
    publish( 0 ); // Publish the home page (page 0).
  } ); // End of '#home' click handler.


  // Bind a click event listener to the '#forward' button.
  $( '#forward' ).bind( 'click', function ()
  {
    log( "forward" ); // Log the action.
    publish( current_page + 1 ); // Publish the next page.
  } ); // End of '#forward' click handler.

} ); // End of document.ready function.