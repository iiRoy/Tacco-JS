/*
 * OpenAjax Hub v1.0 -- Slightly Modified Version
 * This section initializes the OpenAjax Hub if it doesn't already exist.
 * It provides basic publish/subscribe functionality for inter-widget communication.
 */
if ( ! window . OpenAjax ) {

    // Initialize OpenAjax as a new anonymous function object.
    OpenAjax = new function ( ) {

        // Internal boolean flags for various purposes, though 'b' and 'i' are not extensively used in this snippet.
        var b = true ;
        var i = false ;

        // Reference to the global window object.
        var d = window ;

        // Placeholder for an undefined variable, often used for internal temporary storage.
        var e ;

        // Base prefix for OpenAjax Hub topics to ensure uniqueness.
        var a = "org.openajax.hub." ;

        // The core hub object, which will contain all the OpenAjax functionalities.
        var c = { } ;

        // Assign the hub object to `this.hub`.
        this . hub = c ;

        // Set OpenAjax Hub implementation details.
        c . implementer = "http://openajax.org" ;
        c . implVersion = "1.0" ;
        c . specVersion = "1.0" ;
        c . implExtraData = { } ;

        // Initialize libraries object.
        var e = { } ;
        c . libraries = e ;

        /*
         * Registers a new library with the OpenAjax Hub.
         * @param {string} j - The prefix for the library.
         * @param {string} h - The namespace URI for the library.
         * @param {string} g - The version of the library.
         * @param {object} f - Additional data for the library.
         */
        c . registerLibrary = function ( j , h , g , f ) {
            e [ j ] = {
                prefix : j ,
                namespaceURI : h ,
                version : g ,
                extraData : f
            } ;
            this . publish ( a + "registerLibrary" , e [ j ] ) ;
        } ;

        /*
         * Unregisters a library from the OpenAjax Hub.
         * @param {string} f - The prefix of the library to unregister.
         */
        c . unregisterLibrary = function ( f ) {
            this . publish ( a + "unregisterLibrary" , e [ f ] ) ;
            delete e [ f ] ;
        } ;

        // Internal structure to manage subscriptions.
        c . _subscriptions = {
            c : { } ,
            s : [ ]
        } ;

        // Array to hold subscriptions marked for cleanup.
        c . _cleanup = [ ] ;

        // Counter for unique subscription IDs.
        c . _subIndex = 0 ;

        // Counter for the current publication depth, used for managing cleanup.
        c . _pubDepth = 0 ;

        /*
         * Subscribes a callback function to a specific topic.
         * @param {string} f - The topic to subscribe to.
         * @param {function} n - The callback function to execute.
         * @param {object} k - The scope (this context) for the callback.
         * @param {any} j - Arbitrary data to be passed to the callback.
         * @param {function} h - A filter callback function.
         * @returns {string} - The handle for this subscription.
         */
        c . subscribe = function ( f , n , k , j , h ) {

            if ( ! k ) {
                k = window
            }

            var l = f + "." + this . _subIndex ;
            var g = {
                scope : k ,
                cb : n ,
                fcb : h ,
                data : j ,
                sid : this . _subIndex ++ ,
                hdl : l
            } ;
            var m = f . split ( "." ) ;

            this . _subscribe ( this . _subscriptions , m , 0 , g ) ;

            return l ;
        } ;

        /*
         * Publishes a message to a specific topic.
         * All subscribed callbacks for this topic will be executed.
         * @param {string} f - The topic to publish to.
         * @param {any} h - The data payload to send with the message.
         */
        c . publish = function ( f , h ) {

            var j = f . split ( "." ) ;

            this . _pubDepth ++ ;

            this . _publish ( this . _subscriptions , j , 0 , f , h ) ;

            this . _pubDepth -- ;

            // If there are subscriptions to clean up and no active publications, perform cleanup.
            if ( ( this . _cleanup . length > 0 ) && ( this . _pubDepth == 0 ) ) {

                for ( var g = 0 ; g < this . _cleanup . length ; g ++ ) {
                    this . unsubscribe ( this . _cleanup [ g ] . hdl ) ;
                }

                delete ( this . _cleanup ) ;
                this . _cleanup = [ ] ;
            }
        } ;

        /*
         * Unsubscribes a previously registered subscription.
         * @param {string} g - The handle of the subscription to unsubscribe.
         */
        c . unsubscribe = function ( g ) {

            var h = g . split ( "." ) ;
            var f = h . pop ( ) ;

            this . _unsubscribe ( this . _subscriptions , h , 0 , f ) ;
        } ;

        /*
         * Internal recursive method to handle subscriptions.
         * @param {object} f - Current node in the subscription tree.
         * @param {Array<string>} k - Array of topic parts.
         * @param {number} g - Current index in the topic parts array.
         * @param {object} j - The subscription object.
         */
        c . _subscribe = function ( f , k , g , j ) {

            var h = k [ g ] ;

            if ( g == k . length ) {

                f . s . push ( j ) ;

            } else {

                if ( typeof f . c == "undefined" ) {
                    f . c = { } ;
                }

                if ( typeof f . c [ h ] == "undefined" ) {
                    f . c [ h ] = { c : { } , s : [ ] } ;
                    this . _subscribe ( f . c [ h ] , k , g + 1 , j ) ;
                } else {
                    this . _subscribe ( f . c [ h ] , k , g + 1 , j ) ;
                }
            }
        } ;

        /*
         * Internal recursive method to handle publishing messages.
         * Traverses the subscription tree and executes matching callbacks.
         * @param {object} s - Current node in the subscription tree.
         * @param {Array<string>} r - Array of topic parts.
         * @param {number} m - Current index in the topic parts array.
         * @param {string} f - The full topic string being published.
         * @param {any} g - The data payload.
         */
        c . _publish = function ( s , r , m , f , g ) {

            if ( typeof s != "undefined" ) {

                var h ;

                if ( m == r . length ) {
                    h = s ;
                } else {
                    // Recursively publish to specific topic parts and wildcard '*' topics.
                    this . _publish ( s . c [ r [ m ] ] , r , m + 1 , f , g ) ;
                    this . _publish ( s . c [ "*" ] , r , m + 1 , f , g ) ;
                    h = s . c [ "**" ] ; // Handle '**' wildcard
                }

                if ( typeof h != "undefined" ) {

                    var n = h . s ;
                    var q = n . length ;

                    for ( var k = 0 ; k < q ; k ++ ) {

                        if ( n [ k ] . cb ) {

                            var p = n [ k ] . scope ;
                            var j = n [ k ] . cb ;
                            var l = n [ k ] . fcb ;
                            var o = n [ k ] . data ;

                            if ( typeof j == "string" ) {
                                j = p [ j ] ;
                            }
                            if ( typeof l == "string" ) {
                                l = p [ l ] ;
                            }

                            // Execute filter callback if it exists and returns true, then execute main callback.
                            if ( ( ! l ) || ( l . call ( p , g , f , o ) ) ) {
                                j . call ( p , g , f , o ) ;
                            }
                        }
                    }
                }
            }
        } ;

        /*
         * Internal recursive method to handle unsubscriptions.
         * @param {object} o - Current node in the subscription tree.
         * @param {Array<string>} n - Array of topic parts.
         * @param {number} j - Current index in the topic parts array.
         * @param {string} g - The subscription ID to remove.
         */
        c . _unsubscribe = function ( o , n , j , g ) {

            if ( typeof o != "undefined" ) {

                if ( j < n . length ) {

                    var f = o . c [ n [ j ] ] ;

                    this . _unsubscribe ( f , n , j + 1 , g ) ;

                    // Clean up empty branches in the subscription tree.
                    if ( f . s . length == 0 ) {
                        for ( var m in f . c ) {
                            return ;
                        }
                        delete o . c [ n [ j ] ] ;
                    }
                    return ;

                } else {

                    var k = o . s ;
                    var l = k . length ;

                    for ( var h = 0 ; h < l ; h ++ ) {

                        if ( g == k [ h ] . sid ) {

                            // If currently in a publish cycle, mark for cleanup; otherwise, remove immediately.
                            if ( this . _pubDepth > 0 ) {
                                k [ h ] . cb = null ;
                                this . _cleanup . push ( k [ h ] ) ;
                            } else {
                                k . splice ( h , 1 ) ;
                            }
                            return ;
                        }
                    }
                }
            }
        } ;

        // Register the OpenAjax Hub itself as a library.
        OpenAjax . hub . registerLibrary ( "OpenAjax" , "http://openajax.org/hub" , "1.0" , { } ) ;
    } ;
}


