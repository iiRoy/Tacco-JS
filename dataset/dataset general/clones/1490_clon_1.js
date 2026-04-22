/*
 * This file contains the Angular module definition for ngPostMessage.
 * It provides services for inter-window communication using the postMessage API.
 * Created as a Type I clone to demonstrate whitespace and comment variations.
 */

( function ()
{
    // Enforces strict parsing and error handling in the script.
    'use strict';

    // Declare a variable to hold the Angular application module instance.
    var app;

    // Define the Angular module named "ngPostMessage" with a dependency on "ng".
    app = angular.module( "ngPostMessage", [ 'ng' ] );

    // Configure the run block for the application.
    // The run block executes after all services have been configured.
    app.run( [
        '$window',
        '$postMessage',
        '$rootScope',
        function ( $window, $postMessage, $rootScope )
        {
            /**
             * Listens for the '$messageOutgoing' event broadcast on the root scope.
             * This event signifies a message needs to be sent to another window.
             *
             * @param {Object} event   The Angular event object.
             * @param {*}      message The data payload to be sent.
             * @param {string} domain  The target origin for the message (e.g., "*", "http://example.com").
             */
            $rootScope.$on( '$messageOutgoing', function ( event, message, domain )
            {
                var sender; // Declare a variable to hold the message sender.

                // If no domain is specified, default to "*" (any origin).
                if ( domain == null )
                {
                    domain = "*";
                }

                // Determine the sender: prioritize a custom sender from rootScope,
                // otherwise default to the parent window.
                sender = $rootScope.sender || $window.parent;

                // Use the HTML5 postMessage API to send the message.
                return sender.postMessage( message, domain );
            } );

            // Bind a 'message' event listener to the window object.
            // This listener handles incoming messages from other windows.
            angular.element( $window ).bind( 'message', function ( event )
            {
                var error, response; // Declare variables for potential error and response data.

                // Normalize the event object to get the originalEvent if available,
                // which is common when using jQuery or Angular's event system.
                event = event.originalEvent || event;

                // Proceed only if the event and its data property exist.
                if ( event && event.data )
                {
                    response = null; // Initialize response to null.
                    // Store the source window of the message on the root scope for potential replies.
                    $rootScope.sender = event.source;

                    try
                    {
                        // Attempt to parse the incoming message data as JSON.
                        response = angular.fromJson( event.data );
                    }
                    catch ( _error )
                    {
                        // If JSON parsing fails, catch the error.
                        error = _error;
                        // Log the error to the console.
                        console.error( 'ahem', error );
                        // Use the raw event data as the response if JSON parsing was unsuccessful.
                        response = event.data;
                    }

                    // Broadcast an '$messageIncoming' event on the root scope with the parsed response.
                    // This allows other parts of the application to react to incoming messages.
                    $rootScope.$root.$broadcast( '$messageIncoming', response );

                    // Store the incoming message using the $postMessage service
                    // and return the updated list of messages.
                    return $postMessage.messages( response );
                }
            } );
        }
    ] );

    // Define the "$postMessage" factory service.
    // This service provides an API for sending and receiving messages.
    app.factory( "$postMessage", [
        '$rootScope', // Inject $rootScope dependency.
        function ( $rootScope )
        {
            var $messages, api; // Declare variables for message storage and the API object.

            $messages = []; // Initialize an array to hold all received messages.

            // Define the API object that will be returned by the factory.
            api =
            {
                /**
                 * Manages the list of incoming messages.
                 * If a message is provided, it's added to the list.
                 *
                 * @param {*} _message_ Optional message to add to the list.
                 * @returns {Array} The current list of all received messages.
                 */
                messages: function ( _message_ )
                {
                    // If a message payload is supplied, add it to the internal messages array.
                    if ( _message_ )
                    {
                        $messages.push( _message_ );
                        // Trigger a digest cycle to update any bindings that depend on $messages.
                        $rootScope.$digest();
                    }
                    // Always return the current collection of messages.
                    return $messages;
                },

                /**
                 * Retrieves the last message received.
                 *
                 * @returns {*} The most recently received message.
                 */
                lastMessage: function ()
                {
                    // Return the last element in the messages array.
                    return $messages[ $messages.length - 1 ];
                },

                /**
                 * Initiates sending a message to another window.
                 *
                 * @param {*}      message The data payload to be sent.
                 * @param {string} domain  The target origin for the message (e.g., "*", "http://example.com").
                 * @returns {Object} The event object from the broadcast.
                 */
                post: function ( message, domain )
                {
                    // If no domain is explicitly provided, default to "*" (any origin).
                    if ( !domain )
                    {
                        domain = "*";
                    }
                    // Broadcast the '$messageOutgoing' event, which will be caught by the run block listener
                    // to actually send the message via postMessage API.
                    return $rootScope.$broadcast( '$messageOutgoing', message, domain );
                }
            };

            // Return the constructed API object, making it available as the $postMessage service.
            return api;
        }
    ] );

} ).call( this ); // Execute the immediately invoked function expression (IIFE) with 'this' context.