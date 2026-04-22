'use strict'; /* Enforce strict mode for cleaner, safer code execution */

window.Showbot = window.Showbot || { };  // Ensure the global Showbot namespace exists, initializing if necessary

Showbot.Bot = ( function ( $ ) { // Wrap the module in an immediately invoked function expression (IIFE)

    // --- Private Variables: Templates ---
    var titleRowTemplate   = null; // Stores the compiled Handlebars template for title rows
    var linkRowTemplate    = null; // Stores the compiled Handlebars template for link rows
    var connectingTemplate = null; // Stores the compiled Handlebars template for the connecting message

    // --- Private Variables: Application State ---
    var connection         = null; // Holds the WebSocket connection object

    /**
     * Initializes the Showbot application once the DOM is ready.
     * Compiles templates, registers Handlebars helpers, and initiates WebSocket connection.
     */
    function init ( ) {
        $( function ( ) { // jQuery's document ready handler

            // Compile Handlebars templates from script tags
            titleRowTemplate   = titleRowTemplate   || Handlebars.compile( $( "#titleRow" ).html( ) );
            linkRowTemplate    = linkRowTemplate    || Handlebars.compile( $( '#linkRow' ).html( ) );
            connectingTemplate = connectingTemplate || Handlebars.compile( $( '#connectingMessage' ).html( ) );

            // Register a custom Handlebars helper for time formatting
            Handlebars.registerHelper( 'timeAgo', function ( date ) {
                return moment( date ).fromNow( ); // Uses Moment.js to display time relative to now
            } );

            connectSocket( ); // Attempt to establish a WebSocket connection to the server

            // Display an initial message indicating connection attempt
            $( ".message" ).html( connectingTemplate( ) );

        } ); // End of jQuery document ready
    } // End of init function

    /**
     * Handles vote actions triggered by clicking a vote button.
     * Sends a VOTE operation to the server and updates the UI locally.
     * @param {HTMLElement} anchor - The anchor element that was clicked.
     * @returns {boolean} False to prevent default link behavior.
     */
    function voteHandler ( anchor ) {
        var id       = $( anchor ).closest( 'tr' ).data( 'id' ); // Get the ID of the row associated with the vote
        var packet   = { operation : 'VOTE', id : id };          // Construct the packet for the server
        connection.send( JSON.stringify( packet ) );             // Send the vote request

        var voteSpan = $( anchor ).parent( ).find( '.votes' );   // Find the span displaying the vote count
        voteSpan.html( Number( voteSpan.html( ) ) + 1 );         // Increment the vote count visually
        $( anchor ).remove( );                                   // Remove the vote button to prevent re-voting

        return false; // Prevent the default action of the anchor link
    } // End of voteHandler function

    /**
     * Handles link clicks, showing a warning before navigating.
     * @param {HTMLElement} anchor - The anchor element representing the link.
     * @returns {boolean} False to prevent default link behavior.
     */
    function linkHandler ( anchor ) {
        var link   = $( anchor ).attr( 'href' ); // Retrieve the URL from the link's href attribute
        var answer = confirm( "Tread carefully; these links aren't checked for safety!\nWould you like to go to the following URL?\n\n" + link ); // User confirmation

        if ( answer ) { // If the user confirms
            window.location = link; // Navigate to the external link
        }

        return false; // Prevent default link behavior
    } // End of linkHandler function

    /**
     * Resets the UI to display content tables and hides the message area.
     */
    function resetToDefault ( ) {
        $( '.message' ).fadeOut( function ( ) { // Fade out the message container
            $( '.tables' ).fadeIn( );           // Then fade in the tables container
        } );
    } // End of resetToDefault function

    /**
     * Sends a PING message to the server to keep the WebSocket connection alive
     * and updates 'time ago' displays on the page.
     */
    function ping ( ) {
        if ( connection !== null ) { // Only send if a connection exists
            connection.send( JSON.stringify( { operation : 'PING' } ) ); // Send PING packet
        }

        // Update all elements with class 'time' to show their relative time
        $( '.time' ).each( function ( ) {
            var time = $( this ).data( 'time' ); // Get the original timestamp from data attribute
            var ago  = moment( time ).fromNow( ); // Calculate 'time ago' using Moment.js
            $( this ).html( ago );               // Update the element's HTML content
        } );
    } // End of ping function

    /**
     * Establishes a WebSocket connection to the server.
     * Handles connection lifecycle events: open, message, close, error.
     */
    function connectSocket ( ) {

        // Only attempt to connect if no connection exists or if the existing one is closed
        if ( connection === null || connection.readyState === 3 ) {

            /* Determine the WebSocket endpoint based on the current hostname.
               Uses localhost for development, production URL for deployment. */
            if ( window.location.hostname === 'localhost' || window.location.hostname === '' ) {
                connection = new WebSocket( 'ws://localhost:5001' ); // Local development server
            } else {
                connection = new WebSocket( 'ws://thawing-bayou-3232.herokuapp.com:80' ); // Heroku deployed server
            }

            // --- WebSocket Event Handlers ---

            // Fired when the WebSocket connection is successfully opened
            connection.onopen = function ( event ) {
                resetToDefault( );                 // Switch UI to show content tables
                setInterval( ping, 30000 );        // Start sending PINGs every 30 seconds
            };

            // Fired when a message is received from the WebSocket server
            connection.onmessage = function ( message ) {
                var packet = JSON.parse( message.data ); // Parse the JSON data from the message

                // console.log( JSON.stringify( packet ) ); // For debugging received packets

                if ( packet.operation === 'REFRESH' ) {
                    // Handle a full refresh of titles and links
                    var titles = packet.titles;
                    $( '.titles tbody' ).empty( ); // Clear existing title rows
                    var html   = "";

                    // Sort titles by vote count in descending order
                    titles = titles.sort( function ( a, b ) { return b.votes - a.votes; } );

                    var titlesAlreadyVoted = [ ]; // Keep track of titles the user has already voted for

                    // Generate HTML for each title row
                    for ( var i = 0; i < titles.length; ++i ) {
                        html += titleRowTemplate( titles[i] );
                        if ( titles[i].voted ) {
                            titlesAlreadyVoted.push( titles[i].id );
                        }
                    }

                    // Append the generated title rows to the table
                    $( '.titles tbody' ).html( html );

                    // Remove vote anchors for titles that have already been voted on by the current user
                    // console.log( JSON.stringify( titlesAlreadyVoted ) ); // Debugging voted titles
                    for ( var i = 0; i < titlesAlreadyVoted.length; ++i ) {
                        $( 'tr[data-id=' + titlesAlreadyVoted[i] + ']' ).find( 'a' ).remove( );
                    }

                    // Ensure the titles table is visible
                    if ( !$( '.titles' ).is( ':visible' ) ) {
                        $( '.titles' ).fadeIn( );
                    }

                    var links = packet.links;
                    html      = ''; // Reset HTML string for links

                    // Generate HTML for each link row
                    for ( var i = 0; i < links.length; ++i ) {
                        html += linkRowTemplate( links[i] );
                    }

                    // Append the generated link rows to the table
                    $( '.links tbody' ).html( html );

                    // Ensure the links table is visible
                    if ( !$( '.links' ).is( ':visible' ) ) {
                        $( '.links' ).fadeIn( );
                    }

                } else if ( packet.operation === 'NEW' ) {
                    // Add a new title to the table
                    $( '.titles tbody' ).append( titleRowTemplate( packet.title ) );

                } else if ( packet.operation === 'NEWLINK' ) {
                    // Add a new link to the table
                    $( '.links tbody' ).append( linkRowTemplate( packet.link ) );

                } else if ( packet.operation === 'VOTE' ) {
                    // Update the vote count for a specific title
                    var row  = $( 'tr[data-id=' + packet.id + ']' );
                    var span = $( row ).find( '.votes' ).html( packet.votes ); // Update the displayed vote count

                } else if ( packet.operation === 'PONG' ) {
                    // PONG operation is a no-op on the client side, primarily for keep-alive
                    // No specific action needed here.
                }
            }; // End of connection.onmessage

            // Fired when the WebSocket connection is closed
            connection.onclose = function ( event ) {
                $( '.tables' ).fadeOut( function ( ) { // Fade out content tables
                    $( '.message' ).fadeIn( );          // Fade in the connecting message
                } );
                setTimeout( connectSocket, 5000 ); // Attempt to reconnect after 5 seconds
                clearInterval( ping );             // Stop sending PINGs when connection is closed
            };

            // Fired when an error occurs on the WebSocket connection
            connection.onerror = function ( error ) {
                console.log( "WebSocket Error: " + JSON.stringify( error ) ); // Log the error for debugging
            };

        } else {
            // If connection already exists and is not closed, try again later.
            // This prevents multiple connection attempts if one is already in progress.
            setTimeout( connectSocket, 5000 );
        }
    } // End of connectSocket function

    // Public API of the Showbot.Bot module
    return {
        init        : init,        // Expose the initialization function
        voteHandler : voteHandler, // Expose the vote handling function
        linkHandler : linkHandler  // Expose the link handling function
    };

} )( jQuery ); // Pass jQuery into the IIFE for scope isolation and aliasing