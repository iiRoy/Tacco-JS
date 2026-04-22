'use strict' ; // Enforce strict mode for better error handling and cleaner code.

/* This is a standard UMD (Universal Module Definition) wrapper.
 * It allows the code to run in various environments like CommonJS, AMD, or as a global.
 * The 'e' function serves as the module loader.
 */
( function e ( t , n , r ) {

    function s ( o , u ) {
        // If the module 'o' is not yet loaded into 'n' (the cache)
        if ( ! n[ o ] ) {
            // If the module 'o' is not defined in 't' (the module definitions)
            if ( ! t[ o ] ) {
                // Try to use a global 'require' if available
                var a = typeof require == "function" && require;

                // If not a user-initiated require and global 'require' exists, use it
                if ( ! u && a ) return a ( o , true );

                // If 'i' (the internal require) exists, use it
                if ( i ) return i ( o , true );

                // If all else fails, throw an error indicating the module was not found.
                var f = new Error ( "Cannot find module '" + o + "'" );
                throw f . code = "MODULE_NOT_FOUND", f
            }

            // Create a new module object and cache it
            var l = n[ o ] = { exports : {} };

            // Call the module's definition function, providing necessary arguments for its execution context.
            t[ o ][ 0 ] . call (
                l . exports ,
                function ( e ) {
                    var n = t[ o ][ 1 ][ e ];
                    return s ( n ? n : e ) // Recursively resolve dependencies.
                },
                l ,
                l . exports ,
                e ,
                t ,
                n ,
                r
            ) ;
        }

        // Return the cached module's exports.
        return n[ o ] . exports
    }

    // Initialize an internal 'require' if a global one exists.
    var i = typeof require == "function" && require;

    // Load all initial modules specified in 'r'.
    for ( var o = 0 ; o < r . length ; o++ ) s ( r[ o ] ) ;

    // Return the internal 'require' function.
    return s

} ) ( { /* Module definitions start here */ 1 : [ function ( require , module , exports ) {
'use strict' ; // Enforce strict mode for better error handling and cleaner code.

// Declare variables for the Authorizer class, Requester utility, and debug logger.
var Authorizer ,
    Requester ,
    debug ;

// Initialize the debug logger for the 'engine:authorizer' namespace.
debug = require ( 'debug' ) ( 'engine:authorizer' ) ;

// Load the Requester utility module from the local path.
Requester = require ( './utils/requester' ) ;

/*
 * Authorizer class definition.
 * This class handles the authentication logic for the engine.
 */
Authorizer = ( function () {

    // Constructor for the Authorizer class.
    function Authorizer ( _at_engine ) {
        // Assign the engine instance to a property of this object.
        this . engine = _at_engine ;
    }

    /**
     * Authorizes a request using either a configured endpoint or the engine's options.
     * @param {Object} options - Authorization specific options.
     * @param {Object} data - Data to be sent with the authorization request.
     * @param {Function} callback - Callback function to handle the authorization result.
     * @returns {void}
     */
    Authorizer . prototype . authorize = function ( options , data , callback ) {

        var authData ,
            authEndpoint ,
            authTransport ,
            requestMethod ;

        // Determine the authentication endpoint, prioritizing options over engine defaults.
        authEndpoint = options . authEndpoint || this . engine . options . authEndpoint ;

        // If no authentication endpoint is configured, throw an error using a utility.
        if ( ! authEndpoint ) {
            Utils . throwError ( 'authEndpoint is not configured.' ) ;
        }

        // Determine the authentication transport method, prioritizing options over engine defaults.
        authTransport = options . authTransport || this . engine . options . authTransport ;

        // Retrieve authentication data, prioritizing options over engine defaults.
        authData = options . authData || this . engine . options . authData ;

        // If authData is an object, convert it to a JSON string for transport.
        if ( typeof authData === 'object' ) {
            authData = JSON . stringify ( authData ) ;
        }

        // Attach the current socket ID to the data payload for the authorization request.
        data . socketId = this . engine . connection . socketId ;

        // If authData exists, add it to the data payload.
        if ( authData ) {
            data . authData = authData ;
        }

        // Choose the request method (JSONP or POST) based on transport type and browser environment.
        if ( window && authTransport === 'jsonp' ) {
            requestMethod = Requester . jsonp ;
        } else {
            requestMethod = Requester . post ;
        }

        // Log the outgoing authorization request for debugging purposes.
        debug ( 'send auth request' , {
            authEndpoint : authEndpoint ,
            data : data
        } ) ;

        // Execute the authorization request using the chosen method and handle the response.
        return requestMethod ( authEndpoint , data , function ( err , authResult ) {
            // Log the received authorization response for debugging.
            debug ( 'got auth response' , {
                err : err ,
                authResult : authResult
            } ) ;

            // If an error occurred during authorization, invoke the callback with an error message and the error object.
            if ( err ) {
                return callback ( {
                    message : 'Wrong auth response' ,
                    error : err
                } ) ;
            } else {
                // Otherwise, invoke the callback with a successful result (null error and authResult).
                return callback ( null , authResult ) ;
            }
        } ) ;
    } ;

    // Return the Authorizer constructor.
    return Authorizer ;

} ) ( ) ; // Immediately invoke the function to define the Authorizer class.

// Export the Authorizer class for use by other modules.
module . exports = Authorizer ;


// Module dependency mapping for the UMD loader.
} , { "./utils/requester" : 15 , "debug" : 19 } ] , 2 : [ function ( require , module , exports ) {
'use strict' ; // Ensure strict parsing and execution of JavaScript.

// Declare variables for the Channel class, EventEmitter, and debug utility.
var Channel ,
    EventEmitter ,
    debug ,
    // Helper function for ES5-style class inheritance. It copies properties and sets up prototype chain.
    __extends = function ( child , parent ) {
        for ( var key in parent ) {
            if ( __hasProp . call ( parent , key ) ) child[ key ] = parent[ key ] ;
        }
        function ctor ( ) {
            this . constructor = child ;
        }
        ctor . prototype = parent . prototype ;
        child . prototype = new ctor ( ) ;
        child . __super__ = parent . prototype ;
        return child ;
    } ,
    // Helper for checking own properties during inheritance, avoiding prototype chain issues.
    __hasProp = { } . hasOwnProperty ;

// Initialize debugging for the 'engine:channel' component.
debug = require ( 'debug' ) ( 'engine:channel' ) ;

// Import the EventEmitter utility from a parent directory.
EventEmitter = require ( '../utils/eventEmitter' ) ;

/**
 * The base Channel class, inheriting from EventEmitter.
 * It provides fundamental channel operations like subscribe, unsubscribe, and event handling.
 */
Channel = ( function ( _super ) {
    // Apply inheritance from EventEmitter.
    __extends ( Channel , _super ) ;

    /**
     * Channel constructor.
     * @param {string} _at_name - The name of the channel.
     * @param {Object} _at_engine - The engine instance this channel belongs to.
     */
    function Channel ( _at_name , _at_engine ) {
        // Declare a variable to track subscription status locally within the constructor.
        var subscribed ;
        // Assign channel name and engine instance to instance properties.
        this . name = _at_name ;
        this . engine = _at_engine ;
        // Initialize subscribed status (note: this local variable is not used to set an instance property).
        subscribed = false ;
    }

    /**
     * Placeholder method for authorization.
     * Default implementation simply calls back with null (no error), indicating no authorization is needed by default.
     * @param {Function} callback - The callback function to invoke upon authorization completion.
     * @returns {void}
     */
    Channel . prototype . _authorize = function ( callback ) {
        return callback ( null ) ;
    } ;

    /**
     * Initiates the subscription process for this channel.
     * Logs the subscription attempt and calls the internal `_authorize` method before sending the subscription event.
     * @returns {void}
     */
    Channel . prototype . subscribe = function ( ) {
        debug ( 'subscribe' , this . name ) ; // Log subscription attempt with channel name.
        // Authorize before sending the subscription event to the engine.
        return this . _authorize ( ( function ( _this ) {
            return function ( err , data ) {
                // If authorization fails, emit a subscription error event.
                if ( err ) {
                    return _this . handleEvent ( 'engine_channel:subscription_error' , err ) ;
                }
                // Send the subscription event to the engine's connection with channel details and auth data.
                return _this . engine . connection . sendEvent (
                    'engine_channel:subscribe' ,
                    {
                        channel : _this . name ,
                        signature : data != null ? data . signature : void 0 ,
                        channelData : data != null ? data . channelData : void 0
                    }
                ) ;
            } ;
        } ) ( this ) ) ;
    } ;

    /**
     * Initiates the unsubscription process for this channel.
     * Logs the unsubscription attempt and sends the unsubscription event to the engine.
     * @returns {void}
     */
    Channel . prototype . unsubscribe = function ( ) {
        debug ( 'unsubscribe' , this . name ) ; // Log unsubscription attempt with channel name.
        // Send the unsubscription event to the engine's connection.
        return this . engine . connection . sendEvent (
            'engine_channel:unsubscribe' ,
            {
                channel : this . name
            }
        ) ;
    } ;

    /**
     * Handles incoming events for this channel.
     * Dispatches events based on their name, updating subscription status and emitting corresponding events.
     * @param {Object} event - The event object to handle, containing `name` and `data` properties.
     * @returns {void}
     */
    Channel . prototype . handleEvent = function ( event ) {
        switch ( event . name ) {
            case 'engine_channel:subscription_succeeded' :
                this . subscribed = true ; // Mark the channel as successfully subscribed.
                return this . emit ( 'engine:subscription_succeeded' , event . data ) ; // Emit a generic subscription success event.
            case 'engine_channel:subscription_error' :
                this . subscribed = false ; // Mark the channel as not subscribed due to an error.
                return this . emit ( 'engine:subscription_error' , event . data ) ; // Emit a generic subscription error event.
            default :
                // For any other event, re-emit it directly with its original name and data.
                return this . emit ( event . name , event . data ) ;
        }
    } ;

    /**
     * Disconnects the channel, setting its subscribed status to false.
     * This is a cleanup operation, not necessarily sending an unsubscribe message.
     * @returns {boolean} The new subscribed status (false).
     */
    Channel . prototype . disconnect = function ( ) {
        return this . subscribed = false ;
    } ;

    return Channel ; // Return the Channel constructor.

} ) ( EventEmitter ) ; // Inherit from EventEmitter.

// Export the Channel class.
module . exports = Channel ;


} , { "../utils/eventEmitter" : 13 , "debug" : 19 } ] , 3 : [ function ( require , module , exports ) {
'use strict' ; // Activate strict mode for the current script.

// Declare variables for different channel types and the Channels manager.
var Channel ,
    Channels ,
    PresenceChannel ,
    PrivateChannel ,
    // Helper for checking own properties, typically used in loops to avoid iterating prototype chain.
    __hasProp = { } . hasOwnProperty ;

// Import the base Channel class.
Channel = require ( './channel' ) ;

// Import the PrivateChannel class.
PrivateChannel = require ( './privateChannel' ) ;

// Import the PresenceChannel class.
PresenceChannel = require ( './presenceChannel' ) ;


/**
 * The Channels class manages a collection of channel instances.
 * It provides methods for creating, adding, removing, finding, and batch-operating on channels.
 */
Channels = ( function ( ) {

    /**
     * Channels constructor.
     * @param {Object} _at_engine - The engine instance this manager belongs to.
     */
    function Channels ( _at_engine ) {
        this . engine = _at_engine ; // Store the engine reference.
        this . _store = { } ; // Initialize an empty object to store channels by name.
    }

    /**
     * Creates a new channel instance based on the provided name.
     * It determines the channel type (Private, Presence, or standard) from the name prefix.
     * @param {string} name - The name of the channel to create.
     * @returns {Channel|PrivateChannel|PresenceChannel} A new channel instance of the appropriate type.
     * @private
     */
    Channels . prototype . _createChannel = function ( name ) {
        // Check for 'private-' prefix to instantiate a PrivateChannel.
        if ( name . indexOf ( 'private-' ) !== -1 ) {
            return new PrivateChannel ( name , this . engine ) ;
        }
        // Check for 'presence-' prefix to instantiate a PresenceChannel.
        else if ( name . indexOf ( 'presence-' ) !== -1 ) {
            return new PresenceChannel ( name , this . engine ) ;
        }
        // Otherwise, default to creating a standard Channel.
        else {
            return new Channel ( name , this . engine ) ;
        }
    } ;

    /**
     * Checks if the engine's connection is currently in a 'connected' state.
     * This is crucial for deciding whether to subscribe/unsubscribe immediately.
     * @returns {boolean} True if connected, false otherwise.
     * @private
     */
    Channels . prototype . _isConnected = function ( ) {
        return this . engine . connection . state === 'connected' ;
    } ;

    /**
     * Adds a channel to the store and subscribes to it if the engine is connected.
     * If the channel already exists, it returns the existing instance without re-creating.
     * @param {string} name - The name of the channel to add.
     * @returns {Channel} The added or existing channel instance.
     */
    Channels . prototype . add = function ( name ) {
        var channel ,
            _base ; // Temporary variable for base object reference during conditional assignment.

        // If the channel doesn't exist in the store, create and add it.
        if ( ( _base = this . _store ) [ name ] == null ) {
            _base [ name ] = this . _createChannel ( name ) ;
        }

        channel = this . _store [ name ] ; // Get the channel instance (either new or existing).

        // If the engine is connected, immediately subscribe to the channel.
        if ( this . _isConnected ( ) ) {
            channel . subscribe ( ) ;
        }

        return channel ; // Return the channel instance.
    } ;

    /**
     * Removes a channel (conceptually) from the store and unsubscribes from it if the engine is connected.
     * Note: The original code does not delete the channel from `_store`, only unsubscribes.
     * @param {string} name - The name of the channel to remove.
     * @returns {Channel|undefined} The channel instance if it existed, or undefined if not found.
     */
    Channels . prototype . remove = function ( name ) {
        var channel ;
        channel = this . _store [ name ] ; // Retrieve the channel by name.

        // If the channel exists and the engine is connected, unsubscribe it.
        if ( channel && this . _isConnected ( ) ) {
            channel . unsubscribe ( ) ;
        }

        // Following Type I definition, we do not alter the logic of not deleting from `_store`.
        return channel ;
    } ;

    /**
     * Finds and returns a channel by its name from the internal store.
     * @param {string} name - The name of the channel to find.
     * @returns {Channel|undefined} The channel instance if found, otherwise undefined.
     */
    Channels . prototype . find = function ( name ) {
        return this . _store [ name ] ;
    } ;

    /**
     * Subscribes to all channels currently in the store.
     * This operation is performed only if the engine is connected.
     * @returns {Array} An array of results from each channel's subscribe call.
     */
    Channels . prototype . subscribe = function ( ) {
        var channel ,
            name ,
            _ref ,
            _results ;

        // Only proceed with subscriptions if the engine's connection state is 'connected'.
        if ( this . engine . connection . state !== 'connected' ) {
            return ;
        }

        _ref = this . _store ; // Reference to the channel store for iteration.
        _results = [ ] ; // Initialize an array to collect subscription results.

        // Iterate over all channels stored by name.
        for ( name in _ref ) {
            // Ensure it's an own property of _ref, not inherited from the prototype chain.
            if ( ! __hasProp . call ( _ref , name ) ) continue ;
            channel = _ref [ name ] ;
            _results . push ( channel . subscribe ( ) ) ; // Call subscribe on each channel and store the result.
        }
        return _results ; // Return the array of subscription results.
    } ;

    /**
     * Disconnects all channels currently in the store.
     * This typically cleans up channel-specific states without necessarily sending unsubscribe messages.
     * @returns {Array} An array of results from each channel's disconnect call.
     */
    Channels . prototype . disconnect = function ( ) {
        var channel ,
            name ,
            _ref ,
            _results ;

        _ref = this . _store ; // Reference to the channel store for iteration.
        _results = [ ] ; // Initialize an array to collect disconnection results.

        // Iterate over all channels stored by name.
        for ( name in _ref ) {
            // Ensure it's an own property.
            if ( ! __hasProp . call ( _ref , name ) ) continue ;
            channel = _ref [ name ] ;
            _results . push ( channel . disconnect ( ) ) ; // Call disconnect on each channel and store the result.
        }
        return _results ; // Return the array of disconnection results.
    } ;

    return Channels ; // Return the Channels constructor.

} ) ( ) ; // Immediately invoke the function.

// Export the Channels class for module consumption.
module . exports = Channels ;


} , { "./channel" : 2 , "./presenceChannel" : 4 , "./privateChannel" : 5 } ] , 4 : [ function ( require , module , exports ) {
'use strict' ; // Enforce strict mode for better code quality.

// Declare variables for the PresenceChannel class, PrivateChannel, and Users utility.
var PresenceChannel ,
    PrivateChannel ,
    Users ,
    // Inheritance helper function for extending classes in ES5.
    __extends = function ( child , parent ) {
        for ( var key in parent ) {
            if ( __hasProp . call ( parent , key ) ) child[ key ] = parent[ key ] ;
        }
        function ctor ( ) {
            this . constructor = child ;
        }
        ctor . prototype = parent . prototype ;
        child . prototype = new ctor ( ) ;
        child . __super__ = parent . prototype ;
        return child ;
    } ,
    // Property check helper to ensure properties are directly on the object, not its prototype chain.
    __hasProp = { } . hasOwnProperty ;

// Import the PrivateChannel class as the base for PresenceChannel.
PrivateChannel = require ( './privateChannel' ) ;

// Import the Users utility for managing channel members.
Users = require ( './users' ) ;

/**
 * PresenceChannel extends PrivateChannel to manage user presence information.
 * It tracks users joining and leaving the channel and provides a user collection.
 */
PresenceChannel = ( function ( _super ) {
    // Establish inheritance from PrivateChannel using the __extends helper.
    __extends ( PresenceChannel , _super ) ;

    /**
     * Constructor for PresenceChannel.
     * @param {string} _at_name - The name of the presence channel.
     * @param {Object} _at_engine - The engine instance.
     */
    function PresenceChannel ( _at_name , _at_engine ) {
        this . name = _at_name ;
        this . engine = _at_engine ;
        // Call the parent (PrivateChannel) constructor with the same arguments.
        PresenceChannel . __super__ . constructor . call ( this , this . name , this . engine ) ;
        // Initialize a new Users collection specific to this presence channel.
        this . users = new Users ( ) ;
    }

    /**
     * Overrides the base `_authorize` method to handle presence-specific authorization data.
     * It attempts to parse the `userId` from `channelData` within the authorization result.
     * @param {Function} callback - The callback function for authorization result.
     * @returns {void}
     */
    PresenceChannel . prototype . _authorize = function ( callback ) {
        // Call the parent's authorize method and then process its result.
        return PresenceChannel . __super__ . _authorize . call ( this , ( function ( _this ) {
            return function ( err , authResult ) {
                try {
                    // If authorization is successful (no error) and channelData is provided,
                    // attempt to parse the userId and set it as the current user's ID.
                    if ( ! err ) {
                        _this . users . setMyId ( JSON . parse ( authResult . channelData ) . userId ) ;
                    }
                } catch ( _error ) {
                    // Catch any errors during JSON parsing, e.g., if channelData is not valid JSON or lacks userId.
                    // This block intentionally does nothing, allowing the authorization to proceed with or without user ID.
                }
                // Pass the authorization result (error or success) to the original callback.
                return callback ( err , authResult ) ;
            } ;
        } ) ( this ) ) ;
    } ;

    /**
     * Overrides the base `handleEvent` method to process presence-specific events.
     * Handles subscription success/error, user added/removed events, and delegates others to the parent.
     * @param {Object} event - The event object to handle.
     * @returns {void}
     */
    PresenceChannel . prototype . handleEvent = function ( event ) {
        var addedUser ,
            removedUser ;

        switch ( event . name ) {
            case 'engine_channel:subscription_succeeded' :
                this . subscribed = true ; // Mark the channel as successfully subscribed.
                this . users . setUsers ( event . data ) ; // Populate the users collection with initial members.
                return this . emit ( 'engine:subscription_succeeded' , this . users ) ; // Emit success with the users collection.
            case 'engine_channel:subscription_error' :
                this . subscribed = false ; // Mark as not subscribed due to an error.
                return this . emit ( 'engine:subscription_error' , event . data ) ; // Emit the error.
            case 'engine_channel:user_added' :
                addedUser = this . users . addUser ( event . data ) ; // Add the new user to the collection.
                return this . emit ( 'engine:user_added' , addedUser ) ; // Emit a specific event for a user being added.
            case 'engine_channel:user_removed' :
                removedUser = this . users . removeUser ( event . data ) ; // Remove the user from the collection.
                if ( removedUser ) {
                    return this . emit ( 'engine:user_removed' , removedUser ) ; // Emit a specific event for a user being removed, if they existed.
                }
                break ; // If `removedUser` is falsy, exit the switch.
            default :
                // For any other event not handled specifically by PresenceChannel, delegate to the parent's `handleEvent`.
                return PresenceChannel . __super__ . handleEvent . call ( this , event ) ;
        }
    } ;

    /**
     * Overrides the base `disconnect` method to reset the users collection before disconnecting the channel.
     * @returns {void}
     */
    PresenceChannel . prototype . disconnect = function ( ) {
        this . users . reset ( ) ; // Clear all users from the collection when disconnecting.
        return PresenceChannel . __super__ . disconnect . call ( this ) ; // Call the parent's disconnect method to complete the process.
    } ;

    return PresenceChannel ; // Return the PresenceChannel constructor.

} ) ( PrivateChannel ) ; // Inherit from PrivateChannel.

// Export the PresenceChannel class.
module . exports = PresenceChannel ;


} , { "./privateChannel" : 5 , "./users" : 6 } ] , 5 : [ function ( require , module , exports ) {
'use strict' ; // Enforce strict JavaScript syntax and runtime behavior.

// Declare variables for Channel, PrivateChannel, Requester, and Utils.
var Channel ,
    PrivateChannel ,
    Requester ,
    Utils ,
    // Helper function to manage prototypal inheritance in a consistent way.
    __extends = function ( child , parent ) {
        for ( var key in parent ) {
            if ( __hasProp . call ( parent , key ) ) child[ key ] = parent[ key ] ;
        }
        function ctor ( ) {
            this . constructor = child ;
        }
        ctor . prototype = parent . prototype ;
        child . prototype = new ctor ( ) ;
        child . __super__ = parent . prototype ;
        return child ;
    } ,
    // Utility for checking if an object has a specified property as its own property, not inherited.
    __hasProp = { } . hasOwnProperty ;

// Import the base Channel class, as PrivateChannel extends it.
Channel = require ( './channel' ) ;

// Import the Requester utility, likely for making HTTP requests for authorization.
Requester = require ( '../utils/requester' ) ;

// Import general utility functions (though 'Utils' is not directly used in this snippet's logic).
Utils = require ( '../utils' ) ;

/**
 * PrivateChannel extends the base Channel class to add authorization capabilities.
 * Private channels typically require server-side authentication before subscription is granted.
 */
PrivateChannel = ( function ( _super ) {
    // Establish inheritance from the base Channel class using the helper.
    __extends ( PrivateChannel , _super ) ;

    /**
     * Constructor for PrivateChannel.
     * It simply calls the parent constructor (`Channel`) with the same arguments passed to it.
     * @returns {PrivateChannel} An instance of PrivateChannel.
     */
    function PrivateChannel ( ) {
        return PrivateChannel . __super__ . constructor . apply ( this , arguments ) ;
    }

    /**
     * Authorizes access to this private channel.
     * It delegates the actual authorization request to the engine's `authorizer` component.
     * @param {Function} callback - The callback function to be invoked with the authorization result.
     * @returns {void}
     */
    PrivateChannel . prototype . _authorize = function ( callback ) {
        // Call the engine's authorizer to perform the authorization.
        // It passes an empty options object and the channel name within the data payload.
        return this . engine . authorizer . authorize ( { } , {
            channelName : this . name
        } , callback ) ;
    } ;

    return PrivateChannel ; // Return the PrivateChannel constructor.

} ) ( Channel ) ; // Inherit from Channel.

// Export the PrivateChannel class for use in other modules.
module . exports = PrivateChannel ;


} , { "../utils" : 14 , "../utils/requester" : 15 , "./channel" : 2 } ] , 6 : [ function ( require , module , exports ) {
'use strict' ; // Apply strict mode to the current script.

// Declare the Users class variable.
var Users ;

/**
 * The Users class manages a collection of user objects, typically for a presence channel.
 * It provides methods to add, remove, retrieve, and iterate over users, maintaining a count and a reference to the current user.
 */
Users = ( function ( ) {

    /**
     * Users constructor.
     * Initializes the user collection by calling the reset method to set up initial state.
     */
    function Users ( ) {
        this . reset ( ) ; // Set initial state for user management upon instantiation.
    }

    /**
     * Resets the entire user collection to an empty state.
     * Clears all stored users, resets the count, and nullifies `_myId` and `me` references.
     * @returns {null} Always returns null, which is the value assigned to `this.me`.
     */
    Users . prototype . reset = function ( ) {
        this . _users = { } ; // Initialize an empty object to store users, keyed by their ID.
        this . count = 0 ; // Initialize the total user count to zero.
        this . _myId = null ; // Clear the stored ID of the current (client's) user.
        return this . me = null ; // Clear the reference to the current user's object.
    } ;

    /**
     * Formats a raw user object received from the server into a standardized structure.
     * Extracts `id` (from `userId`) and `info` (from `userInfo`) if available.
     * @param {Object} user - The raw user object, potentially containing `userId` and `userInfo`.
     * @returns {Object} A formatted user object with `id` and `info` properties.
     * @private
     */
    Users . prototype . _formatUser = function ( user ) {
        return {
            id : user != null ? user . userId : void 0 , // Use `userId` if `user` is not null/undefined, else `undefined`.
            info : user != null ? user . userInfo : void 0 // Use `userInfo` if `user` is not null/undefined, else `undefined`.
        } ;
    } ;

    /**
     * Sets the ID of the current user (the client's own user ID).
     * This ID is used to identify the client's user within the collection.
     * @param {string|number} myId - The ID of the current user.
     * @returns {string|number} The `myId` that was set.
     */
    Users . prototype . setMyId = function ( myId ) {
        return this . _myId = myId ;
    } ;

    /**
     * Populates the user collection with an array of user objects.
     * It first resets any existing users and then adds each user from the provided array.
     * Finally, it attempts to set the `me` property to the current user's object if `_myId` is known.
     * @param {Array<Object>} users - An array of raw user objects to be added to the collection.
     * @returns {Object|undefined} The current user object (`me`) if `_myId` is set and found, otherwise `undefined`.
     */
    Users . prototype . setUsers = function ( users ) {
        var user ,
            _i ,
            _len ;

        this . _users = { } ; // Reset the internal users map.
        this . count = 0 ; // Reset the user count.

        // Iterate through the provided users array to populate the collection.
        for ( _i = 0 , _len = users . length ; _i < _len ; _i++ ) {
            user = users[ _i ] ;
            this . _users[ user . userId ] = this . _formatUser ( user ) ; // Store the formatted user by their ID.
            this . count++ ; // Increment the total user count.
        }
        // After populating, try to set the 'me' property using the known `_myId`.
        return this . me = this . get ( this . _myId ) ;
    } ;

    /**
     * Adds a single user to the collection.
     * If a user with the same ID already exists, their information is updated.
     * If it's a new user, the user count is incremented.
     * @param {Object} user - The raw user object to add or update.
     * @returns {Object} The formatted user object that was added or updated.
     */
    Users . prototype . addUser = function ( user ) {
        // If the user's ID is not yet in the collection, it's a new user.
        if ( ! this . _users[ user . userId ] ) {
            this . count++ ; // Increment the user count.
        }
        this . _users[ user . userId ] = this . _formatUser ( user ) ; // Store (or update) the formatted user.
        return this . get ( user . userId ) ; // Return the newly added/updated user object.
    } ;

    /**
     * Removes a user from the collection based on their ID.
     * If the user is found and removed, the user count is decremented.
     * @param {Object} user - An object containing the `userId` of the user to remove.
     * @returns {Object|undefined} The removed user object if it existed, otherwise `undefined`.
     */
    Users . prototype . removeUser = function ( user ) {
        user = this . _users[ user . userId ] ; // Retrieve the user object from the map using their ID.
        if ( user ) {
            delete this . _users[ user . userId ] ; // Remove the user from the internal map.
            this . count-- ; // Decrement the total user count.
        }
        return user ; // Return the user object that was removed.
    } ;

    /**
     * Iterates over each user currently in the collection and applies a callback function.
     * @param {Function} fn - The callback function to apply to each user. It receives the user object as an argument.
     * @returns {Array} An array containing the results of each callback invocation.
     */
    Users . prototype . each = function ( fn ) {
        var user ,
            userId ,
            _ref ,
            _results ;

        _ref = this . _users ; // Get a reference to the internal users map for iteration.
        _results = [ ] ; // Initialize an array to store the results of the callback function.

        // Loop through each user ID (key) in the _users map.
        for ( userId in _ref ) {
            user = _ref[ userId ] ; // Get the user object corresponding to the current ID.
            _results . push ( fn ( user ) ) ; // Call the provided function with the user and store its return value.
        }
        return _results ; // Return all collected results.
    } ;

    /**
     * Retrieves a user object from the collection by their ID.
     * @param {string|number} userId - The ID of the user to retrieve.
     * @returns {Object|undefined} The user object if found, otherwise `undefined`.
     */
    Users . prototype . get = function ( userId ) {
        return this . _users[ userId ] ;
    } ;

    return Users ; // Return the Users constructor.

} ) ( ) ; // Immediately invoke the function to define the class.

// Export the Users class.
module . exports = Users ;


} , { } ] , 7 : [ function ( require , module , exports ) {
'use strict' ; // Enforce strict parsing and execution.

// Declare all necessary variables for ChatManager and its dependencies.
var ChatManager ,
    Protocol ,
    api , // This variable is declared but not used in the provided snippet.
    debug ,
    event , // This variable is declared but not used in the provided snippet.
    trivialRequestResponseAPIEventMapping , // This variable is declared but not used in the provided snippet.
    _fn ; // This variable is declared but not used in the provided snippet.

// Initialize the debug logger for the 'engine:chatManager' component.
debug = require ( 'debug' ) ( 'engine:chatManager' ) ;

// Import the Protocol definitions, likely containing error codes and event names.
Protocol = require ( './protocol' ) ;

/**
 * The ChatManager class handles chat-related functionalities,
 * including user login, sending chat requests, and managing the overall chat state.
 */
ChatManager = ( function ( ) {

    /**
     * ChatManager constructor.
     * Initializes the manager with an engine instance and sets default properties for login and state.
     * @param {Object} _at_engine - The engine instance this manager belongs to.
     */
    function ChatManager ( _at_engine ) {
        this . engine = _at_engine ; // Store the engine reference for interaction.
        this . _loginOptions = null ; // Stores options used during the most recent login attempt.
        this . user = null ; // Holds the data of the currently logged-in user.
        this . state = 'initialized' ; // Current operational state of the chat manager.
    }

    /**
     * Separates an options object into two distinct parts: pure configuration options and callback handlers.
     * This is a common pattern for methods that accept both configuration and event-like handlers.
     * @param {Object} originalOptions - The combined options and handlers object.
     * @returns {Array<Object, Object>} A tuple containing two objects: `[options, handlers]`.
     * @private
     */
    ChatManager . prototype . _separateOptionsAndHandlers = function ( originalOptions ) {
        var handlers ,
            k ,
            options ,
            v ;

        options = { } ; // Object to collect non-function options.
        handlers = { } ; // Object to collect function handlers.

        // Iterate over all enumerable properties of the `originalOptions` object.
        for ( k in originalOptions ) {
            v = originalOptions[ k ] ; // Get the value associated with the current key.

            // If the value is a function, treat it as a handler.
            if ( typeof v === 'function' ) {
                handlers[ k ] = v ;
            }
            // Otherwise, treat it as a configuration option.
            else {
                options[ k ] = v ;
            }
        }
        return [ options , handlers ] ; // Return the separated objects as an array.
    } ;

    /**
     * Sends a chat-related request event to the engine's connection.
     * It first checks the authentication state and then invokes appropriate callbacks based on the response.
     * @param {string} eventName - The name of the event to send (e.g., 'sendMessage').
     * @param {Object} options - Options and handlers for the request, which will be separated internally.
     * @param {boolean} needSendAck - Flag indicating whether an acknowledgment from the server is expected for this event.
     * @returns {void}
     * @private
     */
    ChatManager . prototype . _request = function ( eventName , options , needSendAck ) {
        var callback ,
            handlers ,
            _ref ;

        // Separate options from handlers using the internal helper method.
        _ref = this . _separateOptionsAndHandlers ( options ) , options = _ref[ 0 ] , handlers = _ref[ 1 ] ;

        // If the chat manager is not in the 'loggedIn' state, prevent the request and call the `onError` handler.
        if ( this . state !== 'loggedIn' ) {
            return typeof handlers . onError === "function" ? handlers . onError ( Protocol . responseErrors . unauthorized ) : void 0 ;
        }

        // Define the internal callback function that will be passed to `sendEvent`.
        callback = function ( err , result ) {
            // If an error occurred (err is truthy), invoke the `onError` handler if it exists.
            if ( err ) {
                return typeof handlers . onError === "function" ? handlers . onError ( err ) : void 0 ;
            }
            // Otherwise (no error), invoke the `onSuccess` handler if it exists.
            else {
                return typeof handlers . onSuccess === "function" ? handlers . onSuccess ( result ) : void 0 ;
            }
        } ;

        // If an acknowledgment is required for this event, set the `needSendAck` property on the callback.
        if ( needSendAck ) {
            callback . needSendAck = true ;
        }

        // Send the event via the engine's connection, along with options and the defined callback.
        return this . engine . connection . sendEvent ( eventName , options , callback ) ;
    } ;

    /**
     * Initiates the login process for the chat manager.
     * This involves authorizing the client and then sending a login event to the chat server.
     * @param {Object} [options={}] - Login options, which may include `authData` and callback functions like `onSuccess` and `onError`.
     * @returns {void}
     */
    ChatManager . prototype . login = function ( options ) {
        var handlers ,
            _ref ,
            _ref1 ;

        // Ensure `options` is an object, defaulting to an empty object if not provided.
        if ( options == null ) {
            options = { } ;
        }

        this . state = 'loggingIn' ; // Update the chat manager's state to 'loggingIn'.
        this . _loginOptions = options ; // Store the provided login options for potential re-use.

        // If the engine's connection is not in a 'connected' state, exit the login process early.
        if ( this . engine . connection . state !== 'connected' ) {
            return ;
        }

        // Separate the login options into actual options and callback handlers.
        _ref = this . _separateOptionsAndHandlers ( options ) , options = _ref[ 0 ] , handlers = _ref[ 1 ] ;

        // If `authData` is not explicitly provided in the options, attempt to retrieve it from the engine's global options.
        if ( ! options . authData ) {
            options . authData = ( _ref1 = this . engine . options ) != null ? _ref1 . authData : void 0 ;
        }

        // Delegate the authorization process to the engine's authorizer.
        return this . engine . authorizer . authorize ( options , {
            chatLogin : true // Indicate that this authorization is for chat login.
        } , ( function ( _this ) {
            return function ( err , authResult ) {
                // If authorization fails, update the state to 'failed' and invoke the `onError` handler.
                if ( err ) {
                    _this . state = 'failed' ;
                    return typeof handlers . onError === "function" ? handlers . onError ( err ) : void 0 ;
                }
                try {
                    // Attempt to parse the user data from the `authResult`.
                    _this . user = JSON . parse ( authResult . userData ) ;
                } catch ( _error ) {
                    // If JSON parsing fails (e.g., `userData` is not valid JSON), catch the error but do not halt execution.
                    // The `_error` variable is declared but not explicitly used here, implying the error is ignored.
                }

                // If authorization is successful, send the 'engine_chat:user:login' event to the server.
                return _this . engine . connection . sendEvent ( 'engine_chat:user:login' , authResult , function ( err , result ) {
                    var k ,
                        v ;

                    // If an error occurs during the login event transmission/response.
                    if ( err ) {
                        // Special handling for 'noConnection' error: simply return, as reconnection logic might handle this.
                        if ( err . code === Protocol . responseErrors . noConnection ) {
                            return ;
                        }
                        debug ( 'login error' , err ) ; // Log the login error details.
                        _this . state = 'failed' ; // Set the manager's state to 'failed'.
                        return typeof handlers . onError === "function" ? handlers . onError ( err ) : void 0 ;
                    }
                    // If the login event is successful, merge the `result` properties into the `_this.user` object.
                    for ( k in result ) {
                        v = result[ k ] ;
                        _this . user[ k ] = v ;
                    }