/*
 * This is a Type I clone of the original JavaScript chat application code.
 *
 * It maintains exact semantic equivalence, ensuring that all identifiers,
 * variable names, function names, operators, and expressions remain
 * completely unchanged.
 *
 * The only modifications are extensive variations in whitespace (indentation,
 * spacing, blank lines) and comments (addition, removal, or modification
 * of their content and style).
 *
 * The goal is to make the code visually distinct from its original form
 * without altering its logical or structural behavior in any way.
 */
( function ( $ ) {

    /*
     * Declare and initialize global application parameters.
     * These variables define various constants and state for the chat client.
     */
    var NICK_MAX_LENGTH   =   15 ,         // Maximum allowed length for a user's nickname.
        ROOM_MAX_LENGTH   =   10 ,         // Maximum allowed length for a chat room name.
        lockShakeAnimation = false ,       // Flag to prevent multiple shake animations from running concurrently.
        socket            =   null ,       // WebSocket connection instance (socket.io).
        clientId          =   null ,       // Unique identifier for the current client.
        nickname          =   null ,       // The user's chosen nickname.

        // Variable to hold the name of the chat room the user is currently in.
        currentRoom       =   null ,

        // Server-related information and display settings.
        serverAddress     =   'http://localhost' ,  // The base address of the chat server.
        serverDisplayName =   'Server' ,             // Display name for system messages.
        serverDisplayColor = '#1c5380' ,             // Color for server messages in the chat.

        /*
         * Collection of jQuery templates used for rendering various UI components
         * such as message rows, client entries, and room entries.
         * These templates are processed using jQuery.tmpl.
         */
        tmplt             =   {
            room    :   [
                '<li data-roomId="${room}" >' ,
                '  <span class="icon" ></span> ${room}' ,
                '</li>'
            ] . join ( "" ) ,
            client  :   [
                '<li data-clientId="${clientId}" class="cf" >' ,
                '  <div class="fl clientName" ><span class="icon" ></span> ${nickname}</div>' ,
                '  <div class="fr composing" ></div>' ,
                '</li>'
            ] . join ( "" ) ,
            message :   [
                '<li class="cf" >' ,
                '  <div class="fl sender" >${sender}: </div><div class="fl text" >${text}</div><div class="fr time" >${time}</div>' ,
                '</li>'
            ] . join ( "" )
        } ;


    /**
     * @function bindDOMEvents
     * @description
     * Attaches event listeners to various DOM elements, handling user interactions
     * like button clicks and keyboard inputs. This sets up the client-side UI behavior.
     */
    function bindDOMEvents ( ) {

        // Event handler for keydown events in the main chat input field.
        // Specifically listens for the 'Enter' key to send messages.
        $( '.chat-input input' ) . on ( 'keydown' , function ( e ) {
            var key   =   e . which   ||   e . keyCode ;
            if ( key   ==   13 ) {
                handleMessage ( ) ;
            }
        } ) ;

        // Event handler for the click event on the chat submit button.
        // Triggers the message sending function.
        $( '.chat-submit button' ) . on ( 'click' , function ( ) {
            handleMessage ( ) ;
        } ) ;


        // Keydown event handler for the nickname input field in the popup.
        // 'Enter' key confirms the nickname.
        $( '#nickname-popup .input input' ) . on ( 'keydown' , function ( e ) {
            var key   =   e . which   ||   e . keyCode ;
            if ( key   ==   13 ) {
                handleNickname ( ) ;
            }
        } ) ;

        // Click event handler for the 'Begin' button in the nickname popup.
        // Confirms the nickname.
        $( '#nickname-popup .begin' ) . on ( 'click' , function ( ) {
            handleNickname ( ) ;
        } ) ;


        // Keydown event handler for the room creation input field in its popup.
        // 'Enter' key initiates room creation.
        $( '#addroom-popup .input input' ) . on ( 'keydown' , function ( e ) {
            var key   =   e . which   ||   e . keyCode ;
            if ( key   ==   13 ) {
                createRoom ( ) ;
            }
        } ) ;

        // Click event handler for the 'Create' button in the add room popup.
        // Initiates room creation.
        $( '#addroom-popup .create' ) . on ( 'click' , function ( ) {
            createRoom ( ) ;
        } ) ;


        // Click handler for the 'Start Chat' button, which opens the nickname popup.
        $( '.big-button-green.start' ) . on ( 'click' , function ( ) {
            $( '#nickname-popup .input input' ) . val ( '' ) ;
            Avgrund . show ( '#nickname-popup' ) ;
            // Set a timeout to focus the input field after the popup is shown.
            window . setTimeout ( function ( ) {
                $( '#nickname-popup .input input' ) . focus ( ) ;
            } , 100 ) ;
        } ) ;

        // Click handler for the 'Add Room' button, opening the room creation popup.
        $( '.chat-rooms .title-button' ) . on ( 'click' , function ( ) {
            $( '#addroom-popup .input input' ) . val ( '' ) ;
            Avgrund . show ( '#addroom-popup' ) ;
            // Set a timeout to focus the input field after the popup is shown.
            window . setTimeout ( function ( ) {
                $( '#addroom-popup .input input' ) . focus ( ) ;
            } , 100 ) ;
        } ) ;


        // Scroll event handler for the chat rooms list.
        // Adjusts the position of the selected room indicator.
        $( '.chat-rooms ul' ) . on ( 'scroll' , function ( ) {
            $( '.chat-rooms ul li.selected' ) . css ( 'top' , $( this ) . scrollTop ( ) ) ;
        } ) ;


        // Scroll event handler for the chat messages area.
        // Adds/removes a 'scroll' class based on whether the user has scrolled up.
        $( '.chat-messages' ) . on ( 'scroll' , function ( ) {
            var self   =   this ;
            window . setTimeout ( function ( ) {
                if ( $( self ) . scrollTop ( )   +   $( self ) . height ( )   <   $( self ) . find ( 'ul' ) . height ( ) ) {
                    $( self ) . addClass ( 'scroll' ) ;
                } else {
                    $( self ) . removeClass ( 'scroll' ) ;
                }
            } , 50 ) ;
        } ) ;


        // Live click handler for room list items.
        // Switches to the clicked room if it's not the current one.
        $( '.chat-rooms ul li' ) . live ( 'click' , function ( ) {
            var room   =   $( this ) . attr ( 'data-roomId' ) ;
            if ( room   !=   currentRoom ) {
                socket . emit ( 'unsubscribe' , { room : currentRoom } ) ;
                socket . emit ( 'subscribe' , { room : room } ) ;
            }
        } ) ;

    } // End of bindDOMEvents function.


    /**
     * @function bindSocketEvents
     * @description
     * Sets up all the event listeners for the WebSocket connection (socket.io).
     * These events are typically emitted from the server.
     */
    function bindSocketEvents ( ) {

        /*
         * Handles the 'connect' event, which is fired by the server
         * once a successful connection is established.
         */
        socket . on ( 'connect' , function ( ) {
            // Acknowledges the connection back to the server,
            // sending the client's chosen nickname.
            socket . emit ( 'connect' , { nickname : nickname } ) ;
        } ) ;

        /*
         * Handles the 'ready' event. This event is typically fired by the server
         * after a client has successfully connected and been assigned a client ID.
         * It signals that the client can now begin interacting with the chat.
         */
        socket . on ( 'ready' , function ( data ) {
            // Hides the "connecting..." overlay message.
            $( '.chat-shadow' ) . animate ( { 'opacity' : 0 } , 200 , function ( ) {
                $( this ) . hide ( ) ;
                $( '.chat input' ) . focus ( ) ;
            } ) ;

            // Stores the received client ID locally for future reference.
            clientId   =   data . clientId ;
        } ) ;


        /*
         * Handles the 'roomslist' event, which provides an initial list
         * of all active chat rooms on the server. This is usually sent
         * upon client initialization.
         */
        socket . on ( 'roomslist' , function ( data ) {
            for ( var i   =   0 , len   =   data . rooms . length ; i   <   len ; i ++ ) {
                // The socket.io library automatically joins every socket to a default
                // room with an empty string name. We want to filter this out
                // so it's not displayed in the UI.
                if ( data . rooms [ i ]   !=   '' ) {
                    addRoom ( data . rooms [ i ] , false ) ;
                }
            }
        } ) ;


        /*
         * Handles the 'chatmessage' event. This event is triggered when
         * another client sends a message, and the server relays it to us.
         */
        socket . on ( 'chatmessage' , function ( data ) {
            var nickname   =   data . client . nickname ;
            var message    =   data . message ;

            // Displays the received message in the chat window.
            insertMessage ( nickname , message , true , false , false ) ;
        } ) ;


        /*
         * Handles the 'roomclients' event. This event is received when
         * a client successfully subscribes to a room, and the server
         * provides a list of all clients currently in that room.
         */
        socket . on ( 'roomclients' , function ( data ) {

            // Adds the new room to the UI's list of rooms, if it's not already there.
            addRoom ( data . room , false ) ;

            // Updates the application's state to reflect the current room.
            setCurrentRoom ( data . room ) ;

            // Displays a welcome message in the chat for the newly joined room.
            insertMessage ( serverDisplayName , 'Welcome to the room: `'   +   data . room   +   '`... enjoy!' , true , false , true ) ;
            $( '.chat-clients ul' ) . empty ( ) ; // Clears existing client list.

            // Adds the current user to the client list, marking them as 'me'.
            addClient ( { nickname : nickname , clientId : clientId } , false , true ) ;
            // Iterates through the list of other clients received from the server and adds them.
            for ( var i   =   0 , len   =   data . clients . length ; i   <   len ; i ++ ) {
                if ( data . clients [ i ] ) {
                    addClient ( data . clients [ i ] , false ) ;
                }
            }

            // Hides the "connecting to room" message or similar overlay.
            $( '.chat-shadow' ) . animate ( { 'opacity' : 0 } , 200 , function ( ) {
                $( this ) . hide ( ) ;
                $( '.chat input' ) . focus ( ) ;
            } ) ;
        } ) ;


        /*
         * Handles the 'addroom' event. This event is emitted by the server
         * when a new room is created by any client, notifying all other clients.
         */
        socket . on ( 'addroom' , function ( data ) {
            addRoom ( data . room , true ) ;
        } ) ;


        /*
         * Handles the 'removeroom' event. This event is emitted by the server
         * when a room becomes empty and is subsequently destroyed.
         */
        socket . on ( 'removeroom' , function ( data ) {
            removeRoom ( data . room , true ) ;
        } ) ;


        /*
         * Handles the 'presence' event. This event notifies clients about
         * users joining ('online') or leaving ('offline') the current room.
         */
        socket . on ( 'presence' , function ( data ) {
            if ( data . state   ==   'online' ) {
                addClient ( data . client , true ) ;
            } else if ( data . state   ==   'offline' ) {
                removeClient ( data . client , true ) ;
            }
        } ) ;

    } // End of bindSocketEvents function.


    /**
     * @function addRoom
     * @description
     * Adds a new chat room to the list displayed in the UI.
     * Socket.io might add a trailing slash to room names, which is handled here.
     *
     * @param {string} name     - The name of the room to add.
     * @param {boolean} announce - If true, a system message announcing the room's creation is displayed.
     */
    function addRoom ( name , announce ) {
        // Removes any potential trailing slashes from the room name.
        name   =   name . replace ( '/' , '' ) ;

        // Checks if a room with this name already exists in the UI list.
        if ( $( '.chat-rooms ul li[data-roomId="'   +   name   +   '"]' ) . length   ==   0 ) {
            // Uses the room template to append a new room entry to the list.
            $ . tmpl ( tmplt . room , { room : name } ) . appendTo ( '.chat-rooms ul' ) ;
            // If the announce flag is true, display a system message.
            if ( announce ) {
                insertMessage ( serverDisplayName , 'The room `'   +   name   +   '` created...' , true , false , true ) ;
            }
        }
    }


    /**
     * @function removeRoom
     * @description
     * Removes a chat room from the UI's list of rooms.
     *
     * @param {string} name     - The name of the room to remove.
     * @param {boolean} announce - If true, a system message announcing the room's destruction is displayed.
     */
    function removeRoom ( name , announce ) {
        // Finds and removes the room list item matching the given room name.
        $( '.chat-rooms ul li[data-roomId="'   +   name   +   '"]' ) . remove ( ) ;

        // If the announce flag is true, display a system message.
        if ( announce ) {
            insertMessage ( serverDisplayName , 'The room `'   +   name   +   '` destroyed...' , true , false , true ) ;
        }
    }


    /**
     * @function addClient
     * @description
     * Adds a client's entry to the UI's client list for the current room.
     *
     * @param {object} client   - An object containing client details (e.g., nickname, clientId).
     * @param {boolean} announce - If true, a system message announcing the client's join is displayed.
     * @param {boolean} isMe     - If true, marks this client as the current user (e.g., with a distinct style).
     */
    function addClient ( client , announce , isMe ) {
        var $html   =   $ . tmpl ( tmplt . client , client ) ;

        // If this client represents the current user, add a specific class for styling.
        if ( isMe ) {
            $html . addClass ( 'me' ) ;
        }

        // If the announce flag is true, display a system message.
        if ( announce ) {
            insertMessage ( serverDisplayName , client . nickname   +   ' has joined the room...' , true , false , true ) ;
        }
        // Appends the generated client HTML to the client list.
        $html . appendTo ( '.chat-clients ul' ) ;
    }


    /**
     * @function removeClient
     * @description
     * Removes a client's entry from the UI's client list.
     *
     * @param {object} client   - An object containing client details (e.g., clientId).
     * @param {boolean} announce - If true, a system message announcing the client's departure is displayed.
     */
    function removeClient ( client , announce ) {
        // Finds and removes the client list item matching the given client ID.
        $( '.chat-clients ul li[data-clientId="'   +   client . clientId   +   '"]' ) . remove ( ) ;

        // If the announce flag is true, display a system message.
        if ( announce ) {
            insertMessage ( serverDisplayName , client . nickname   +   ' has left the room...' , true , false , true ) ;
        }
    }


    /**
     * @function createRoom
     * @description
     * Handles the logic for creating a new chat room.
     * If the room name is valid and new, the client unsubscribes from the current room
     * and subscribes to the newly created one. If a room with the same name already
     * exists, the user will simply join that existing room.
     */
    function createRoom ( ) {
        var room   =   $( '#addroom-popup .input input' ) . val ( ) . trim ( ) ;
        // Validate room name: must not be empty, within max length, and different from current room.
        if ( room   &&   room . length   <=   ROOM_MAX_LENGTH   &&   room   !=   currentRoom ) {

            // Shows a temporary message indicating room creation is in progress.
            $( '.chat-shadow' ) . show ( ) . find ( '.content' ) . html ( 'Creating room: '   +   room   +   '...' ) ;
            $( '.chat-shadow' ) . animate ( { 'opacity' : 1 } , 200 ) ;

            // Unsubscribe from the room the client is currently in.
            socket . emit ( 'unsubscribe' , { room : currentRoom } ) ;

            // Emit an event to the server to create/subscribe to the new room.
            socket . emit ( 'subscribe' , { room : room } ) ;
            Avgrund . hide ( ) ; // Hides the room creation popup.
        } else {
            // If validation fails, trigger a visual "shake" animation and clear the input.
            shake ( '#addroom-popup' , '#addroom-popup .input input' , 'tada' , 'yellow' ) ;
            $( '#addroom-popup .input input' ) . val ( '' ) ;
        }
    }


    /**
     * @function setCurrentRoom
     * @description
     * Updates the application's internal state to reflect the currently active room
     * and visually highlights it in the UI's room list.
     *
     * @param {string} room - The name of the room to set as current.
     */
    function setCurrentRoom ( room ) {
        currentRoom   =   room ;
        // Removes the 'selected' class from any previously selected room.
        $( '.chat-rooms ul li.selected' ) . removeClass ( 'selected' ) ;
        // Adds the 'selected' class to the list item corresponding to the new current room.
        $( '.chat-rooms ul li[data-roomId="'   +   room   +   '"]' ) . addClass ( 'selected' ) ;
    }


    /**
     * @function handleNickname
     * @description
     * Processes the user's input for their nickname.
     * If valid, saves the nickname and initiates the connection to the chat server.
     */
    function handleNickname ( ) {
        var nick   =   $( '#nickname-popup .input input' ) . val ( ) . trim ( ) ;
        // Validate nickname: must not be empty and within max length.
        if ( nick   &&   nick . length   <=   NICK_MAX_LENGTH ) {
            nickname   =   nick ; // Stores the valid nickname.
            Avgrund . hide ( ) ; // Hides the nickname input popup.
            connect ( ) ;        // Initiates the server connection.
        } else {
            // If validation fails, trigger a visual "shake" animation and clear the input.
            shake ( '#nickname-popup' , '#nickname-popup .input input' , 'tada' , 'yellow' ) ;
            $( '#nickname-popup .input input' ) . val ( '' ) ;
        }
    }


    /**
     * @function handleMessage
     * @description
     * Processes the message entered by the user in the chat input field.
     * If the message is not empty, it's sent to the server and displayed locally.
     */
    function handleMessage ( ) {
        var message   =   $( '.chat-input input' ) . val ( ) . trim ( ) ;
        if ( message ) {

            // Emits the 'chatmessage' event to the server, including the message content
            // and the name of the current room.
            socket . emit ( 'chatmessage' , { message : message , room : currentRoom } ) ;

            // Displays the sent message immediately in the local chat window.
            insertMessage ( nickname , message , true , true ) ;
            $( '.chat-input input' ) . val ( '' ) ; // Clears the input field.
        } else {
            // If the message is empty, trigger a visual "shake" animation on the chat input.
            shake ( '.chat' , '.chat input' , 'wobble' , 'yellow' ) ;
        }
    }


    /**
     * @function insertMessage
     * @description
     * Inserts a new message into the chat display area. This function provides
     * options for showing the timestamp, marking the message as from the current user,
     * or marking it as a server message.
     *
     * @param {string} sender   - The name of the message sender.
     * @param {string} message  - The actual message content.
     * @param {boolean} showTime - If true, a timestamp will be added to the message.
     * @param {boolean} isMe     - If true, the message will be styled to indicate it was sent by the current user.
     * @param {boolean} isServer - If true, the message will be styled as a system/server message.
     */
    function insertMessage ( sender , message , showTime , isMe , isServer ) {
        var $html   =   $ . tmpl ( tmplt . message , {
            sender : sender ,
            text   : message ,
            time   : showTime   ?   getTime ( )   :   ''
        } ) ;

        // If 'isMe' is true, add a 'marker' class to visually distinguish
        // messages sent by the current user.
        if ( isMe ) {
            $html . addClass ( 'marker' ) ;
        }

        // If 'isServer' is true, apply a specific color to the sender's name
        // to indicate it's a server message.
        if ( isServer ) {
            $html . find ( '.sender' ) . css ( 'color' , serverDisplayColor ) ;
        }
        // Appends the rendered message HTML to the chat messages list.
        $html . appendTo ( '.chat-messages ul' ) ;
        // Scrolls the chat messages container to the bottom to show the latest message.
        $( '.chat-messages' ) . animate ( { scrollTop : $( '.chat-messages ul' ) . height ( ) } , 100 ) ;
    }


    /**
     * @function getTime
     * @description
     * Helper function to generate a formatted short time string (HH:MM)
     * for displaying next to chat messages.
     *
     * @returns {string} The formatted time string.
     */
    function getTime ( ) {
        var date   =   new Date ( ) ;
        return ( date . getHours ( )   <   10   ?   '0'   +   date . getHours ( ) . toString ( )   :   date . getHours ( ) )   +   ':'   +
            ( date . getMinutes ( )   <   10   ?   '0'   +   date . getMinutes ( ) . toString ( )   :   date . getMinutes ( ) ) ;
    }


    /**
     * @function shake
     * @description
     * Triggers a visual "shake" animation on a specified container and input element.
     * Used to provide feedback for invalid input or actions.
     * Prevents multiple concurrent shake animations using `lockShakeAnimation`.
     *
     * @param {string} container - CSS selector for the main container element to shake.
     * @param {string} input     - CSS selector for the input element to highlight.
     * @param {string} effect    - CSS class for the shake animation (e.g., 'tada', 'wobble').
     * @param {string} bgColor   - CSS class for the background color highlight (e.g., 'yellow').
     */
    function shake ( container , input , effect , bgColor ) {
        if ( ! lockShakeAnimation ) {
            lockShakeAnimation   =   true ;
            $( container ) . addClass ( effect ) ;
            $( input ) . addClass ( bgColor ) ;
            // Remove animation classes after a delay and re-enable shaking.
            window . setTimeout ( function ( ) {
                $( container ) . removeClass ( effect ) ;
                $( input ) . removeClass ( bgColor ) ;
                $( input ) . focus ( ) ; // Return focus to the input field.
                lockShakeAnimation   =   false ;
            } , 1500 ) ; // Animation duration is 1.5 seconds.
        }
    }


    /**
     * @function connect
     * @description
     * Initiates the connection to the chat server using Socket.IO.
     * This function is called after the user has successfully chosen a nickname.
     */
    function connect ( ) {
        // Displays a "Connecting..." message to the user.
        $( '.chat-shadow .content' ) . html ( 'Connecting...' ) ;

        // Establishes the Socket.IO connection to the specified server address.
        socket   =   io . connect ( serverAddress ) ;

        // Binds all the necessary Socket.IO event handlers to the newly created socket.
        bindSocketEvents ( ) ;
    }


    // Executes the following code once the DOM is fully loaded and ready.
    $( function ( ) {
        bindDOMEvents ( ) ; // Attaches all DOM event listeners.
    } ) ;


} ) ( jQuery ) ;