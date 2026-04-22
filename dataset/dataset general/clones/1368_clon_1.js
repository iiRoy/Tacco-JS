;( function ( $, window ) {

    // Main object to handle Vimeo API interactions
    var vimeoJqueryAPI = {

        // Object to store return values from method calls and manage call count.
        // `methodreturn` stores results, `count` tracks pending calls.
        catchMethods : {
            methodreturn : [],
            count        : 0
        },

        /**
         * Initializes the Vimeo API handler.
         * This function is triggered by the window's 'message' event.
         * @param {Event} d - The original message event object.
         */
        init : function ( d ) {

            var vimeoVideo,     // Reference to the Vimeo iframe element
                vimeoAPIurl,    // Base URL for the Vimeo API (iframe src without query string)
                data;           // Parsed message data

            // Check if the message originated from Vimeo.
            // If not, ignore it to prevent processing irrelevant messages.
            if ( ! d . originalEvent . origin . match ( /vimeo/g ) ) {
                return; /* Exit if not from Vimeo */
            }


            // Ensure that the message contains actual data.
            if ( ! ( "data" in d . originalEvent ) ) {
                return; // No data, nothing to process
            }

            // Parse the incoming data. It could be a JSON string or an object.
            data = $ . type ( d . originalEvent . data ) === "string" ? $ . parseJSON ( d . originalEvent . data ) : d . originalEvent . data ;

            // If data is empty after parsing, there's nothing useful to do.
            if ( ! data ) {
                return ;
            }


            // Determine the target Vimeo video iframe based on the message.
            vimeoVideo  = this . setPlayerID ( data );
            // Get the clean API URL for the identified Vimeo iframe.
            vimeoAPIurl = this . setVimeoAPIurl ( vimeoVideo );

            // If the message is an event (e.g., 'ready', 'play', 'pause').
            if ( data . hasOwnProperty ( "event" ) ) {
                this . handleEvent ( data , vimeoVideo , vimeoAPIurl ) ;
            }

            // If the message is a method return (e.g., result of 'getVolume').
            if ( data . hasOwnProperty ( "method" ) ) {
                this . handleMethod ( data , vimeoVideo , vimeoAPIurl ) ;
            }

        } , // End of init function

        /**
         * Identifies the specific Vimeo player iframe on the page.
         * It tries to use a player_id from the data, or defaults to the first Vimeo iframe found.
         * @param {Object} d - The message data, potentially containing a player_id.
         * @returns {jQuery} The jQuery object representing the Vimeo iframe.
         */
        setPlayerID : function ( d ) {

            // Check if a specific player_id was provided in the message.
            if ( d . hasOwnProperty ( "player_id" ) ) {
                // Try to find by ID first.
                if ( $ ( "#" + d . player_id ) . length ) {
                    return $ ( "#" + d . player_id ) ;
                } else {
                    // If not found by ID, try finding an iframe whose src contains the player_id.
                    return $ ( "iframe[src*=" + d . player_id + "]" ) ;
                }
            } else {

                // No player_id provided.
                // Fallback: use the first Vimeo iframe found on the page.
                // This assumes only one Vimeo player or that the first one is the target.
                return $ ( "iframe[src*='vimeo']" ) . eq ( 0 ) ;
            }

        } , // End of setPlayerID

        /**
         * Extracts and normalizes the Vimeo API URL from the iframe's src attribute.
         * Ensures the URL has the correct protocol (http/https) and removes query parameters.
         * @param {jQuery} d - The jQuery object of the Vimeo iframe.
         * @returns {string} The base URL for the Vimeo API communications.
         */
        setVimeoAPIurl : function ( d ) {

            // Check if the src attribute already has a protocol.
            if ( d . attr ( 'src' ) . substr ( 0 , 4 ) !== 'http' ) {
                // If not, prepend the correct protocol (http or https) based on the current window location.
                return window . location . protocol !== 'https:' ? 'http:' + d . attr ( 'src' ) . split ( '?' ) [ 0 ] : 'https:' + d . attr ( 'src' ) . split ( '?' ) [ 0 ] ;
            } else {
                // If it already has a protocol, just remove any query string parameters.
                return d . attr ( 'src' ) . split ( '?' ) [ 0 ] ;
            }
        } , // End of setVimeoAPIurl

        /**
         * Handles messages that are return values from previously called methods.
         * Stores the returned value for later retrieval.
         * @param {Object} d - The message data containing the method's return value.
         * @param {jQuery} vid - The Vimeo iframe jQuery object (not directly used here but passed for consistency).
         * @param {string} api - The API URL (not directly used here).
         */
        handleMethod : function ( d , vid , api ) {

            // Add the returned value to the `methodreturn` array.
            this . catchMethods . methodreturn . push ( d . value ) ;

        } , // End of handleMethod

        /**
         * Handles messages that are Vimeo player events (e.g., 'ready', 'play', 'pause').
         * Triggers corresponding custom jQuery events on the iframe element.
         * @param {Object} d - The message data containing event information.
         * @param {jQuery} vid - The Vimeo iframe jQuery object.
         * @param {string} api - The API URL for sending messages back to the iframe.
         */
        handleEvent : function ( d , vid , api ) {
            // Use a switch statement to handle different event types.
            switch ( d . event . toLowerCase ( ) ) {
                case 'ready' :

                    // For 'ready' event:
                    // Iterate through all custom events attached to this Vimeo iframe
                    // and register them as listeners with the Vimeo player.
                    for ( var prop in $ . _data ( vid [ 0 ] , "events" ) ) {
                        // Only add specific event listeners that Vimeo supports.
                        if ( prop . match ( /loadProgress|playProgress|play|pause|finish|seek|cuechange/ ) ) {
                            vid [ 0 ] . contentWindow . postMessage ( JSON . stringify ( { method : 'addEventListener' , value : prop } ) , api ) ;
                        }
                    }

                    // If there were method calls queued before the video was ready,
                    // send them now that the player is initialized.
                    if ( vid . data ( "vimeoAPICall" ) ) {
                        var vdata = vid . data ( "vimeoAPICall" ) ;
                        for ( var i = 0 ; i < vdata . length ; i ++ ) {
                            vid [ 0 ] . contentWindow . postMessage ( JSON . stringify ( vdata [ i ] . message ) , vdata [ i ] . api ) ;
                        }
                        // Clear the queued calls after sending them.
                        vid . removeData ( "vimeoAPICall" ) ;
                    }

                    // Mark this video as ready and trigger a custom 'ready' event on the element.
                    vid . data ( "vimeoReady" , true ) ;
                    vid . triggerHandler ( "ready" ) ;

                    break ; // End of 'ready' case

                case 'seek' :
                    // Trigger custom 'seek' event with data.
                    vid . triggerHandler ( "seek" , [ d . data ] ) ;
                    break ;

                case 'loadprogress' :
                    // Trigger custom 'loadProgress' event with data.
                    vid . triggerHandler ( "loadProgress" , [ d . data ] ) ;
                    break ;

                case 'playprogress' :
                    // Trigger custom 'playProgress' event with data.
                    vid . triggerHandler ( "playProgress" , [ d . data ] ) ;
                    break ;

                case 'pause' :
                    // Trigger custom 'pause' event.
                    vid . triggerHandler ( "pause" ) ;
                    break ;

                case 'finish' :
                    // Trigger custom 'finish' event.
                    vid . triggerHandler ( "finish" ) ;
                    break ;

                case 'play' :
                    // Trigger custom 'play' event.
                    vid . triggerHandler ( "play" ) ;
                    break ;

                case 'cuechange' :
                    // Trigger custom 'cuechange' event.
                    vid . triggerHandler ( "cuechange" ) ;
                    break ;
            }
        } // End of handleEvent
    } ; // End of vimeoJqueryAPI object

    // Attach the init function to the window's 'message' event.
    // This allows the API to listen for communications from Vimeo iframes.
    $ ( window ) . on ( "message" , function ( e ) {
        vimeoJqueryAPI . init ( e ) ;
    } ) ;


    /**
     *  Vimeo jQuery method plugin (global utility function).
     *  Provides a way to send commands to a Vimeo iframe.
     *
     * @param {jQuery} element   The jQuery object representing the Vimeo iframe.
     * @param {string} option1   The method to send to Vimeo (e.g., 'play', 'getVolume').
     * @param {string|function} option2 If a string, it's the value for the method (e.g., '2' for setVolume).
     *                                  If a function, it's a callback to receive method return values.
     * @returns {jQuery} The original element, allowing for chaining.
     */
    $ . vimeo = function ( element , option1 , option2 ) {

        var message = { } , // Object to hold the method and value to send.
            catchMethodLength = vimeoJqueryAPI . catchMethods . methodreturn . length ; // Current length of return buffer.

        // Set the method name if option1 is a string.
        if ( typeof option1 === "string" ) {
            message . method = option1 ;
        }

        // Set the method value if option2 is provided and not a function.
        if ( typeof option2 !== undefined && typeof option2 !== "function" ) {
            message . value = option2 ;
        }

        // Check if the element is an iframe and a method is specified.
        if ( element . prop ( "tagName" ) . toLowerCase ( ) === 'iframe' && message . hasOwnProperty ( "method" ) ) {
            // If the Vimeo player is ready, send the message immediately.
            if ( element . data ( "vimeoReady" ) ) {
                element [ 0 ] . contentWindow . postMessage ( JSON . stringify ( message ) , vimeoJqueryAPI . setVimeoAPIurl ( element ) ) ;
            } else {
                // If not ready, queue the message to be sent later when the 'ready' event fires.
                var _data = element . data ( "vimeoAPICall" ) ? element . data ( "vimeoAPICall" ) : [ ] ;
                _data . push ( { message : message , api : vimeoJqueryAPI . setVimeoAPIurl ( element ) } ) ;
                element . data ( "vimeoAPICall" , _data ) ;
            }
        }

        // If this method is expected to return data (e.g., 'getVolume', 'paused')
        // AND a callback function is provided, then set up an interval to wait for the return value.
        if ( ( option1 . toString ( ) . substr ( 0 , 3 ) === "get" || option1 . toString ( ) === "paused" ) && typeof option2 === "function" ) {
            // Immediately Invoked Function Expression (IIFE) to capture current state.
            ( function ( cml , func , i ) {
                var interval = window . setInterval ( function ( ) {

                    // Check if a new method return value has been added to the buffer.
                    if ( vimeoJqueryAPI . catchMethods . methodreturn . length != cml ) {
                        // If new data is available, clear the interval.
                        window . clearInterval ( interval ) ;
                        // Call the provided callback function with the returned data.
                        func ( vimeoJqueryAPI . catchMethods . methodreturn [ i ] ) ;
                    }
                } , 10 ) ; // Check every 10 milliseconds.
            } ) ( catchMethodLength , option2 , vimeoJqueryAPI . catchMethods . count ) ;
            vimeoJqueryAPI . catchMethods . count ++ ; // Increment the counter for pending returns.
        }
        return element ; // Return the original jQuery element for chaining.
    } ; // End of $.vimeo

    /**
     *  Vimeo jQuery plugin for direct use on jQuery selections.
     *  Allows calling .vimeo() directly on a jQuery object.
     *
     * @param {string} option1   The method to send to Vimeo.
     * @param {string|function} option2 Value or callback for the method.
     * @returns {jQuery} The original jQuery selection.
     */
    $ . fn . vimeo = function ( option1 , option2 ) {
            // Delegates to the global $.vimeo utility function.
            return $ . vimeo ( this , option1 , option2 ) ;
    } ;

} ) ( jQuery , window ) ; // End of the IIFE, passing jQuery and window objects.