/*global Kiwi, $k, $m, $v, $c, $, OpenAjax, window*/

/*
 * Prototypical Inheritance Polyfill
 * Provides Object.create functionality for environments that don't natively support it.
 * This ensures consistent behavior for object creation using prototypes.
 */
if ( typeof Object . create !== 'function' ) {

    Object . create = function ( o ) {

        var F = function ( ) {
        } ;

        F . prototype = o ;

        return new F ( ) ;

    } ;

}


/**
 * The main Kiwi framework object.
 * Contains sub-objects for models, views, controllers, helpers, and global options.
 */
var Kiwi = {

    // Models container
    m : { } ,

    // Views container
    v : { } ,

    // Controllers container
    c : { } ,

    // Helpers container (though 'h' is not explicitly used in the provided code, it's a common pattern)
    h : { } ,

    // Global framework options
    options : {
        // Base URL for API requests
        base_url : 'http://' + window . location . host ,

        // Global error handler configuration
        global_error_handler : {
            // Default base error handler
            base : function ( message , error_code , xhr ) {
            }
        } ,

        // Function to filter form elements before serialization
        form_filter : function ( ) {
            return this
        }
    }

} ;


/**
 * Kiwi.Connector Object
 * Handles HTTP requests (GET, POST, PUT, DELETE) for models.
 * @param {object} model - The model instance associated with this connector.
 */
Kiwi . Connector = function ( model ) {

    this . model = model ;

} ;


/**
 * Prototype methods for Kiwi.Connector.
 * Defines the core HTTP request functionalities.
 */
