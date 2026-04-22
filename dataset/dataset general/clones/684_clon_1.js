/*
 * This file contains the client-side JavaScript logic for the HOT PROBS Chat application.
 * It handles UI interactions, socket communication, and displays chat messages.
 */
; ( function ( $, window, io ) {

    // Main application object encapsulating configuration, events, and functions.
    var pchatClient = {

        'cfg': {
            // Configuration settings for the chat client.

            // Extracts the screenname from the URL query string.
            'screenname': window.location.search.substring( 1 ).split( "=" )[ 1 ],

            // Unique identifier for the current socket connection.
            'socket_id': null,

            // The Socket.IO client instance.
            'socket': null,

            // jQuery object for the message input field.
            '$msg': null,

            // jQuery object for the incoming messages display area.
            '$incoming': null,

            // jQuery object for the header element (used for logout).
            '$header': null
        },

        'evt': {
            // Event handlers for the application.

            // Called when the document is ready.
            'ready': function () {
                // Initialize the chat client.
                pchatClient.fn.init();
            }
        },

        'fn': {
            // Core functions of the chat client.

            'init': function () {
                // Initializes the client by setting up DOM elements and binding events.

                // Cache jQuery selectors for frequently used DOM elements.
                pchatClient.cfg.$msg      = $( '#msg' );
                pchatClient.cfg.$incoming = $( '#incoming' );
                pchatClient.cfg.$header   = $( '#header' );

                // Set focus to the message input field.
                pchatClient.cfg.$msg.focus();

                // Bind keypress event to the message input field.
                pchatClient.cfg.$msg.keypress( function ( e ) {
                    // If the 'Enter' key (key code 13) is pressed.
                    if ( e.which == 13 ) {
                        // Send the message.
                        pchatClient.fn.sendMessage();
                        // Prevent default form submission.
                        return false;
                    }
                } );

                // Bind click event to the header for logout functionality.
                pchatClient.cfg.$header.click( function () {
                    // Clear the screenname and redirect to the home page.
                    pchatClient.cfg.screenname = "";
                    window.location            = '/';
                } );

                // Special handling for iOS devices: blur event on message input.
                // This captures the 'Done' button press on the iOS keyboard, effectively sending the message.
                pchatClient.cfg.$msg.blur( pchatClient.fn.sendMessage );

                // Establish Socket.IO connection to the '/pchat' namespace.
                pchatClient.cfg.socket = io.connect( '/pchat' );

                // Register event listeners for various socket events.
                pchatClient.cfg.socket.on( 'userReady',        pchatClient.fn.userReady        );
                pchatClient.cfg.socket.on( 'userMessage',      pchatClient.fn.userMessage      );
                pchatClient.cfg.socket.on( 'userDisconnected', pchatClient.fn.userDisconnected );

                // Emit 'userReady' event to the server to register the user.
                pchatClient.cfg.socket.emit( 'userReady', { name : pchatClient.cfg.screenname } );
            },

            'autoscroll': function () {
                // Automatically scrolls the conversation area to the bottom.
                var incoming           = document.getElementById( 'conversation' );
                incoming.scrollTop = incoming.scrollHeight;
            },

            'sendMessage': function () {
                // Sends the user's message to the server.

                // Only send if the message input is not empty.
                if ( pchatClient.cfg.$msg.val() !== '' ) {
                    // Emit 'userMessage' event with screenname and message content.
                    pchatClient.cfg.socket.emit( 'userMessage',
                        {
                            name   : pchatClient.cfg.screenname,
                            message: pchatClient.cfg.$msg.val()
                        }
                    );
                }
                // Clear the message input field after sending.
                pchatClient.cfg.$msg.val( '' );
            },

            'userReady': function ( data ) {
                // Handles the 'userReady' event from the server.
                // This indicates a new user has connected or current user's details are confirmed.

                // Store the socket ID received from the server.
                pchatClient.cfg.socket_id = data.id;

                // Count the number of currently connected users.
                var i = 0;
                for ( var p in data.connections ) {
                    i++;
                }

                // Construct an introductory string based on the number of users.
                var intro_str = '';
                if ( i === 1 ) {
                    // If this is the only person in the room.
                    intro_str = 'No one is here yet... give it a few seconds?';
                } else {
                    // If there are other users, introduce them.
                    var met = false;
                    for ( var p_connection in data.connections ) {
                        intro_str += data.connections[ p_connection ];
                        // This logic constructs the introduction string based on existing connections.
                        if ( !met ) {
                            intro_str += ', meet ';
                            met = true;
                        } else {
                            intro_str += '... ?';
                        }
                    }
                }

                // Decode the user's name for display.
                var decoded = decodeURIComponent( data.name );

                // Append a "connected" message to the incoming chat area.
                pchatClient.cfg.$incoming
                    .append( '<div class="green"> > ' + decoded + ' connected</div>' );
                pchatClient.fn.autoscroll(); // Scroll to the latest message.

                // Append welcome and introduction messages.
                pchatClient.cfg.$incoming
                    .append( '<div class="hot-pink"> > *** Welcome to Hot Probs, ' + decoded + '!!! ***</div>' )
                    .append( '<div class="off-white"> > ***  ' + intro_str + ' ***</div>' );
                pchatClient.fn.autoscroll(); // Scroll again after adding new messages.
            },

            'userMessage': function ( data ) {
                // Handles incoming 'userMessage' events from the server.

                if ( data.name ) {
                    // Decode the sender's name.
                    var decoded = decodeURIComponent( data.name );

                    // Append the message to the chat display, applying a dynamic color.
                    pchatClient.cfg.$incoming
                        .append( '<div style="color:' + data.color + '">' + decoded + ' > ' + data.message + '</div>' );
                    pchatClient.fn.autoscroll(); // Auto-scroll to show the new message.
                }
            },

            'userDisconnected': function ( data ) {
                // Handles the 'userDisconnected' event from the server.

                if ( data.name ) {
                    // Decode the name of the disconnected user.
                    var decoded = decodeURIComponent( data.name );

                    // Display a message indicating the user has disconnected.
                    pchatClient.cfg.$incoming
                        .append( '<span style="color:#009a16;font-style:italic;"> > ' + decoded + ' disconnected</span><br>' );
                    pchatClient.fn.autoscroll(); // Auto-scroll to the bottom.
                }
            }
        }
    };

    // Initialize the chat application once the DOM is ready.
    pchatClient.evt.ready();

// Self-executing anonymous function, passing jQuery, window, and Socket.IO objects.
} ( jQuery, window, io ) );