/*
 * This file defines the core logic for displaying build information
 * on a dashboard-like interface. It leverages WebSockets to receive
 * real-time updates and interacts with a global 'Board' object.
 *
 * It is structured as an Immediately Invoked Function Expression (IIFE)
 * to encapsulate its variables and prevent pollution of the global scope.
 */
/* global Board */ // Declares 'Board' as a global variable, often provided by an external script.

( function ( ) { // Start of the IIFE for scope encapsulation

    // --- Configuration Variables ---

    /*
     * The WebSocket host and port combination.
     * This needs to be replaced with the actual server address.
     */
    var WSHOST = 'websockethost:port';

    /*
     * Maximum character count for project names displayed on the board.
     * Used for truncation and padding.
     */
    var CHARCOUNT = 20;

    // WebSocket instances for potential future use or primary connection.
    var ws;
    var ws2;

    /*
     * An array to store the messages (build statuses) that are currently
     * displayed on the board. It's initialized from localStorage to persist
     * data across page reloads, or as an empty array if no data exists.
     */
    var output = JSON.parse( localStorage.getItem( 'messages' ) ) || [ ];

    /*
     * A mapping object where keys are project identifiers (e.g., 'buildname')
     * and values are their corresponding display aliases (e.g., 'BUILDALIAS').
     * This allows for more human-readable names on the board.
     */
    var lines = {
        'buildname': 'BUILDALIAS'
    };

    // --- Core Functions ---

    /**
     * Renders a new build status update onto the board.
     * This function handles data formatting, display logic, and persistence.
     *
     * @param {object} data - The build data received from the WebSocket.
     *                        Expected to have properties like 'project', 'number', 'result'.
     */
    var render = function ( data ) {

        // If the project specified in the data is not configured in our 'lines' mapping,
        // then we simply ignore this update.
        if ( ! lines[ data.project ] ) {
            return;
        }

        // Check if the 'output' array is already full (i.e., its length equals
        // the maximum number of rows the Board can display).
        // If it is, the oldest message is removed from the end of the array
        // to make space for the new message.
        if ( output.length === Board.rows.length ) {
            output.pop( );
        }

        // Format the project number for display.
        var projectNumber = ' #' + data.number;

        // Truncate the project name if it exceeds the allowed character count
        // after accounting for the project number's length.
        var projectName = lines[ data.project ].substring( 0, CHARCOUNT - projectNumber.length );

        // Construct the final message string:
        // 1. Pad the project name with spaces to align it.
        // 2. Append the project number.
        // 3. Append the first character of the build result (e.g., 'S' for SUCCESS, 'F' for FAILURE).
        output.unshift( projectName.rpad( ' ', CHARCOUNT - projectNumber.length ) + projectNumber + data.result[ 0 ] );

        // Update the display on the 'Board' interface.
        Board.setMessage( output );

        // Persist the updated messages array to localStorage for future sessions.
        localStorage.setItem( 'messages', JSON.stringify( output ) );
    };


    /**
     * Establishes a WebSocket connection to the Jenkins server.
     * Handles incoming messages and sends periodic 'ping' messages
     * to keep the connection alive.
     */
    var connect = function ( ) {

        // If an existing WebSocket connection is open, close it before
        // establishing a new one. This prevents multiple connections.
        if ( ws ) {
            ws.close( );
        }

        // Create a new WebSocket instance.
        ws = new WebSocket( 'ws://' + WSHOST + '/jenkins' );

        // Define the callback function to execute when a message is received
        // from the WebSocket server.
        ws.onmessage = function ( msg ) {
            // Parse the incoming message data, which is expected to be JSON.
            var data = JSON.parse( msg.data );

            // Call the render function to display the received build data.
            render( data );
        };

        // Set up an interval to send 'ping' messages every 5 seconds.
        // This helps maintain the WebSocket connection and prevents it
        // from being closed due to inactivity by some proxies or servers.
        setInterval( function ( ) {
            ws.send( 'ping' );
        }, 5000 ); // 5000 milliseconds = 5 seconds
    };

    // --- Initialization ---

    // Immediately call the 'connect' function to establish the WebSocket
    // connection when the script loads.
    connect( );

    // Bind an event listener to the 'Board' object.
    // When the 'start' event is triggered on the Board,
    // it will display the current set of messages.
    // This is typically used to initialize the display after the Board
    // itself has finished loading or is ready to receive data.
    Board.bind( 'start', function ( ) {
        Board.setMessage( output );
    } );

} ) ( ); // End of the IIFE