Kiwi . Connector . prototype = {

    /**
     * Sends an HTTP GET request.
     * @param {object} params - Parameters for the request.
     * @param {function} after_success - Callback on successful request.
     * @param {function} after_error - Callback on request error.
     * @param {object} options - Additional AJAX options.
     * @returns {object} - The result of the http_request call.
     */
    get : function ( params , after_success , after_error , options ) {
        return this . http_request ( null , 'get' , params , after_success , after_error , options ) ;
    } ,

    /**
     * Sends an HTTP POST request.
     * @param {object} params - Parameters for the request.
     * @param {function} after_success - Callback on successful request.
     * @param {function} after_error - Callback on request error.
     * @param {object} options - Additional AJAX options.
     * @returns {object} - The result of the http_request call.
     */
    post : function ( params , after_success , after_error , options ) {
        return this . http_request ( null , 'post' , params , after_success , after_error , options ) ;
    } ,

    /**
     * Sends an HTTP PUT request.
     * @param {object} params - Parameters for the request.
     * @param {function} after_success - Callback on successful request.
     * @param {function} after_error - Callback on request error.
     * @param {object} options - Additional AJAX options.
     * @returns {object} - The result of the http_request call.
     */
    put : function ( params , after_success , after_error , options ) {
        return this . http_request ( null , 'put' , params , after_success , after_error , options ) ;
    } ,

    /**
     * Sends an HTTP DELETE request.
     * @param {function} after_success - Callback on successful request.
     * @param {function} after_error - Callback on request error.
     * @param {object} options - Additional AJAX options.
     * @returns {object} - The result of the http_request call.
     */
    destroy : function ( after_success , after_error , options ) {
        return this . http_request ( null , 'delete' , { } , after_success , after_error , options ) ;
    } ,

    /**
     * Constructs the URI for the current model, optionally including a sub-URI.
     * @param {string} uri - An optional sub-URI segment.
     * @param {object} model - The model instance (defaults to this.model).
     * @returns {string} - The constructed URI.
     */
    uri : function ( uri , model ) {
        if ( ! model ) {
            model = this . model ;
        }
        return Kiwi . Parser . get_recursive_uri ( uri , model ) ;
    } ,

    /**
     * Performs the actual AJAX HTTP request.
     * This is the core method used by get, post, put, and destroy.
     * @param {string} uri - The request URI. If null, it's constructed from base_url + model URI.
     * @param {string} method - The HTTP method (e.g., 'get', 'post').
     * @param {object} params - Request parameters.
     * @param {function} after_success - Success callback.
     * @param {function} after_error - Error callback.
     * @param {object} options - jQuery AJAX options to extend.
     */
    http_request : function ( uri , method , params , after_success , after_error , options ) {

        // Ensure params object exists, default to empty object if not provided.
        params = params || { } ;

        // Check if the request is part of an ongoing Kiwi __request__.
        var request = typeof Kiwi . __request__ == 'undefined' ? false : Kiwi . __request__ ;

        if ( request ) {

            // If within a Kiwi request, objectify parameters and attach to the request.
            params = request . query_params = Kiwi . Parser . objectify_params ( params ) ;

            // Try to get an error handler from the request options if not explicitly provided.
            after_error = after_error || request . get_option ( 'on_error' ) ;

        }

        // If no error handler is found, use a no-op function to prevent errors.
        after_error = after_error || new Function ;

        // Create a ServerRequestHandler to manage success and error callbacks.
        var server_request_handler = new Kiwi . ServerRequestHandler ( after_success , after_error , request ) ;

        // Construct the full URI if not provided.
        if ( ! uri ) {
            uri = Kiwi . options . base_url + this . uri ( ) ;
        }

        // Set the AJAX options and make the call.
        options = $ . extend ( {
            type : method ,
            data : Kiwi . Parser . serialize_params ( params ) ,
            dataType : 'json' ,
            url : uri ,
            cache : false , // Disable caching for AJAX requests

            // Callback before sending the request.
            beforeSend : function ( ) {
                if ( request ) {
                    request . before_ajax_call ( ) ;
                }
            } ,

            // Callback when the request completes (success or error).
            complete : function ( xhr ) {
                if ( request ) {
                    request . after_ajax_call ( ) ;
                }
            } ,

            // Success callback for jQuery AJAX.
            success : function ( data , status ) {
                server_request_handler . success . apply ( request || this , [ data ] ) ;
            } ,

            // Error callback for jQuery AJAX.
            error : function ( xhr , status_message ) {
                server_request_handler . error ( xhr , status_message ) ;
            }
        } , options || { } ) ;

        $ . ajax ( options ) ;
    }

} ;


/**
 * Kiwi.ServerRequestHandler Object
 * Manages success and error handling for server responses.
 * It provides a structured way to handle different HTTP error codes.
 * @param {function} success_handler - The function to call on successful response.
 * @param {object|function} error_handler - An object mapping HTTP codes to functions, or a single function.
 * @param {object} request - The associated Kiwi.Request object, if any.
 */
Kiwi . ServerRequestHandler = function ( success_handler , error_handler , request ) {

    // Success handler is always passed.
    this . success = success_handler ;

    // Error handler can be an object with http error codes mapped to functions, or a single function.
    this . error_handler = error_handler || { } ;

    // Reference to the originating Kiwi request.
    this . request = request ;

} ;


/**
 * Prototype methods for Kiwi.ServerRequestHandler.
 * Defines the error handling logic.
 */
