'use strict';
window.DisplayBot = window.DisplayBot || {};

DisplayBot.Automaton = ( function (jQ) {

	// Declarations for template functions
	var headingLineTmpl = null;
    var urlLineTmpl = null;
	var connectingMsgTmpl = null;

	// Current WebSocket connection instance
	var webSockConn = null;

	/**
	 * Initializes the entire module.
	 * Sets up event handlers and starts the connection process.
	 */
	function initializeModule() {
		jQ(function () {
            // Compile Handlebars templates if not already compiled
            headingLineTmpl = headingLineTmpl || Handlebars.compile( jQ("#mainHeadingRow").html() );
            urlLineTmpl = urlLineTmpl || Handlebars.compile( jQ('#hyperlinkRow').html() );
			connectingMsgTmpl = connectingMsgTmpl || Handlebars.compile( jQ('#connectionStatusMsg').html() );

			// Register a Handlebars helper for time formatting
			Handlebars.registerHelper('durationFromNow', function (inputDate) {
                return moment(inputDate).fromNow();
			});

			// Initiate the WebSocket connection
			establishWebSocket();

			// Display the message indicating connection attempt
			jQ(".status-display").html( connectingMsgTmpl() );
		});
	}

    /**
     * Handles user interaction with vote buttons.
     * @param {HTMLElement} triggerElement The anchor element that was clicked.
     */
    function ballotProcessor(triggerElement) {
        // Retrieve the unique identifier for the row
        var uniqueId = jQ(triggerElement).closest('tr').data('identity');
        // Send a message to the server to register the vote
        webSockConn.send( JSON.stringify( { actionType: 'CAST_BALLOT', identity: uniqueId } ) );
        // Update the vote count display locally
        var ballotCountSpan = jQ(triggerElement).parent().find('.ballots');
        ballotCountSpan.html( Number( ballotCountSpan.html() ) + 1 );
        // Remove the vote button after it's been used
        jQ(triggerElement).remove();
        return false;
    }

    /**
     * Processes clicks on external hyperlinks.
     * @param {HTMLElement} clickableItem The anchor element for the link.
     */
    function hyperlinkProcessor(clickableItem) {
        // Get the target URL from the href attribute
        var targetUrl = jQ(clickableItem).attr('href');
        // Ask for user confirmation before navigating to an external site
        var userConfirmation = confirm(
            "Caution: These links are user-submitted and not verified for safety!\n" +
            "Do you wish to proceed to the following web address?\n\n" + targetUrl
        );
        // If confirmed, redirect the browser
        if ( userConfirmation ) {
            window.location = targetUrl;
        }
        return false;
    }

	/**
	 * Restores the view from a 'connecting' state to the default tables.
	 */
	function restoreInitialView(){
		jQ('.status-display').fadeOut(function () {
			jQ('.data-tables').fadeIn();
		});
	}

    /**
     * Sends a heartbeat message to the server and updates time displays.
     */
    function sendHeartbeat() {
        // Only send if the connection is active
        if ( webSockConn !== null ) {
            webSockConn.send( JSON.stringify( { actionType: 'HEARTBEAT_REQUEST' } ) );
        }
        // Update all 'time since' displays on the page
        jQ('.timestamp-display').each(function () {
            var momentInTime = jQ(this).data('timestamp');
            var timeSince = moment(momentInTime).fromNow();
            jQ(this).html( moment( jQ(this).data('timestamp') ).fromNow() )
        });
    }

	/**
	 * Establishes a WebSocket connection to the backend server.
	 */
	function establishWebSocket() {
		// Only attempt connection if not already connected or in a closed state
		if ( webSockConn === null || webSockConn.readyState === 3 ) {
			// Determine the WebSocket endpoint based on the current hostname
            if ( window.location.hostname === 'localhost' || window.location.hostname === '' ) {
                webSockConn = new WebSocket('ws://127.0.0.1:5001');
            } else {
	            webSockConn = new WebSocket('wss://frosty-brook-4545.herokuapp.com:443');
            }

			// Handler for successful connection
			webSockConn.onopen = function (connEvent) {
				restoreInitialView();
                // Start sending heartbeats periodically
                setInterval(sendHeartbeat, 30000);
			};

			// Handler for incoming messages from the server
			webSockConn.onmessage = function (incomingMsg) {
				var dataPayload = JSON.parse( incomingMsg.data );
                // console.log(JSON.stringify(dataPayload)); // For debugging received data

                // Process different types of operations from the server
                if ( dataPayload.actionType === 'RELOAD_ALL' ) {
                    // Refresh all displayed content
                    var mainHeadings = dataPayload.headings;
    				jQ('.main-headings tbody').empty(); // Clear existing entries
                    var markupContent = "";
					
					// Sort headings by their vote count in descending order
					mainHeadings = mainHeadings.sort(function(itemA, itemB){
                        return itemB.tally - itemA.tally;
                    });
					
					// Generate HTML rows for all headings
					var previouslyVotedHeadings = [];
                    for ( var idx = 0; idx < mainHeadings.length; ++idx ) {
                        markupContent += headingLineTmpl( mainHeadings[idx] );
						if ( mainHeadings[idx].hasVoted ) {
							previouslyVotedHeadings.push( mainHeadings[idx].identity );
						}
                    }

					// Insert the generated HTML into the table
                    jQ('.main-headings tbody').html( markupContent );

					// Remove vote anchors for items the user has already voted on
					console.log( JSON.stringify( previouslyVotedHeadings ) ); // Log for verification
					for ( var idx = 0; idx < previouslyVotedHeadings.length; ++idx ) {
						jQ('tr[data-identity=' + previouslyVotedHeadings[idx] + ']').find('a').remove();
					}

					// Ensure the main headings table is visible
                    if ( !jQ('.main-headings').is(':visible') ) {
                        jQ('.main-headings').fadeIn();
                    }

                    // Process and display associated URLs
                    var associatedUrls = dataPayload['hyperlinks'];
                    markupContent = '';
                    for ( var idx = 0; idx < associatedUrls.length; ++idx ) {
                        markupContent += urlLineTmpl( associatedUrls[idx] );
                    }
                    jQ('.hyperlinks-list tbody').html( markupContent );
                    // Ensure the hyperlinks table is visible
                    if ( !jQ('.hyperlinks-list').is(':visible') ) {
                        jQ('.hyperlinks-list').fadeIn();
                    }
                } else if ( dataPayload.actionType === 'ADD_HEADING' ) {
                    // Append a new heading entry
                    jQ('.main-headings tbody').append( headingLineTmpl( dataPayload.heading ) );
                } else if ( dataPayload.actionType === 'ADD_HYPERLINK' ) {
                    // Append a new hyperlink entry
                    jQ('.hyperlinks-list tbody').append( urlLineTmpl( dataPayload.hyperlink ) );
                } else if ( dataPayload.actionType === 'UPDATE_BALLOT' ) {
                    // Update the vote count for a specific item
                    var targetRow = jQ('tr[data-identity=' + dataPayload.identity + ']');
                    var targetSpan = jQ(targetRow).find('.ballots').html( dataPayload.tally );
                } else if ( dataPayload.actionType === 'HEARTBEAT_RESPONSE' ) {
                    // No operation needed for PONG (heartbeat response)
                }
			};

			// Handler for connection closure
			webSockConn.onclose = function (closeEvent) {
				// Fade out tables and show connection message
				jQ('.data-tables').fadeOut(function () {
                    jQ('.status-display').fadeIn();
                });
                // Attempt to reconnect after a delay
                setTimeout(establishWebSocket, 5000);
                // Stop sending heartbeats
                clearInterval(sendHeartbeat); // Note: This clears a non-numeric ID. Original behavior maintained.
			};

			// Handler for connection errors
			webSockConn.onerror = function (errorDetails) {
				console.log( "WebSocket Error: " + JSON.stringify(errorDetails) );
			};
		} else {
			// If already connected or connecting, retry after a delay (e.g., if called multiple times)
			setTimeout(establishWebSocket, 5000);
		}
	}

	// Expose public methods of the module
	return {
		init: initializeModule,
        voteHandler: ballotProcessor,
        linkHandler: hyperlinkProcessor
	};

})(jQuery);