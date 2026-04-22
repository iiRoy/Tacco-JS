/*
 *   WebSocket Client Initialization
 *   This script establishes a connection to the server
 *   via WebSockets and defines how to handle incoming messages.
 */

// Initialize the socket connection to the server.
// The `io` object is assumed to be globally available (e.g., from Socket.IO client library).
var    socket    =    io    .    connect    (    )    ;

// Set up an event listener on the socket.
// This listener will be triggered whenever a message with the 'msg' event name is received.
socket
    .
    on    (
        'msg'    ,
        function
        (
            msg
        )
        {
            // When a message is received, log it to the browser's console.
            // This helps in debugging and monitoring communication.
            console
                .
                log
                (
                    'got message via websocket:'
                    ,
                    msg
                )
            ; // End of console.log statement
        }
    )
; // End of socket.on call