Kiwi . ServerRequestHandler . prototype = {

    /**
     * Handles AJAX error responses.
     * It checks for custom error handlers (per-request or global)
     * and provides default messages for common HTTP status codes.
     * @param {object} xhr - The XMLHttpRequest object.
     * @param {string} status_message - The status message (e.g., 'timeout', 'parsererror').
     */
    error : function ( xhr , status_message ) {

        // Determine the context for error handler execution.
        var context = this . request ? this . request . view : this ;

        // If the error handler is a simple function, execute it directly and return.
        if ( typeof this . error_handler === 'function' ) {
            this . error_handler . apply ( window , [ xhr , status_message ] ) ;
            return ;
        }

        var message = "" ;

        // Determine the error message based on XHR status.
        // TODO: Add handling for status 0 from local responses (e.g., network issues).
        switch ( xhr . status ) {

            // If status is 0, no connection was made to the server.
            case 0 :
                message = "Could not contact the server, please make sure you are connected to the Internet." ;
                break ;

            case 200 :
                // If 200, it's likely a parsererror or timeout, as it indicates a successful response header but problem with content.
                message = status_message === 'timeout' ? "The connection to the server timed out." : "There was a problem with the server response." ;
                break ;

            default :
                // Attempt to parse responseText as JSON for a more specific error message.
                // This assumes the server sends error details in JSON format.
                message = eval ( "(" + ( xhr . responseText ) + ")" ) ;
        }

        // Arguments to pass to the error handlers.
        var args = [ message , xhr . status , xhr ] ;

        // Call a custom universal error handler if defined in the request.
        if ( this . error_handler . all ) {
            this . error_handler . all . apply ( context , args ) ;
            return ;
        }

        // Call a custom error handler specific to the HTTP status code if defined.
        if ( this . error_handler [ xhr . status ] ) {
            this . error_handler [ xhr . status ] . apply ( context , args ) ;
            return ;
        }

        // Call a global error handler specific to the HTTP status code if defined in Kiwi.options.
        if ( Kiwi . options . global_error_handler [ xhr . status ] ) {
            Kiwi . options . global_error_handler [ xhr . status ] . apply ( context , args ) ;
        }

        // Finally, call the base global error handler.
        Kiwi . options . global_error_handler . base . apply ( context , args ) ;
    }

} ;


/**
 * Kiwi.Parser Object
 * Provides utility methods for parsing, serialization, and information extraction.
 */
