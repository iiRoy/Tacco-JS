/* This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity while varying
 * whitespace and comments extensively to create a visually distinct version.
 */
( function  ( root ,  factory )   {

    // Enable strict mode for better error handling and cleaner code.
    'use strict' ;

    // Check if AMD loader is present (e.g., Require.js)
    if (typeof define === 'function' && define.amd) {

        // Define the module for AMD.
        define( [ ] , factory ) ;

    } else {

        // Attach the module to the global scope (e.g., window in browsers).
        root.chromecast  =  factory( ) ;
    }

} ( window , function ( )   {

    // Again, 'use strict' for this inner factory function.
    'use strict' ;

    // Declare core objects: utilities, common functionality, sender, and receiver modules.
    var utils , Common , Sender = { } , Receiver = { } ;

    /*
     * The `utils` object provides helper functions used across the module.
     * These are general-purpose utilities for common tasks.
     */
    utils  =  {

        /**
         * Binds a function to a specific context.
         *
         * @param {Function} callback - The function to bind.
         * @param {Object} context - The context (`this`) for the callback.
         * @returns {Function} A new function with the bound context.
         */
        bind : function ( callback , context ) {
            // Returns a new function that applies the callback with the given context and arguments.
            return function ( ) {
                callback.apply( context , arguments ) ;
            } ;
        } ,

        /**
         * Extends a target object with properties from one or more source objects.
         * This is a shallow merge.
         *
         * @param {Object} target - The object to extend.
         * @param {...Object} sources - One or more source objects.
         */
        extend : function ( target ) {
            var attr = { } ;
            var i , origin ; // Loop counters and source object reference.

            // Iterate through all arguments starting from the second one (sources).
            for ( i = 1 ; i < arguments.length ; i++ ) {

                origin = arguments[ i ] ; // Get the current source object.

                // Iterate over properties of the source object.
                for ( attr in origin ) {

                    // Ensure the property is directly on the object, not from its prototype chain.
                    if ( origin.hasOwnProperty( attr ) ) {

                        target[ attr ] = origin[ attr ] ; // Copy the property.
                    }
                }
            }
        } ,

        /**
         * Creates a new object that inherits from a given module (prototype).
         * This simulates a simple classical inheritance pattern.
         *
         * @param {Object} Module - The object to inherit from (will be the prototype).
         * @returns {Object} A new object inheriting from Module.
         */
        create : function ( Module ) {
            var Obj  =  function ( ) { } ; // A temporary constructor.
            Obj.prototype  =  Module ; // Set its prototype to the provided Module.

            return new Obj( ) ; // Return a new instance.
        }
    } ;


    /*
     * The `Common` object provides shared functionality for both Sender and Receiver modules.
     * This includes event handling and options management.
     */
    Common  =  {
        _events : null , // Internal storage for event listeners.
        _options : null , // Internal storage for module options.

        /**
         * Registers an event listener.
         *
         * @param {string} event - The name of the event to listen for.
         * @param {Function} callback - The function to call when the event is triggered.
         * @returns {Object} `this` for method chaining.
         */
        on : function ( event , callback ) {

            // Initialize _events if it doesn't exist.
            if ( ! this._events ) {
                this._events = { } ;
            }

            // Initialize the event array for this specific event if it doesn't exist.
            if ( ! this._events[ event ] ) {
                this._events[ event ] = [ ] ;
            }

            this._events[ event ].push( callback ) ; // Add the callback to the event's list.

            return this ; // Allow chaining.
        } ,

        /**
         * Gets or sets module options.
         * If `opt` is provided, it extends the current options.
         *
         * @param {Object} [opt] - An object containing options to set.
         * @returns {Object} The current options object.
         */
        options : function ( opt ) {

            // Initialize _options if it doesn't exist.
            if ( ! this._options ) {
                this._options = { } ;
            }

            // If options are provided as an argument, extend current options.
            if ( arguments.length > 0 ) {
                utils.extend( this._options , opt ) ;
            }

            return this._options ; // Return the current options.
        } ,

        /**
         * Triggers a registered event, calling all associated callbacks.
         *
         * @param {string} eventName - The name of the event to trigger.
         * @param {*} [data] - Optional data to pass to the event listeners.
         */
        _trigger : function ( eventName , data ) {
            var i , events , event ; // Declare variables for loop and event handling.

            // If no events are registered or no listeners for this specific event, do nothing.
            if ( ! this._events || ! this._events[ eventName ] ) {
                return ;
            }

            events = this._events[ eventName ] ; // Get all listeners for this event.

            // Iterate over each registered event callback.
            for ( i = 0 ; i < events.length ; i++ ) {
                event = events[ i ] ; // Get the current callback function.
                event.call( this , data ) ; // Call the callback with the module's context and data.
            }
        }
    } ;

    // Extend the `Sender` object with `Common` functionalities and its specific methods.
    utils.extend( Sender , Common , {
        _session : null , // Stores the current Chromecast session object.

        /**
         * Initializes the Sender module.
         *
         * @param {Object} options - Configuration options for the sender.
         * @returns {Object} `this` for method chaining.
         */
        initialize : function ( options ) {
            this.options( options ) ; // Set the provided options.
            // Delay the initialization of the Cast API slightly to ensure the page is ready.
            setTimeout( utils.bind( this._initializeCast , this ) , 1000 ) ;
            return this ;
        } ,

        /**
         * Sends a message to the Chromecast receiver application.
         *
         * @param {string} message - The message payload to send.
         * @returns {Object} `this` for method chaining.
         */
        sendMessage : function ( message ) {
            var options  =  this.options( ) ; // Get current options.

            // Check if the Cast API is available before attempting to send.
            if ( ! this._isAvailable( ) ) {
                return this ;
            }

            // Send the message using the current session.
            this._session.sendMessage(
                options.namespace , // The namespace for the message.
                message ,           // The message content.
                utils.bind( this._success , this ) , // Success callback.
                utils.bind( this._error , this )    // Error callback.
            ) ;

            return this ;
        } ,

        /**
         * Requests a Chromecast session to start or join an existing session.
         *
         * @returns {Object} `this` for method chaining.
         */
        start : function ( ) {
            var options  =  this.options( ) ; // Retrieve current configuration options.

            // Request a new Chromecast session.
            chrome.cast.requestSession(
                utils.bind( function ( e ) {
                    this._session = e ; // Store the new session object.
                    // Add listeners for session updates and messages from the receiver.
                    this._session.addUpdateListener( utils.bind( this._sessionUpdateListener , this ) ) ;
                    this._session.addMessageListener( options.namespace , utils.bind( this._receiverMessage , this ) ) ;
                } , this ) ,
                utils.bind( this._error , this ) // Error callback for session request.
            ) ;

            return this ;
        } ,

        /**
         * Internal method to initialize the Google Cast API.
         * This sets up the session request and API configuration.
         *
         * @private
         * @returns {Object} `this` for method chaining.
         */
        _initializeCast : function ( ) {
            var options  =  this.options( ) ; // Get options, especially application ID.
            var sessionRequest ; // Variable to hold the session request.
            var apiConfig ; // Variable for API configuration.

            // Check if the Cast API is available in the current environment.
            if ( ! this._isAvailable( ) ) {
                return this ;
            }

            // Create a session request for the specified application ID.
            sessionRequest = new chrome.cast.SessionRequest( options.applicationID ) ;

            // Configure the Cast API with session request and listeners.
            apiConfig = new chrome.cast.ApiConfig(
                sessionRequest ,
                utils.bind( this._sessionListener , this ) , // Listener for new sessions.
                utils.bind( this._receiverListener , this )  // Listener for receiver status.
            ) ;

            // Initialize the Cast API.
            chrome.cast.initialize(
                apiConfig ,
                utils.bind( this._initSuccess , this ) , // Success callback for initialization.
                utils.bind( this._error , this )         // Error callback for initialization.
            ) ;

            return this ;
        } ,

        /**
         * Checks if the Google Cast API is available in the browser.
         *
         * @private
         * @returns {boolean} True if Cast API is available, false otherwise.
         */
        _isAvailable : function ( ) {
            // Check for the existence of `chrome.cast.isAvailable`.
            return chrome && chrome.cast && chrome.cast.isAvailable ;
        } ,

        /**
         * Callback for when a new Cast session is established or joined.
         *
         * @private
         * @param {Object} event - The session event object.
         */
        _sessionListener : function ( event ) {
            var options  =  this.options( ) ; // Get options for namespace.

            this._trigger( 'session' , event ) ; // Trigger a 'session' event.
            this._session = event ; // Store the session.
            // Add listeners to the new session.
            this._session.addUpdateListener( utils.bind( this._sessionUpdateListener , this ) ) ;
            this._session.addMessageListener( options.namespace , utils.bind( this._receiverMessage , this ) ) ;
        } ,

        /**
         * Callback for successful Cast API initialization.
         *
         * @private
         */
        _initSuccess : function ( ) {
            this._trigger( 'initialized' ) ; // Trigger an 'initialized' event.
        } ,

        /**
         * Generic error handler for Cast API operations.
         *
         * @private
         * @param {Object} message - The error message or object.
         */
        _error : function ( message ) {
            this._trigger( 'error' , message ) ; // Trigger an 'error' event.
        } ,

        /**
         * Generic success handler for Cast API operations.
         *
         * @private
         * @param {Object} message - The success message or object.
         */
        _success : function ( message ) {
            this._trigger( 'success' , message ) ; // Trigger a 'success' event.
        } ,

        /**
         * Callback for successful stopping of the receiver application.
         *
         * @private
         */
        _stopAppSuccess : function ( ) {
            this._trigger( 'stopappsuccess' ) ; // Trigger a 'stopappsuccess' event.
        } ,

        /**
         * Listener for session updates (e.g., session ending).
         *
         * @private
         * @param {boolean} isAlive - Indicates if the session is still active.
         */
        _sessionUpdateListener : function ( isAlive ) {
            this._trigger( 'sessionupdatelistener' , isAlive ) ; // Trigger an event for session updates.

            // If the session is no longer alive, clear the stored session.
            if ( ! isAlive ) {
                this._session = null ;
            }
        } ,

        /**
         * Listener for messages received from the Chromecast receiver.
         *
         * @private
         * @param {string} namespace - The message namespace.
         * @param {string} message - The message payload.
         */
        _receiverMessage : function ( namespace , message ) {
            this._trigger( 'message' , { namespace : namespace , message : message } ) ; // Trigger a 'message' event.
        } ,

        /**
         * Listener for changes in receiver availability.
         *
         * @private
         * @param {Object} e - The receiver availability event.
         */
        _receiverListener : function ( e ) {
            this._trigger( 'listener' , e ) ; // Trigger a 'listener' event.
        } ,

        /**
         * Stops the currently running Chromecast application.
         *
         * @private
         */
        _stopApp : function ( ) {
            this._session.stop(
                utils.bind( this._stopAppSuccess , this ) , // Success callback.
                utils.bind( this._error , this )           // Error callback.
            ) ;
        }
    } ) ;

    // Extend the `Receiver` object with `Common` functionalities and its specific methods.
    utils.extend( Receiver , Common , {
        _castReceiverManager : null , // Manages the receiver application lifecycle.
        _messageBus : null , // Handles communication over a specific namespace.

        /**
         * Initializes the Receiver module.
         *
         * @param {Object} options - Configuration options for the receiver.
         * @returns {Object} `this` for method chaining.
         */
        initialize : function ( options ) {
            this.options( options ) ; // Set the provided options.
            this._initializeCast( ) ; // Initialize the Cast Receiver Manager immediately.
            return this ;
        } ,

        /**
         * Retrieves a list of connected senders.
         *
         * @returns {Object} `this` for method chaining.
         */
        getSenders : function ( ) {
            this._castReceiverManager.getSenders( ) ; // Call the manager's method.
            return this ;
        } ,

        /**
         * Disconnects the receiver application, effectively closing the window.
         *
         * @returns {Object} `this` for method chaining.
         */
        disconnect : function ( ) {
            window.close( ) ; // Close the receiver window.
            return this ;
        } ,

        /**
         * Sets the current application state, which can be displayed on the sender.
         *
         * @param {string} state - The application state string.
         * @returns {Object} `this` for method chaining.
         */
        setApplicationState : function ( state ) {
            this._castReceiverManager.setApplicationState( state ) ; // Update application state.
            return this ;
        } ,

        /**
         * Internal method to initialize the Google Cast Receiver Manager.
         * This sets up event listeners for the receiver lifecycle.
         *
         * @private
         */
        _initializeCast : function ( ) {
            var options  =  this.options( ) ; // Get options, especially the namespace.
            var castReceiverManager , messageBus ; // Variables for manager and message bus.

            // Set the logging level for Cast receiver debugging.
            cast.receiver.logger.setLevelValue( 0 ) ; // 0 is for ALL messages.

            // Get the singleton instance of the CastReceiverManager.
            castReceiverManager = cast.receiver.CastReceiverManager.getInstance( ) ;

            // Bind event listeners for various receiver lifecycle events.
            castReceiverManager.onReady              =  utils.bind( this._ready , this ) ;
            castReceiverManager.onSenderConnected    =  utils.bind( this._senderConnected , this ) ;
            castReceiverManager.onSenderDisconnected =  utils.bind( this._senderDisconnected , this ) ;
            castReceiverManager.onSystemVolumeChanged = utils.bind( this._systemVolumeChanged , this ) ;

            // Get the message bus for the specified namespace.
            messageBus = castReceiverManager.getCastMessageBus( options.namespace ) ;
            messageBus.onMessage = utils.bind( this._message , this ) ; // Bind message listener.

            // Store references to the manager and message bus.
            this._messageBus = messageBus ;
            this._castReceiverManager = castReceiverManager ;

            // Start the receiver manager with an initial status text.
            castReceiverManager.start( { statusText : 'starting' } ) ;
        } ,

        /**
         * Callback for when the receiver manager is ready.
         *
         * @private
         * @param {Object} event - The ready event object.
         */
        _ready : function ( event ) {
            this._trigger( 'ready' , event ) ; // Trigger a 'ready' event.
            this._castReceiverManager.setApplicationState( 'ready' ) ; // Update state to 'ready'.
        } ,

        /**
         * Callback for when a sender connects to the receiver.
         *
         * @private
         * @param {Object} event - The sender connected event object.
         */
        _senderConnected : function ( event ) {
            this._trigger( 'senderconnected' , event ) ; // Trigger a 'senderconnected' event.
        } ,

        /**
         * Callback for when a sender disconnects from the receiver.
         *
         * @private
         * @param {Object} event - The sender disconnected event object.
         */
        _senderDisconnected : function ( event ) {
            this._trigger( 'senderdisconnected' , event ) ; // Trigger a 'senderdisconnected' event.
        } ,

        /**
         * Callback for when the system volume changes.
         *
         * @private
         * @param {Object} event - The system volume changed event object.
         */
        _systemVolumeChanged : function ( event ) {
            this._trigger( 'systemvolumechanged' , event ) ; // Trigger a 'systemvolumechanged' event.
        } ,

        /**
         * Callback for messages received on the message bus.
         *
         * @private
         * @param {Object} event - The message event object.
         */
        _message : function ( event ) {
            this._trigger( 'message' , event ) ; // Trigger a 'message' event.
            // Echo the message back to the sender who sent it.
            this._messageBus.send( event.senderId , event.data ) ;
        }
    } ) ;

    // Public API for creating Sender and Receiver instances.
    return {
        /**
         * Creates and initializes a new Chromecast Sender instance.
         *
         * @param {Object} options - Configuration options for the sender.
         * @returns {Object} A new Sender instance.
         */
        createSender : function ( options ) {
            // Dynamically require the Cast Sender API script.
            require( '../bower_components/cast_sender/index' ) ;
            return utils.create( Sender ).initialize( options ) ;
        } ,

        /**
         * Creates and initializes a new Chromecast Receiver instance.
         *
         * @param {Object} options - Configuration options for the receiver.
         * @returns {Object} A new Receiver instance.
         */
        createReceiver : function ( options ) {
            // Dynamically require the Cast Receiver API script.
            require( '../bower_components/cast_receiver/index' ) ;
            return utils.create( Receiver ).initialize( options ) ;
        }
    } ;

} ) ) ; // IIFE closure