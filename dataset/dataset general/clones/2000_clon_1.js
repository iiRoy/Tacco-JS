( function ( root , factory ) {

    // Check if we are in a Node.js or CommonJS-like environment
    if ( typeof module === 'object' && module.exports ) {
        // Export the factory result directly
        module.exports = factory();

    }
    // Otherwise, check for AMD (Asynchronous Module Definition) like RequireJS
    else if ( typeof define === 'function' && define.amd ) {

        // Define an anonymous AMD module using the factory
        define( factory );

    }
    // If neither Node.js/CommonJS nor AMD, assume a browser environment
    else {
        // Attach the factory's return value to the root object (e.g., window)
        root.qulog = factory();
    }

// Pass 'this' (global object) and the factory function to the IIFE
}( this , function factory () {
    "use strict" ; /* Enforce strict JavaScript parsing and execution rules */

    // Declare core variables for the logging utility
    var logFunc ,       // This will hold the actual logging function
        isDebug = true ,    // Flag to control whether messages are logged (default: enabled)
        dummyArray = [ 0 ] ,    // Used for IE8 compatibility trick with console.log.apply
        isModern = false ;      // Flag to determine if the environment supports modern console APIs

    // Determine the appropriate logging mechanism based on browser/environment capabilities
    if ( typeof console.log.apply === "function" ) {
        // This branch is for modern browsers (IE9+, Chrome, Firefox, Safari) and Node.js
        isModern = true ; // Mark the environment as modern
        logFunc = function qulog () {
            // Only execute log if debugging is currently enabled
            if ( isDebug ) {
                // Use apply to correctly pass all arguments to console.log
                console.log.apply( console , arguments ) ;
            }
        } ;
    }
    else {
        // This branch is a fallback for older browsers like IE8 and below
        logFunc = function qulog () {
            // Only log if debugging is active
            if ( isDebug ) {
                // IE8's console.log is an object, not a true function, and lacks .apply.
                // This clever trick uses Function.prototype.call.apply to invoke
                // console.log with the correct 'this' context and arguments.
                Function.prototype.call.apply(
                    console.log , // The target function (console.log)
                    dummyArray.concat( // Prepends a 'this' context (dummy value)
                        Array.prototype.slice.call( arguments , 0 ) // Converts arguments object to a real array
                    )
                ) ;
            }
        } ;
    }

    // --- Define traditional getters and setters for controlling the logging state ---

    // Getter for the 'on' or 'debug' state
    logFunc.getOn = logFunc.getDebug = function () {
        return isDebug ; // Returns true if logging is enabled, false otherwise
    } ;

    // Setter for the 'on' or 'debug' state
    logFunc.setOn = logFunc.setDebug = function ( value ) {
        // Ensure the input is a boolean before updating the state
        if ( typeof value === "boolean" ) {
            isDebug = value ; // Set the debug flag
        }
    } ;

    // Getter for the 'off' or 'production' state (inverse of debug)
    logFunc.getOff = logFunc.getProduction = function () {
        return ! isDebug ; // Returns true if logging is disabled, false otherwise
    } ;

    // Setter for the 'off' or 'production' state
    logFunc.setOff = logFunc.setProduction = function ( value ) {
        // Only proceed if the input is a boolean
        if ( typeof value === "boolean" ) {
            isDebug = value === false ; // If value is true, disable logging; if false, enable it
        }
    } ;

    // --- Conditionally define modern property accessors using Object.defineProperties ---

    // Object.defineProperty has limited support in IE8 (only for DOM objects).
    // This feature is enabled only for "modern" environments.
    if ( isModern ) {
        // Define 'on', 'debug', 'off', and 'production' properties on logFunc
        // These properties use the previously defined getters and setters.
        Object.defineProperties( logFunc , {
            on : { // Property to turn logging on/off directly
                get : logFunc.getOn ,
                set : logFunc.setOn ,
                enumerable : true ,      // Allows property to be seen in for...in loops
                configurable : false     // Prevents deletion or redefinition of the property
            } ,
            debug : { // Alias for 'on'
                get : logFunc.getOn ,
                set : logFunc.setOn ,
                enumerable : true ,
                configurable : false
            } ,
            off : { // Property to check/set production mode (inverse of debug)
                get : logFunc.getOff ,
                set : logFunc.setOff ,
                enumerable : true ,
                configurable : false
            } ,
            production : { // Alias for 'off'
                get : logFunc.getOff ,
                set : logFunc.setOff ,
                enumerable : true ,
                configurable : false
            }
        } ) ;
    }

    // Return the fully configured logging function
    return logFunc ;
} ) ) ;