Kiwi . Parser = {

    /**
     * Determines the type of a given value, including 'array' and 'null'.
     * This is a more robust type checking than the native 'typeof'.
     * @param {any} value - The value to check.
     * @returns {string} - The type of the value (e.g., 'string', 'number', 'array', 'object', 'null').
     */
    typeOf : function typeOf ( value ) {

        var s = typeof value ;

        if ( s === 'object' ) {

            if ( value ) {

                if ( value instanceof Array ) {
                    s = 'array' ;
                }

            } else {
                s = 'null' ;
            }

        }

        return s ;
    } ,

    /**
     * Extracts the event name from a space-separated string (e.g., "click .my-class" -> "click").
     * @param {string} string - The event string.
     * @returns {string} - The event name.
     */
    get_event_name : function ( string ) {
        return string . substring ( string . lastIndexOf ( " " ) + 1 ) ;
    } ,

    /**
     * Extracts the selector part from an event string and adjusts it based on view context.
     * Handles `::` prefix for global selectors.
     * @param {string} string - The event string (e.g., "click .my-class" or "click ::.global-class").
     * @param {object} view - The view object, used for its node selector.
     * @returns {string} - The processed CSS selector.
     */
    get_selector : function ( string , view ) {

        var selector = string . substring ( 0 , string . lastIndexOf ( " " ) ) ;

        if ( string . indexOf ( "::" ) == -1 ) {
            selector = view . node . selector + " " + selector ;
        } else {
            selector = selector . substring ( 2 ) ; // Remove the '::' prefix
        }

        return selector ;
    } ,

    /**
     * Resolves a handler string into an executable function and its context.
     * Supports external URLs, controller actions (e.g., "Controller.action"),
     * and view/helper actions (e.g., "action").
     * @param {string} string - The handler string.
     * @param {object} object - The current object context (e.g., a view).
     * @returns {object} - An object containing the class, action, action name, and filter.
     */
    get_handler : function ( string , object ) {

        // If 'http://' or 'https://' is encountered, assume a redirect.
        if ( string . indexOf ( "http://" ) != -1 || string . indexOf ( "https://" ) != -1 ) {
            return {
                klass : { type : 'external' } ,
                action : function ( ) {
                    window . location = string
                }
            } ;
        }

        // If a period is encountered, assume a controller and action.
        if ( string . indexOf ( "." ) != -1 ) {

            var a = string . split ( "." ) ;
            var controller = a [ 0 ] ;
            var action = a [ 1 ] ;

            // Initialize a no-op before filter.
            var filter = function ( ) {
            } ;

            if ( Kiwi . c [ controller ] . before ) {

                var filter_definition = Kiwi . c [ controller ] . before ;

                if ( Kiwi . Parser . typeOf ( filter_definition ) == 'array' ) {

                    // If filter is an array, check if the action is in the list to apply the filter.
                    if ( $ . inArray ( action , filter_definition [ 0 ] ) != -1 ) {
                        filter = Kiwi . c [ controller ] [ filter_definition [ 1 ] ] ;
                    }

                } else {
                    // If filter is a string, use it directly.
                    filter = Kiwi . c [ controller ] [ filter_definition ] ;
                }
            }

            return {
                klass : Kiwi . c [ controller ] ,
                action : Kiwi . c [ controller ] [ action ] ,
                action_name : action ,
                filter : filter
            } ;

        } else {

            // If no period, assume an action within the current object or a helper.
            action = string ;

            // If action is not found in current object, assume it's a helper.
            if ( ! object [ action ] ) {
                object = Kiwi . helpers . prototype ;
            }

            return {
                klass : object ,
                action : object [ action ] ,
                action_name : action
            } ;
        }
    } ,

    /**
     * Recursively constructs the full URI for a model, including its parent models.
     * @param {string} uri - The current URI segment being built.
     * @param {object} model - The current model in the hierarchy.
     * @returns {string} - The complete recursive URI.
     */
    get_recursive_uri : function ( uri , model ) {

        if ( ! uri ) {
            uri = "" ;
        }

        uri = model . uri ( ) + uri ;

        if ( model . parent ) {
            uri = this . get_recursive_uri ( uri , model . parent ) ;
        }

        return uri ;
    } ,

    /**
     * Serializes a JavaScript object into a URL-encoded query string format.
     * Handles nested objects and arrays.
     * @param {any} value - The value to serialize.
     * @param {string} prefix - The prefix for the current key in the query string.
     * @returns {string|null} - The URL-encoded string or null if empty.
     */
    serialize_object : function ( value , prefix ) {

        var retval_array = [ ] ;
        var retval = null ;
        var prefix = prefix || "" ;

        switch ( this . typeOf ( value ) ) {

            case 'array' :
                for ( var i = 0 ; i < value . length ; i ++ ) {
                    var element = this . serialize_object ( value [ i ] , prefix + '[]' ) ;
                    if ( element !== null ) {
                        retval_array . push ( element ) ;
                    }
                }
                retval = retval_array . length ? retval_array . join ( "&" ) : null ;
                break ;

            case 'object' :
                for ( key in value ) {
                    var element = this . serialize_object ( value [ key ] , prefix ? prefix + '[' + encodeURIComponent ( key ) + ']' : encodeURIComponent ( key ) ) ;
                    if ( element !== null ) {
                        retval_array . push ( element ) ;
                    }
                }
                retval = retval_array . length ? retval_array . join ( "&" ) : null ;
                break ;

            case 'null' :
                break ; // Do nothing for null values.

            default :
                // For primitive types, encode the key-value pair.
                retval = prefix + '=' + encodeURIComponent ( value ) ;
        }

        return retval ;
    } ,

    /**
     * Converts form elements within a jQuery object into a JavaScript object.
     * Similar to jQuery's serializeArray but returns an object.
     * @param {jQuery} jquery - A jQuery object containing form elements.
     * @param {string} prefix - An optional prefix for the resulting object (e.g., 'user[name]').
     * @returns {object} - The object representation of the form data.
     */
    objectify_form : function ( jquery , prefix ) {

        // Adapted from jquery.js for form serialization.
        var retval ;
        var object = { } ;

        jquery . map ( function ( ) {
            return this . elements ? jQuery . makeArray ( this . elements ) : this ;
        } )
            . filter ( function ( ) {
                return this . name && ! this . disabled &&
                    ( this . checked || /select|textarea/i . test ( this . nodeName ) ||
                        /text|hidden|password|search/i . test ( this . type ) ) ;
            } )
            . filter ( Kiwi . options . form_filter ) // Apply custom form filter.
            . each ( function ( i , elem ) {

                var val = jQuery ( this ) . val ( ) ;

                if ( val !== null ) {

                    if ( elem . name . match ( /\[\]$/ ) ) {
                        // Handle array-like names (e.g., "items[]").
                        if ( val == "" ) {
                            return ; // Ignore empty strings for array elements.
                        }
                        var key = elem . name . slice ( 0 , -2 ) ;
                        object [ key ] ? object [ key ] . push ( val ) : object [ key ] = [ val ] ;
                    } else {
                        // Handle regular named elements.
                        object [ elem . name ] = val ;
                    }

                }
            } ) ;

        if ( prefix ) {
            retval = { } ;
            retval [ prefix ] = object ;
        } else {
            retval = object ;
        }

        return retval ;
    } ,

    /**
     * Converts various input parameter types into a normalized object format.
     * Handles functions (which are called to get params) and jQuery objects (which are objectified as forms).
     * @param {any} params - The input parameters (can be an object, function, or jQuery object).
     * @returns {object} - The normalized parameters object.
     */
    objectify_params : function ( params ) {

        // Non-jQuery objects pass right through.
        var object = params ;

        if ( typeof params === 'function' ) {
            object = params . call ( Kiwi . __request__ ) ;
        }

        if ( params instanceof jQuery ) {
            object = this . objectify_form ( params ) ;
        }

        return object ;
    } ,

    /**
     * Serializes parameters into a URL-encoded string.
     * If params are not already a string, they are first objectified and then serialized.
     * @param {any} params - The parameters to serialize.
     * @returns {string} - The URL-encoded string.
     */
    serialize_params : function ( params ) {

        // Strings pass right through without further processing.
        if ( typeof params !== 'string' ) {
            params = this . serialize_object ( this . objectify_params ( params ) ) ;
        }

        return params ;
    } ,

    /**
     * Creates a broadcast-friendly name from a handler object.
     * (e.g., "Controller.actionName").
     * @param {object} handler - The handler object with klass and action_name properties.
     * @returns {string} - The broadcast name.
     */
    make_broadcast_name : function ( handler ) {
        return handler . klass . name + "." + handler . action_name ;
    } ,

    /**
     * Gets the current Unix timestamp (in milliseconds).
     * @returns {number} - The current Unix timestamp.
     */
    get_unix_timestamp : function ( ) {
        return parseInt ( new Date ( ) . getTime ( ) . toString ( ) , 10 ) ;
    } ,

    /**
     * Calculates the number of properties in an object.
     * Note: This uses jQuery.each, which might iterate over inherited properties too.
     * @param {object} object - The object to count properties of.
     * @returns {number} - The number of properties.
     */
    get_object_length : function ( object ) {
        var i = 0 ;
        $ . each ( object , function ( ) {
            i ++ ;
        } ) ;
        return i ;
    }

} ;


