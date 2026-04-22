/*
 * This file contains JavaScript code for managing and displaying
 * the connection status of various services, such as Blockchain.info
 * and Mt.Gox. It defines a StatusBox utility object with methods
 * to update the user interface based on connection states.
 */

// Global constant definitions for various status messages.
var CONNECTED = "Connected." ; // Message indicating a successful connection.
var CONNECTING = "Connecting..." ; /* Message displayed when a connection is actively being established. */
var NO_SUPPORT = "No browser support." ; // Message for when the user's browser lacks necessary features for a service.
var CLOSED = "Click to connect." ; // Message prompting the user to initiate a connection.


// The main constructor function for the StatusBox utility.
// This function is intentionally left empty, as all functionality
// is implemented via static methods attached directly to the StatusBox object.
function StatusBox()
{
    // No initialization logic is required within the constructor itself.
}


/*
 * Initializes the StatusBox functionality.
 * This method retrieves the necessary DOM elements and sets their
 * initial status based on debug mode and checkbox states.
 *
 * @param {boolean} debugmode - A flag indicating whether debug mode is active.
 *                              If true, specific debug messages might be displayed.
 */
StatusBox.init = function ( debugmode )
{
    // Store references to the jQuery objects for blockchain and Mt.Gox status displays.
    StatusBox.blockchain = $ ( "#blockchainStatus" ) ;

    StatusBox.mtgox = $ ( "#mtgoxStatus" ) ;

    // Conditional block to handle debug mode specific actions.
    if ( debugmode )
    {
        StatusBox.blockchain.html ( "" ) ; // Clear the blockchain status area in debug mode.
        StatusBox.mtgox.html ( "Debug mode." ) ; // Display a debug message for Mt.Gox status.
    }

    // Check the state of the blockchain checkbox to determine initial connection status.
    if ( $ ( "#blockchainCheckBox" ) . is ( ":checked" ) )
    {
        StatusBox.reconnecting ( "blockchain" ) ; // If checked, set blockchain status to "reconnecting".
    }
    else
    {
        StatusBox.closed ( "blockchain" ) ; // Otherwise, set blockchain status to "closed".
    }

    // Check the state of the Mt.Gox checkbox to determine initial connection status.
    if ( $ ( "#mtgoxCheckBox" ) . is ( ":checked" ) )
    {
        StatusBox.reconnecting ( "mtgox" ) ; // If checked, set Mt.Gox status to "reconnecting".
    }
    else
    {
        StatusBox.closed ( "mtgox" ) ; // Otherwise, set Mt.Gox status to "closed".
    }
} ; // End of StatusBox.init method.


// This function updates the status display for a given service to "connected".
// It takes a 'type' argument, which can be "blockchain" or "mtgox",
// to specify which service's status to update.
StatusBox.connected = function ( type )
{
    if ( type == "blockchain" )
    {
        // Update blockchain status with a green "Connected" message.
        StatusBox.blockchain.html ( 'Blockchain.info Transactions: <span style="color: green;">' + CONNECTED + '</span>' ) ;
    }

    if ( type == "mtgox" )
    {
        // Update Mt.Gox status with a green "Connected" message.
        StatusBox.mtgox.html ( 'Mt.Gox Trades: <span style="color: green;">' + CONNECTED + '</span>' ) ;
    }
} ; // End of StatusBox.connected method.


/**
 * Updates the status display for a given service to "reconnecting".
 * This indicates that an attempt to establish a connection is currently active.
 *
 * @param {string} type - The service type, either "blockchain" or "mtgox".
 */
StatusBox.reconnecting = function ( type )
{
    if ( type == "blockchain" )
    {
        // Update blockchain status with a yellow "Connecting..." message.
        StatusBox.blockchain.html ( 'Blockchain.info Transactions: <span style="color: yellow;">' + CONNECTING + '</span>' ) ;
    }

    if ( type == "mtgox" )
    {
        // Update Mt.Gox status with a yellow "Connecting..." message.
        StatusBox.mtgox.html ( 'Mt.Gox Trades: <span style="color: yellow;">' + CONNECTING + '</span>' ) ;
    }
} ; // End of StatusBox.reconnecting method.


// Sets the status message for a service to indicate "no browser support".
// This function is typically called if the browser lacks necessary APIs for a service.
StatusBox.nosupport = function ( type )
{
    if ( type == "blockchain" )
    {
        // Update blockchain status with a red "No browser support" message.
        StatusBox.blockchain.html ( 'Blockchain.info Transactions: <span style="color: red;">' + NO_SUPPORT + '</span>' ) ;
    }

    if ( type == "mtgox" )
    {
        // Update Mt.Gox status with a red "No browser support" message.
        StatusBox.mtgox.html ( 'Mt.Gox Trades: <span style="color: red;">' + NO_SUPPORT + '</span>' ) ;
    }
} ; // End of StatusBox.nosupport method.


/**
 * Sets the status message for a service to "closed" or "disconnected".
 * This also includes a prompt for the user to initiate a connection.
 *
 * @param {string} type - The service type to update, either "blockchain" or "mtgox".
 */
StatusBox.closed = function ( type )
{
    if ( type == "blockchain" )
    {
        // Update blockchain status with a gray "Click to connect" message.
        StatusBox.blockchain.html ( 'Blockchain.info Transactions: <span style="color: gray;">' + CLOSED + '</span>' ) ;
    }

    if ( type == "mtgox" )
    {
        // Update Mt.Gox status with a gray "Click to connect" message.
        StatusBox.mtgox.html ( 'Mt.Gox Trades: <span style="color: gray;">' + CLOSED + '</span>' ) ;
    }
} ; // End of StatusBox.closed method.

/*
 * This concludes the definition of the StatusBox utility methods.
 * The object now provides a comprehensive way to manage and display
 * connection statuses within the web application.
 */