/*
 *  Chattrr Application - Core JavaScript Module
 *  (C) 2011 William Becker - All Rights Reserved
 *
 *  This software is distributed under the terms of the GNU General Public License,
 *  version 3 or later, as published by the Free Software Foundation.
 *
 *  It is provided "AS IS" without any express or implied warranties,
 *  including merchantability or fitness for a particular purpose.
 *
 *  For full license details, please refer to the accompanying LICENSE file
 *  or visit http://www.gnu.org/licenses/
 */
( function ( ) {
    // Declare all global module variables at the top for clarity
    var myIp,
        port,
        userToken,
        haveBeenConnected       = false, // Flag to check if connection was established
        sendButtonConnected     = false, // Flag for send button event listener status
        currentPassword,
        justSetPasswordUsingExisting = false, // To prevent password prompt loop
        startSockets, // Function to initiate socket connection
        socketHolder            = { }, // Holds the socket object
        retryCount, // Number of connection retries
        retryTimeout, // Timer for reconnecting
        history                 = [ ], // Command history for input field
        historyIndex            = 0, // Current index in command history
        lostMessages            = { }, // Messages lost during disconnect
        messageIndex            = 1, // Unique ID for outgoing messages
        lastSetNameTime         = 0, // Timestamp of last name change
        lastMessageTime         = 0, // Timestamp of last message sent
        originalMarginBottom, // Stores original margin for DOM manipulation
        closed, // Flag if the chat window is closed
        allowFlashing           = true, // User preference for title flashing
        titleFlashing           = false, // Current state of title flashing
        titleFlashingTimeout, // Timer for title flashing effect
        defaultBoardUrlText     = "<loading board name>", // Placeholder for board URL
        boardUrl                = defaultBoardUrlText, // Current board URL
        userId, // Unique ID for the current user
        justStarted             = true, // Flag for initial application load
        justStartedTimeout, // Timeout for initial load state
        passwordMode            = false, // Flag if password input is active
        f                       = { }; // Global functions object

    // Initialize network configuration
    myIp        =   window.__chattrrHost;
    port        =   window.__chattrrPort    ?    parseInt(window.__chattrrPort, 10)    :    80;
    userToken   =   window.__userToken;


    f.showMessage = function ( text ) {
        // Displays a system message in the chat output
        f.messageReceived( JSON.stringify( {
            name: "chattrr", // Sender name
            id: 0, // System ID
            time: new Date( ).getTime( ), // Current timestamp
            msg: text // The message content
        } ) );
    };


    f.messageReceived = function ( messageRaw ) {
        // Handles incoming raw message strings
        var message = JSON.parse( messageRaw ); // Parse the JSON message

        // Check for server shutdown message
        if ( message.closing ) {
            if ( socketHolder.socket ) {
                socketHolder.socket.disconnect( ); // Disconnect if socket exists
            }
            if ( retryTimeout ) {
                clearInterval( retryTimeout ); // Clear any existing retry timer
            }
            // Set up a new retry interval to attempt reconnection
            retryTimeout = setInterval( startSockets, 2000 );
            f.showMessage(
                "Server shutting down. We'll listen for it to come back again." );
            return; // Exit function
        }

        // Handle password failure
        if ( message.passwordFailed ) {
            if ( currentPassword && !justSetPasswordUsingExisting ) {
                // If a password was set and it's not a retry from existing
                f.sendConnectMessage( currentPassword );
                justSetPasswordUsingExisting = true; // Set flag to prevent immediate re-prompt
            }
            else {
                f.promptForPassword( ); // Prompt user for password
            }
            return; // Exit function
        }

        // Reset password flag after successful connection or new prompt
        justSetPasswordUsingExisting = false;

        // Update board URL if provided
        if ( message.url ) {
            boardUrl = message.url;
        }

        // Update user ID and reset 'justStarted' flag with a timeout
        if ( message.userId ) {
            userId = message.userId;
            justStarted = true;
            if ( justStartedTimeout ) {
                clearTimeout( justStartedTimeout );
            }
            justStartedTimeout = setTimeout( function ( ) {
                justStarted = false;
            }, 5000 ); // 5-second grace period
        }

        // Update title flashing preference
        if ( !_.isUndefined( message.flash ) ) {
            allowFlashing = message.flash === true;
        }

        // Set language if message contains language data
        if ( message.language ) {
            f.setLanguage( message );
        }

        // Show lurker count
        if ( message.count ) {
            f.showLurkers( message );
        }

        // Display popular URLs
        if ( message.urls ) {
            f.writePopularUrlsToDom( message );
        }

        // Display active users
        if ( message.users ) {
            f.showUsers( message );
        }

        // If no message content, do nothing more
        if ( !message.msg ) {
            return;
        }

        // Write the message to the DOM
        f.writeMessageToDom( message );
    };


    f.promptForPassword = function ( ) {
        // Prompts the user to enter a password for the chat
        var messageField, parent, field;

        f.showMessage( "Please enter your password" );

        messageField            = document.getElementById( "chattrr_in" );
        messageField.style.display = "none"; // Hide the regular input field

        parent                  = document.getElementById( "chattrr_inputHolder" );
        field                   = document.createElement( "input" ); // Create a new input element
        field.type              = "password"; // Set type to password for masking
        field.id                = "chattrr_in_password";
        parent.appendChild( field ); // Add the password field to the DOM

        // TODO: Disconnect the send button (this comment is from original, keeping it as is)

        // Event listener for keypress in the password field
        field.addEventListener( "keypress", function ( event ) {
            if ( event.which === 13 ) {
                // If Enter key is pressed
                parent.removeChild( field ); // Remove the password input field
                messageField.style.display = ""; // Show the regular message input

                if ( socketHolder.socket && socketHolder.socket.connected ) {
                    // Hash the entered password and send it
                    currentPassword = Crypto.SHA256( field.value );
                    f.sendConnectMessage( currentPassword );
                }
                else {
                    f.showMessage( "Cannot send password while unconnected to chattrr." );
                }
                messageField.focus( ); // Focus back on the message input
            }
        }, false );
        field.focus( ); // Focus on the newly created password field
    };


    f.setLanguage = function ( message ) {
        // Sets the language selection in the UI based on the message
        var select, lang, options, option, i, ii;

        select  = document.getElementById( "chattrr_languageSelect" );
        lang    = message.language; // Get language from message

        options = select.options;
        for ( i = 0, ii = options.length; i < ii; i += 1 ) {
            option = select.options[ i ];
            if ( option.value === lang ) {
                option.selected = true; // Select the matching option
                break; // Exit loop once found
            }
        }
    };


    f.showLurkers = function ( message ) {
        // Displays the number of lurkers and board URL in the top bar
        var text, link, topBarText;

        topBarText = document.getElementById( "chattrr_topBarText" );

        // Clear existing children from the top bar text element
        while ( topBarText.hasChildNodes( ) ) {
            topBarText.removeChild( topBarText.lastChild );
        }

        text                = document.createElement( "span" );
        text.textContent    = message.count + " Chattrrers lurking on "; // Lurker count text

        link                = document.createElement( "a" ); // Create a link element
        link.textContent    = boardUrl; // Display the board URL
        link.href           = "http://" + myIp + ":" + port + "/log/" +
            encodeURIComponent( boardUrl ) + "?offset=0"; // Construct log URL
        link.target         = "_blank"; // Open link in new tab

        topBarText.appendChild( text ); // Add text content
        topBarText.appendChild( link ); // Add the link
    };


    f.showUsers = function ( message ) {
        // Displays a list of active users in the info pane
        var users, infoHolder;

        infoHolder = document.getElementById( "chattrr_out_info_tablebody" );

        // Clear existing user list
        while ( infoHolder.hasChildNodes( ) ) {
            infoHolder.removeChild( infoHolder.lastChild );
        }

        users = message.users; // Get users object from message

        // Iterate through users and create DOM elements for each
        _.keys( users ).forEach( function ( name ) {
            var line, url, link, nameCell, id;

            line                = document.createElement( "tr" );
            line.className      = "chattrr_out_info_line";
            infoHolder.appendChild( line );

            id                  = document.createElement( "td" );
            id.className        = "chattrr_out_info_line_users";
            line.appendChild( id );

            nameCell            = document.createElement( "td" );
            nameCell.className  = "chattrr_out_info_line_url";
            line.appendChild( nameCell );

            id.textContent      = users[ name ]; // User ID
            nameCell.textContent = name; // User name
        } );
    };


    f.writePopularUrlsToDom = function ( message ) {
        // Displays popular URLs in the info pane
        var infoHolder = document.getElementById( "chattrr_out_info_tablebody" );

        // Clear existing URL list
        while ( infoHolder.hasChildNodes( ) ) {
            infoHolder.removeChild( infoHolder.lastChild );
        }

        // Iterate through URL info and create DOM elements
        message.urls.forEach( function ( urlInfo ) {
            var line, url, link, users;

            line                = document.createElement( "tr" );
            line.className      = "chattrr_out_info_line";
            infoHolder.appendChild( line );

            users               = document.createElement( "td" );
            users.className     = "chattrr_out_info_line_users";
            line.appendChild( users );

            url                 = document.createElement( "td" );
            url.className       = "chattrr_out_info_line_url";
            line.appendChild( url );

            link                = document.createElement( "a" );
            link.className      = "chattrr_out_info_line_urllink";
            url.appendChild( link );

            users.textContent   = urlInfo[ 1 ]; // Count of users
            link.href           = urlInfo[ 0 ]; // URL link
            link.textContent    = urlInfo[ 0 ]; // URL text
        } );
    };


    f.writeMessageToDom = function ( message ) {
        // Writes a single chat message to the main chat output area
        var atBottom, parent, tbody, holder, nameHolder, idHolder,
            timeHolder, msgHolder;

        parent = document.getElementById( "chattrr_out_tableHolder" );
        if ( !parent ) {
            // It's probably been closed, so just return
            return;
        }

        tbody       = document.getElementById( "chattrr_out_tablebody" );
        holder      = document.createElement( "tr" );
        nameHolder  = document.createElement( "td" );
        idHolder    = document.createElement( "td" );
        timeHolder  = document.createElement( "td" );
        msgHolder   = document.createElement( "td" );

        // If message was marked as lost, remove it from the lost messages list
        if ( lostMessages[ message.seq ] ) {
            delete lostMessages[ message.seq ];
        }

        // Assign CSS classes
        nameHolder.className    = "chattrr_nameHolder";
        idHolder.className      = "chattrr_idHolder";
        timeHolder.className    = "chattrr_timeHolder";
        msgHolder.className     = "chattrr_msgHolder";

        // Set text content
        nameHolder.textContent  = message.name;
        idHolder.textContent    = message.id;
        timeHolder.textContent  = new Date( message.time ).toLocaleTimeString( );
        timeHolder.title        = new Date( message.time ).toLocaleDateString( );

        f.assignMessage( msgHolder, message.msg ); // Process and assign message content

        // Handle original message if translated
        if ( message.origMsg ) {
            msgHolder.title         = message.origMsg;
            msgHolder.className     += " chattrr_translatedText";
        }
        holder.className        = "chattrr_message"; // Message row class

        // Check if user is scrolled near the bottom
        atBottom = ( parent.scrollHeight - parent.clientHeight ) <
            ( parent.scrollTop + 5 );

        // Append elements to the DOM
        tbody.appendChild( holder );
        holder.appendChild( nameHolder );
        holder.appendChild( idHolder );
        holder.appendChild( timeHolder );
        holder.appendChild( msgHolder );

        // Scroll to bottom if user was near bottom
        if ( atBottom ) {
            parent.scrollTop = parent.scrollHeight - parent.clientHeight;
        }

        // Trigger title flashing if it's not a system message or user's own message
        if ( !justStarted && ( message.id !== 0 ) && ( message.id !== userId ) ) {
            titleFlashing = true;
            f.flashTitle( false );
        }
    };


    f.assignMessage = function ( msgHolder, msg ) {
        // Processes message text, linkifies URLs, and appends to message holder
        linkify( msg, {
            callback: function ( text, href ) {
                var el;
                if ( href ) {
                    // If it's a link
                    el              = document.createElement( "a" );
                    el.href         = href;
                    el.target       = "_blank"; // Open in new tab
                    el.textContent  = f.processLinkText( text ); // Shorten link text if too long
                    el.title        = text; // Full link text as title
                }
                else {
                    // If it's plain text
                    el              = document.createElement( "span" );
                    el.textContent  = text = f.processMessageText( text ); // Process message text for word wrapping
                }
                msgHolder.appendChild( el ); // Add element to message holder
            }
        } );
    };


    f.processLinkText = function ( rawText ) {
        // Shortens long link text for display
        var text;
        if ( rawText.length > 30 ) {
            text = rawText.substring( 0, 15 ) + "\u2026" +
                rawText.substring( rawText.length - 15 );
        }
        else {
            text = rawText;
        }
        return text;
    };


    f.processMessageText = function ( rawText ) {
        // Splits message into words and processes each word for wrapping
        var text;
        text = rawText.split( ' ' ).map( f.processMessageWord ).join( ' ' );
        return text;
    };


    f.processMessageWord = function ( word ) {
        // Inserts zero-width spaces into long words to allow wrapping
        var res = "";
        while ( word.length > 10 ) {
            if ( word.length > 20 ) {
                res += word.substring( 0, 10 ) + "\u200B"; // Add zero-width space
                word = word.substring( 10 );
            }
            else {
                res += word;
                word = "";
            }
        }
        res += word;
        return res;
    };


    f.flashTitle = function ( flashedOnce ) {
        // Manages the browser tab title flashing effect
        if ( allowFlashing && titleFlashing && !titleFlashingTimeout ) {
            titleFlashingTimeout = setTimeout( function ( ) {
                titleFlashingTimeout = null; // Clear timeout ID
                document.title = "*!" +
                    ( flashedOnce ? document.title.substring( 2 ) : document.title ); // Change title prefix
                titleFlashingTimeout = setTimeout( function ( ) {
                    titleFlashingTimeout = null; // Clear timeout ID
                    document.title = "* " + document.title.substring( 2 ); // Change title prefix
                    f.flashTitle( true ); // Continue flashing
                }, 1000 ); // Flash interval
            }, flashedOnce ? 1000 : ( 10 * 1000 ) ); // Initial delay or subsequent delay
        }
        else if ( !titleFlashing ) {
            clearTimeout( titleFlashingTimeout ); // Stop any ongoing flashing
            // Reset title if it was prefixed
            if ( ( document.title.substring( 0, 2 ) === "*!" ) ||
                ( document.title.substring( 0, 2 ) === "* " ) ) {
                document.title = document.title.substring( 2 );
            }
        }
    };


    f.connectSendButton = function ( ) {
        // Connects event listeners for the send button and input field
        if ( sendButtonConnected ) {
            return; // Already connected
        }
        sendButtonConnected = true; // Mark as connected

        var send = function ( ) {
            // Function to handle sending a message or command
            var el          = document.getElementById( "chattrr_in" ),
                msg         = { },
                text        = el.value,
                seq,
                sendText    = true,
                sendMessage = true;

            if ( text.trim( ).length === 0 ) {
                return; // Do nothing if input is empty
            }

            // Command parsing logic
            if ( text.match( /^set name:/ ) ) {
                sendText = false;
                f.grabName( msg, text.substring( 9 ) );
            }
            else if ( text.match( /^\/nick / ) ) {
                sendText = false;
                f.grabName( msg, text.substring( 6 ) );
            }
            else if ( ( text.match( /^\/quit/ ) ) ||
                ( text.match( /^\/exit/ ) ) ||
                ( text.match( /^\/close/ ) ) ) {
                f.closeWindow( );
                return;
            }
            else if ( text.match( /^\/clear/ ) ) {
                f.clearHistory( );
                sendMessage = false;
                sendText = false;
            }
            else if ( text.match( /^\/reload/ ) ) {
                f.reloadWindow( );
                return;
            }
            else if ( text.match( /^\/force/ ) ) {
                f.forceUrl( msg );
                sendText = false;
            }
            else if ( text.match( /^set history depth:/ ) ) {
                sendText = false;
                f.grabDepth( msg, text.substring( 18 ) );
            }
            else if ( text.match( /^\/depth/ ) ) {
                sendText = false;
                f.grabDepth( msg, text.substring( 7 ) );
            }
            else if ( text.match( /^\/help/ ) ) {
                f.showHelp( );
                sendMessage = false;
                sendText = false;
            }
            else if ( text.match( /^\/users/ ) ) {
                f.requestUsers( msg );
                sendText = false;
            }
            else if ( text.match( /^\/minbs / ) ) {
                f.grabMinBoardSize( msg, text.substring( 7 ) );
                sendText = false;
            }
            else if ( text.match( /^\/maxbs / ) ) {
                f.grabMaxBoardSize( msg, text.substring( 7 ) );
                sendText = false;
            }
            else if ( text.match( /^\/flash / ) ) {
                f.grabFlash( msg, text.substring( 7 ) );
                sendText = false;
            }
            else if ( text.match( /^\/password/ ) ) {
                f.setPassword( );
                el.value = ""; // Clear input field
                msg.msg = text; // Store command in history
                history.push( msg );
                historyIndex = history.length;
                return;
            }
            else {
                f.grabMessage( msg, text ); // Regular message
            }

            if ( sendText ) {
                seq             = messageIndex;
                messageIndex    += 1;
                msg.seq         = seq;
                msg.msg         = text;
                lostMessages[ seq ] = msg; // Store message in case of loss
            }

            history.push( msg ); // Add to history
            historyIndex = history.length; // Update history index

            if ( sendMessage ) {
                if ( socketHolder.socket && socketHolder.socket.connected ) {
                    socketHolder.socket.send( JSON.stringify( msg ) ); // Send message via socket
                }
            }

            if ( !sendText ) {
                msg.msg = text; // Ensure message content is stored for history
            }

            el.value = ""; // Clear input field
            el.focus( ); // Focus back on input
        };

        // Event listener to stop title flashing on mouse movement
        document.body.addEventListener( "mousemove", function ( ) {
            titleFlashing = false;
        }, false );

        // Event listener for the send button click
        document.getElementById( "chattrr_send" ).addEventListener(
            "click", send, false );

        // Event listener for keydown in the input field (for history navigation)
        document.getElementById( "chattrr_in" ).addEventListener( "keydown",
            function ( event ) {
                var el = document.getElementById( "chattrr_in" );
                titleFlashing = false; // Stop flashing on user interaction

                if ( event.keyCode === 38 ) {
                    // Up arrow key
                    if ( historyIndex > 0 ) {
                        historyIndex -= 1;
                        el.value = history[ historyIndex ].msg; // Set input to previous message
                    }
                }
                else if ( event.keyCode === 40 ) {
                    // Down arrow key
                    if ( historyIndex < history.length - 1 ) {
                        historyIndex += 1;
                        el.value = history[ historyIndex ].msg; // Set input to next message
                    }
                }
                event.stopPropagation( ); // Prevent default browser behavior
            }, false );

        // Event listener for keyup (no specific action, just stop propagation)
        document.getElementById( "chattrr_in" ).addEventListener( "keyup",
            function ( event ) {
                event.stopPropagation( );
            }, false );

        // Event listener for keypress (for Enter key to send message)
        document.getElementById( "chattrr_in" ).addEventListener( "keypress",
            function ( event ) {
                if ( event.which === 13 ) {
                    send( ); // Call send function on Enter
                }
                event.stopPropagation( );
            }, false );
    };


    f.grabName = function ( msg, text ) {
        // Handles setting a new user name
        var now = new Date( ).getTime( );
        if ( now - lastSetNameTime > 10000 ) {
            // Only allow name change every 10 seconds
            msg.name        = text.trim( ).substring( 0, 16 ); // Trim and limit name length
            lastSetNameTime = now;
        }
        else {
            f.showMessage(
                "You can only set your name once every 10 seconds. Calm down!" );
        }
    };


    f.grabDepth = function ( msg, text ) {
        // Handles setting chat history depth
        var historyCountText, historyCountValue;

        historyCountText = text.trim( );
        if ( historyCountText ) {
            historyCountValue = parseInt( historyCountText, 10 ); // Parse integer
            if ( !isNaN( historyCountValue ) && ( historyCountValue >= 0 ) ) {
                if ( historyCountValue > 20 ) {
                    historyCountValue = 20; // Cap at 20
                }
                msg.historyCount = historyCountValue;
            }
        }
    };
}( ) ); // End of IIFE