/**
 * Kiwi.Request Object
 * Represents an ongoing request (e.g., user interaction triggering an action chain).
 * It manages persistence, data flow, and AJAX call coordination throughout an action chain.
 * @param {HTMLElement} listened - The DOM element that was listened to.
 * @param {Event} event - The original DOM event that triggered the request.
 * @param {object} view - The view object associated with this request.
 * @param {object} options - Options specific to this request.
 * @param {function} callback - The original event handler callback.
 */
Kiwi . Request = function ( listened , event , view , options , callback ) {

    var that = this ; // Keep a reference to 'this' for closures.

    this . event = event ;
    this . view = view ;
    this . options = options ;
    this . data = { } ; // Data payload for the request chain.
    this . handler = Kiwi . Parser . get_handler ( this . options . action , this . view ) ;
    this . current_ajax_calls = 0 ; // Counter for active AJAX calls within this request.
    this . id = Kiwi . Parser . get_unix_timestamp ( ) ; // Unique ID for this request.
    this . stopper = null ; // Stores a function to stop event propagation.
    this . target = $ ( this . event . target ) ; // The element that triggered the event.
    this . listened = $ ( listened ) ; // The element that had the listener attached.
    this . __callback = callback ; // The original callback function for event delegation.

    // Sets up auto-id properties from the listened element's attributes.
    $ . each ( this . listened . get ( 0 ) . attributes , function ( ) {
        if ( this . nodeName . indexOf ( "_id" ) !== -1 ) {
            that [ this . nodeName ] = parseInt ( this . nodeValue ) ;
        }
    } ) ;

} ;


/**
 * Prototype methods for Kiwi.Request.
 * Defines the request lifecycle and interaction management.
 */
