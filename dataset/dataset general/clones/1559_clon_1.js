/**
 *  simple-errors module
 *
 *  This module provides extended Error capabilities for JavaScript applications.
 *  It helps in creating and managing errors with additional metadata and status codes.
 *  The primary goal is to simplify error handling and provide more contextual information.
 *
 *  License: BSD-3-Clause
 */

/**
 *  Use the `Error.create` static method to generate new `Error` instances.
 *  This method allows for the inclusion of custom metadata and error chaining.
 *
 *  @function create
 *  @param {string} msg - The primary error message. If omitted, defaults to "Unknown error".
 *  @param {any} [data] - Optional metadata to attach to the error. Can be an object, array, or primitive.
 *  @param {any} [inner] - An optional inner error or value for chaining purposes.
 *                          If `data` is an `Error` instance and `inner` is not provided,
 *                          `data` will be treated as the `inner` error.
 *  @returns {Error} A newly created Error instance with extended properties.
 *  @api public
 */

var       errno = require( 'errno' ) ;

Error.create = function ( msg , data , inner ) {
    "use strict" ;

    // Declare variables for the error instance and the inner error value.
    var err ,
        innerValue ;

    // Ensure `data` is an object, initializing it if null or undefined.
    data = data || { } ;

    // Instantiate a new Error object with the provided message, or a default.
    err = new Error( msg || "Unknown error" ) ;

    // Determine the actual inner error value.
    // If 'inner' is provided, use it. Otherwise, check if 'data' itself is an Error.
    innerValue = inner || ( ( data instanceof Error ) ? data : null ) ;

    // If an inner error is identified, attach it to the new error instance.
    if ( innerValue ) {
        err.inner = innerValue ;
    }

    // Attach custom data to the error.
    // If 'data' is an array or a primitive type, assign it directly to 'err.data'.
    if ( ( data instanceof Array ) || ( typeof data !== 'object' ) ) {
        err.data = data ;
    }
    // Otherwise, if 'data' is an object, merge its properties onto the error instance.
    else {
        Object.keys( data ).forEach( function ( key ) {
            err[ key ] = data[ key ] ;
        } ) ;
    }

    // Ensure the error has a status code.
    // Default to 500 if no status is explicitly set, or inherit from an inner error.
    if ( ! err.status ) {
        err.status = ( ( err.inner && err.inner.status ) ? err.inner.status : 500 ) ;
    }

    // Generate a description for the error based on the inner error, if any.
    err.description = innerValue ? errmsg( innerValue ) : '' ;

    // Return the fully constructed error object.
    return err ;
} ;

/**
 *  Utilize `Error.http` to create `Error` instances specifically for HTTP-related scenarios.
 *  These errors come with an associated HTTP status code.
 *
 *  @param {number|string} [code] - The HTTP status code. If a string, it's treated as the message
 *                                   and the code defaults to 500.
 *  @param {string} [msg] - The HTTP error message.
 *  @param {any} [data] - Optional metadata to include with the error.
 *  @param {Error|string} [inner] - An optional inner error or value for chaining.
 *  @returns {Error} An Error instance with an HTTP status property.
 */
Error.http = function ( code , msg , data , inner ) {
    "use strict" ;

    // Handle flexible argument signature:
    // If the first argument 'code' is a string, it's actually the message.
    if ( typeof ( code ) === 'string' ) {
        inner = data ; // Shift arguments to the right.
        data = msg ;
        msg = code ;
        code = 500 ; // Default to Internal Server Error.
    }

    // Ensure 'code' is a number, defaulting to 500 if not provided or invalid.
    code = code || 500 ;

    // Determine the error message, prioritizing provided message, then status code lookup, then generic.
    msg = msg || statusCodes[ "" + code ] || 'Unknown error' ;
    
    // Create the base error using the general Error.create method.
    var err = Error.create( msg , data , inner ) ;

    // Explicitly set the HTTP status code on the error object.
    err.status = code ;

    // Return the HTTP-specific error.
    return err ;
} ;

/**
 *  Recursively converts an `Error` instance (and its inner errors) into a plain JSON object.
 *  This is particularly useful for logging or transmitting error details, including stack traces.
 *
 *  @param {Error|Object|string} err - The error object to convert. Can also be a string.
 *  @returns {Object} A JSON-serializable representation of the error.
 *  @api public
 */