Kiwi . Request . prototype = {

    /**
     * Creates a continuation function that will process the result of the current action
     * and trigger a follow-up action. This is central to chaining actions.
     * @param {string} follow_up - The name of the next action to execute.
     * @returns {function} - A function that accepts data and continues the request.
     */
    continue_to : function ( follow_up ) {

        var self = this ;

        return function ( data ) {

            self . data = data ; // Update request data with the result of the previous action.
            self . handler = Kiwi . Parser . get_handler ( self . handler . klass . name + '.' + follow_up , self . handler . klass ) ;
            Kiwi . __request__ = self ; // Set the global current request.
            self . execute_action ( ) ; // Execute the next action.

            if ( self . current_ajax_calls === 0 ) {
                self . clean_up ( ) ;
            }

            delete Kiwi . __request__ ; // Clear the global current request.
        } ;
    } ,

    /**
     * Publishes the current request's data to the OpenAjax Hub.
     * Optionally triggers a view callback if `options.subscribe` is true.
     * @param {any} data - The data payload to publish.
     */
    publish : function ( data ) {

        this . data = data ;

        var broadcast_name = Kiwi . Parser . make_broadcast_name ( this . handler ) ;

        if ( this . options . subscribe ) {
            this . view [ this . options . callback ] . apply ( this . view , [ this ] , broadcast_name ) ;
        }

        OpenAjax . hub . publish ( broadcast_name , this ) ;
    } ,

    /**
     * Retrieves and processes parameters for the request.
     * Can extract from forms, call functions, or use a specified context.
     * @param {string} prefix - Optional prefix for form parameters.
     * @param {jQuery|object} context - Optional context to search for forms (defaults to view.node).
     * @returns {object} - The processed parameters object.
     */
    params : function ( prefix , context ) {

        prefix = prefix || this . options . params_prefix ;

        // Determine the context for parameters.
        if ( this . options . params_context ) {
            context = this . options . params_context instanceof jQuery ? this . options . params_context : this . get_option ( 'params_context' ) ;
        }

        context = context || this . view . node ; // Default context is the view's DOM node.

        // Objectify parameters from the form within the context.
        var params = Kiwi . Parser . objectify_form ( $ ( "form" , context ) , prefix ) ;

        // Process parameters if a `params_processor` is defined in options.
        if ( this . options . params_processor ) {
            var handler = this . get_option ( 'params_processor' ) ;
            params = handler ( params ) ;
        }

        return params ;
    } ,

    /**
     * Retrieves an option value from the request's options.
     * Handles different types of options (null, object, string for handler resolution).
     * @param {string} key - The key of the option to retrieve.
     * @returns {any} - The resolved option value or false if not found/invalid.
     */
    get_option : function ( key ) {

        var option = this . options [ key ] ;

        if ( ! option ) return false ;

        var parser = Kiwi . Parser ;

        if ( parser . typeOf ( option ) === 'null' ) {
            return null ;
        }

        if ( parser . typeOf ( option ) === 'object' ) {
            return option ;
        }

        // If the option is a string, assume it's a handler path and resolve it.
        if ( parser . typeOf ( option ) === 'string' ) {
            return Kiwi . Parser . get_handler ( option , this . view ) . action ;
        }

        return false ;
    } ,

    /**
     * Executes the action defined for the current request handler.
     * Handles view, helper, and controller actions, including controller before filters.
     * If an action throws 'halt', the execution stops.
     */
    execute_action : function ( ) {

        try {

            this . view . current_requests [ this . id ] = this ;

            if ( this . handler . klass . type === 'view' || this . handler . klass . type === 'helper' ) {
                // Run view method or helper.
                this . handler . action . apply ( this . view , [ this ] ) ;

            } else {
                // Provide shortcut to controller.
                // TODO: Need to provide a straightforward way for chaining controller actions without AJAX while keeping the request alive.
                this . controller = this . handler . klass ;

                // Run before filter and then the controller action.
                this . handler . filter . apply ( this ) ;
                this . handler . action . apply ( this ) ;
            }

        } catch ( thrown ) {
            if ( thrown == 'halt' ) {
                return ;
            }
        }
    } ,

    /**
     * Callback executed before each AJAX call within this request.
     * Handles `before_each_ajax_call` option, increments AJAX call counter,
     * puts an event stopper if `unbind` is true, and shows a loader.
     */
    before_ajax_call : function ( ) {

        if ( this . options . before_each_ajax_call ) {
            Kiwi . Parser . get_handler ( this . options . before_each_ajax_call , this . view ) . action . apply ( this . view , [ this ] ) ;
        }

        this . current_ajax_calls ++ ;

        if ( this . options . unbind && this . current_ajax_calls === 1 ) {
            this . put_event_stopper ( ) ; // Stop event propagation on the first AJAX call if unbind is true.
        }

        if ( this . options . show_loader ) {
            this . view . show_loader ( ) ;
        }
    } ,

    /**
     * Callback executed after each AJAX call within this request.
     * Decrements AJAX call counter, handles `after_each_ajax_call` option,
     * lifts event stopper, and hides loader if all AJAX calls are complete.
     */
    after_ajax_call : function ( ) {

        this . current_ajax_calls -- ;

        // Do anything that should be done after each individual AJAX call.
        if ( this . options . after_each_ajax_call ) {
            Kiwi . Parser . get_handler ( this . options . after_each_ajax_call , this . view ) . action . apply ( this . view , [ this ] ) ;
        }

        // Do anything that has been defined after all AJAX calls for this request are complete.
        if ( this . current_ajax_calls === 0 ) {

            if ( this . options . unbind ) {
                this . lift_event_stopper ( ) ; // Re-enable event propagation.
            }

            // If this is the only request active for the view, hide the loader.
            if ( this . view . count_requests ( ) === 1 ) {
                var after_callback = this . options . after_all_ajax_calls || this . view . hide_loader ;
                after_callback . apply ( this . view ) ;
            }

            this . clean_up ( ) ;
        }
    } ,

    /**
     * Cleans up the request after it has completed.
     * Currently, this just calls `destroy_self`.
     */
    clean_up : function ( ) {
        this . destroy_self ( ) ;
    } ,

    /**
     * Removes the request from the view's active requests.
     */
    destroy_self : function ( ) {
        delete this . view . current_requests [ this . id ] ;
    } ,

    /**
     * Temporarily stops event propagation for the listened element.
     * Prevents further events of the same type from being handled during an active request.
     */
    put_event_stopper : function ( ) {

        // Stops propagation temporarily so that event delegation halts.
        if ( this . options . live ) {
            this . stopper = function ( e ) {
                e . stopImmediatePropagation ( ) ;
                return false ;
            } ;
            $ ( this . event . target ) . bind ( this . event . type , this . stopper ) ;
        } else {
            this . listened . unbind ( this . event . type , this . __callback ) ;
        }
    } ,

    /**
     * Lifts the event stopper, allowing event propagation and delegation to resume.
     */
    lift_event_stopper : function ( ) {

        // Unbinds stopper, delegation works again.
        if ( this . options . live ) {
            $ ( this . event . target ) . unbind ( this . event . type , this . stopper ) ;
        } else {
            this . listened . bind ( this . event . type , this . __callback ) ;
        }
    }

} ;


/**
 * Kiwi.m (Model) Constructor/Factory Function
 * Creates and registers a new model definition.
 * It supports inheritance from other models by specifying a parent model name.
 * @param {string} name - The unique name of the model.
 * @param {string|object} a - Either the parent model name (string) or the model definition object (object).
 * @param {object} b - The model definition object, if 'a' was a parent model name.
 */
Kiwi . m = function ( name , a , b ) {

    var model ;
    var parent_associations = { } ; // Default empty associations.

    if ( typeof a == 'string' ) {
        // If 'a' is a string, it's the parent model name.
        parent_associations = Kiwi . m [ a ] . has ; // Inherit parent's 'has' associations.
        model = b ; // 'b' is the actual model definition.
    } else {
        // If 'a' is not a string, it's the model definition itself.
        model = a ;
    }

    // Create a new model object inheriting from Kiwi.m.prototype.
    var new_model = Object . create ( Kiwi . m . prototype ) ;

    new_model . name = name ;
    new_model . connector = new Kiwi . Connector ( new_model ) ; // Assign a connector for HTTP operations.

    // Extend the new model's 'has' associations with those inherited from the parent.
    // Ensure 'model.has' exists before extending.
    model . has = model . has || { } ;
    $ . extend ( model . has , parent_associations ) ;

    // Register the new model in Kiwi.m and extend it with the provided definition.
    Kiwi . m [ name ] = $ . extend ( new_model , model ) ;
} ;


/**
 * Model Methods (Kiwi.m.prototype)
 * Defines common functionalities for all models, such as data retrieval and persistence.
 */
Kiwi . m . prototype = {

    name : null , // The name of the model (e.g., 'User').
    type : 'model' , // Indicates this is a model type.
    connector : null , // The connector instance for this model.
    has : { } , // Defines relationships (e.g., 'hasMany', 'belongsTo').
    bound : false , // Indicates if the model instance is bound to a specific record (e.g., has an ID).

    /**
     * Finds model instances.
     * Supports finding by ID, or finding 'all' with optional parameters.
     * @param {number|string} identifier - The ID of the model instance or 'all' keyword.
     * @param {any} a - Can be params, after_success, or after_error depending on 'identifier'.
     * @param {any} b - Can be after_success, after_error, or options.
     * @param {any} c - Can be after_error or options.
     * @param {object} d - Options.
     * @returns {object} - The model instance or the result of the connector's GET request.
     */
    find : function ( identifier , a , b , c , d ) {

        // If identifier is a number, interpret as an ID.
        if ( typeof identifier === 'number' ) {

            var model = this . id ( identifier ) ; // Get a model instance by ID.
            var after_success = a ;
            var after_error = b ;
            var options = c ;

            // If a success callback is provided, make a GET request; otherwise, return the model instance.
            return after_success ? model . connector . get ( null , after_success , after_error , options ) : model ;

        } else if ( identifier === 'all' ) {

            if ( typeof a === 'function' ) {
                // If 'a' is a function, interpret it as the success callback and assume no params.
                after_success = a ;
                after_error = b ;
                options = c ;
                return this . connector . get ( null , after_success , after_error , options ) ;

            } else {
                // Otherwise, 'a' is parameters.
                var params = a ;
                after_success = b ;
                after_error = c ;
                options = d ;
                return this . connector . get ( params , after_success , after_error , options ) ;
            }
        }
    } ,

    /**
     * Creates a new model instance on the server.
     * Only allowed if the model instance is NOT already bound (i.e., doesn't have an ID).
     * @param {object} params - Data for the new model.
     * @param {function} after_success - Callback on successful creation.
     * @param {function} after_error - Callback on error.
     * @param {object} options - Additional AJAX options.
     * @returns {object} - The result of the connector's POST request.
     */
    create : function ( params , after_success , after_error , options ) {
        if ( ! this . bound ) {
            return this . connector . post ( params , after_success , after_error , options ) ;
        }
    } ,

    /**
     * Updates an existing model instance on the server.
     * Only allowed if the model instance IS already bound (i.e., has an ID).
     * @param {object} params - Data to update the model with.
     * @param {function} after_success - Callback on successful update.
     * @param {function} after_error - Callback on error.
     * @param {object} options - Additional AJAX options.
     * @returns {object} - The result of the connector's PUT request.
     */
    update : function ( params , after_success , after_error , options ) {
        if ( this . bound ) {
            return this . connector . put ( params , after_success , after_error , options ) ;
        }
    } ,

    /**
     * Deletes a model instance from the server.
     * Only allowed if the model instance IS already bound.
     * @param {function} after_success - Callback on successful deletion.
     * @param {function} after_error - Callback on error.
     * @param {object} options - Additional AJAX options.
     * @returns {object} - The result of the connector's DELETE request.
     */
    destroy : function ( after_success , after_error , options ) {
        if ( this . bound ) {
            return this . connector . destroy ( after_success , after_error , options ) ;
        }
    } ,

    /**
     * Placeholder for the URI generation method.
     * This method would typically be implemented by specific model instances.
     * @returns {string} - The URI for the model instance.
     */
    uri : function ( ) {
        // Implementation for constructing the URI for a specific model instance.
        // This is where a model's ID would typically be incorporated if 'bound' is true.
        // E.g., return "/api/" + this.name.toLowerCase() + (this.bound ? "/" + this.id : "");
    }

} ;