Error.toJson = function ( err ) {
    "use strict" ;

    // If the input is just a string, return a simple message object.
    if ( typeof ( err ) === 'string' ) return { message: err } ;

    // Initialize an empty object to store error information.
	var info = { } ;

	// If the input is an actual Error instance, extract its message and stack.
	if ( err instanceof Error ) {
		info.message = err.message ;
		// Split the stack trace into an array of lines for easier parsing/display.
		info.stack = err.stack && err.stack.split( "\n" ) ;
    }

    // If the input is a generic object, iterate over its properties.
    if ( typeof ( err ) === 'object' ) {
        for ( var prop in err ) {
            var value = err[ prop ] ;
            // Recursively convert any nested Error instances to JSON.
            info[ prop ] = ( value instanceof Error ) ? Error.toJson( value ) : value ;
        }
    }
    
    // Return the comprehensive error information object.
    return info ;
} ;

/**
 *  Aggregates public-facing error messages from an error chain.
 *  A "public" error is defined as an error instance with a `public` property set to `true`,
 *  or any error with an HTTP status code less than 500 (client-side errors).
 *
 *  @param {Error|Object} err - The error object to inspect.
 *  @returns {string} A concatenated string of public error messages.
 *  @api public
 */
Error.publicMessage = function ( err ) {
    "use strict" ;
    // Initialize the message string and get the status code.
    var msg = "" ,
        statusCode = err.status ;

    // If the status code indicates a client error (less than 500), include its message.
    if ( statusCode && Number( statusCode ) < 500 ) {
        msg += err.message ;
    }

    // If there's an inner error, recursively get its public message.
    if ( err.inner ) {
        var innerMessage = Error.publicMessage( err.inner ) ;
        // Append the inner message, prefixed with " - " if it's not empty.
        msg += innerMessage !== "" ? " - " + innerMessage : "" ;
    }
    // Return the aggregated public message.
    return msg ;
} ;

// A collection of standard HTTP status codes and their corresponding descriptive messages.
var statusCodes = {
    "400" : "Bad Request" ,
    "401" : "Unauthorized" ,
    "402" : "Payment Required" ,
    "403" : "Forbidden" ,
    "404" : "Not Found" ,
    "405" : "Method Not Allowed" ,
    "406" : "Not Acceptable" ,
    "407" : "Proxy Authentication Required" ,
    "408" : "Request Timeout" ,
    "409" : "Conflict" ,
    "410" : "Gone" ,
    "411" : "Length Required" ,
    "412" : "Precondition Failed" ,
    "413" : "Request Entity Too Large" ,
    "414" : "Request-URI Too Long" ,
    "415" : "Unsupported Media Type" ,
    "416" : "Requested Range Not Satisfiable" ,
    "417" : "Expectation Failed" ,
    "418" : "I'm a teapot" ,
    "422" : "Unprocessable Entity" ,
    "423" : "Locked" ,
    "424" : "Failed Dependency" ,
    "425" : "Unordered Collection" ,
    "426" : "Upgrade Required" ,
    "428" : "Precondition Required" ,
    "429" : "Too Many Requests" ,
    "431" : "Request Header Fields Too Large" ,
    "500" : "Internal Server Error" ,
    "501" : "Not Implemented" ,
    "502" : "Bad Gateway" ,
    "503" : "Service Unavailable" ,
    "504" : "Gateway Timeout" ,
    "505" : "HTTP Version Not Supported" ,
    "506" : "Variant Also Negotiates" ,
    "507" : "Insufficient Storage" ,
    "508" : "Loop Detected" ,
    "510" : "Not Extended" ,
    "511" : "Network Authentication Required"
} ;



/**
 *  Helper function to generate a descriptive error message from a system error object.
 *  Uses the 'errno' module to look up descriptions for system error codes.
 *
 *  @param {Object} err - The error object, potentially with an `errno` property.
 *  @returns {string} A formatted error message.
 */
function errmsg ( err ) {
    var str = 'Error: ' ;
    if ( errno.errno[ err.errno ] ) {
        str += errno.errno[ err.errno ].description ;
    } else {
        str += err.message ;
    }

    if ( err.path ) {
        str += ' [' + err.path + ']' ;
    }
    return str ;
}