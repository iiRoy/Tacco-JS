/*
 * This is a Type I clone of the original jQuery Cookie Plugin v1.3.1.
 * The original source can be found at https://github.com/carhartl/jquery-cookie
 *
 * All logical and structural elements, including identifiers, operators, and expressions,
 * are preserved exactly as in the original code.
 *
 * Changes are limited exclusively to whitespace (indentation, line breaks, spacing)
 * and comments (additions, modifications, or removals) to achieve a visually distinct
 * but functionally identical representation.
 *
 * Original Copyright 2013 Klaus Hartl - Released under the MIT license.
 */

// Start of the Immediately Invoked Function Expression (IIFE)
// This pattern helps create a private scope for the plugin.
( function ( factory ) {

    // Check for Asynchronous Module Definition (AMD) environment.
    // This allows the plugin to be used with module loaders like RequireJS.
    if ( typeof define === 'function' && define.amd ) {

        // If AMD is detected, register the plugin as an anonymous module.
        // It declares 'jquery' as a dependency, which will be passed to 'factory'.
        define( [ 'jquery' ], factory );

    } else {

        // If not AMD, assume a traditional browser environment.
        // The 'factory' function is called directly with the global jQuery object.
        factory( jQuery );

    } // End of AMD/Browser check.

} ( function ( $ ) {

    // Regular expression to find all '+' signs.
    // This is used later to replace them with spaces during decoding.
    var pluses = /\+/g;


    /**
     * Decodes a given string, handling raw mode if configured.
     * @param {string} s The string to decode.
     * @returns {string} The decoded string.
     */
    function decode( s ) {

        // If raw mode is enabled in the configuration, return the string as is.
        if ( config.raw ) { return s; }

        // Otherwise, replace '+' with spaces and then decode URI components.
        return decodeURIComponent( s.replace( pluses, ' ' ) );
    }



    /**
     * Decodes and optionally parses a cookie string.
     * Handles RFC2068 quoted cookies and JSON parsing based on configuration.
     * @param {string} s The cookie string to decode and parse.
     * @returns {*} The decoded and parsed value, or the original string on error.
     */
    function decodeAndParse( s ) {

        // Check if the string is a quoted cookie (starts with double quote).
        // If so, unescape it according to RFC2068 rules.
        if ( s.indexOf( '"' ) === 0 ) {

            // Remove leading/trailing quotes, then unescape escaped quotes and backslashes.
            s = s.slice( 1, -1 ).replace( /\\"/g, '"' ).replace( /\\\\/g, '\\' );

        }


        // Decode the string using the primary 'decode' function.
        s = decode( s );

        try {
            // If JSON parsing is enabled, attempt to parse the string as JSON.
            // Otherwise, return the string as is.
            return config.json ? JSON.parse( s ) : s;
        } catch ( e ) { /* Ignore parsing errors, return original string implicitly if error occurs */ }

        // If JSON.parse fails, the original string 's' is implicitly returned (or undefined if no return).
        // This preserves the exact behavior of the original code.
    }



    // The main cookie function, which is also assigned to $.cookie.
    // This function acts as both a getter and a setter for cookies.
    var config = $.cookie = function ( key, value, options ) {

        // *** Cookie Writing Logic ***
        // If 'value' is provided (not undefined), it means we are setting a cookie.
        if ( value !== undefined ) {

            // Extend default options with user-provided options.
            // This ensures we don't modify the global defaults directly.
            options = $.extend( {}, config.defaults, options );


            // Handle 'expires' option: convert number of days to a Date object.
            if ( typeof options.expires === 'number' ) {

                var days = options.expires,

                    // Create a new Date object for expiration.
                    t = options.expires = new Date();

                // Set the expiration date by adding 'days' to the current date.
                t.setDate( t.getDate() + days );
            }


            // Convert the value to a string. If JSON mode is enabled, stringify it.
            value = config.json ? JSON.stringify( value ) : String( value );

            // Construct and set the cookie string.
            // The result of the assignment is the assigned value, which is the cookie string itself.
            return ( document.cookie = [

                // Encode key unless raw mode is enabled.
                config.raw ? key : encodeURIComponent( key ),

                // Separator between key and value.
                '=',

                // Encode value unless raw mode is enabled.
                config.raw ? value : encodeURIComponent( value ),

                // Add 'expires' attribute if provided.
                // Note: max-age is not supported by IE, so 'expires' is used.
                options.expires ? '; expires=' + options.expires.toUTCString() : '',

                // Add 'path' attribute if provided.
                options.path ? '; path=' + options.path : '',

                // Add 'domain' attribute if provided.
                options.domain ? '; domain=' + options.domain : '',

                // Add 'secure' attribute if provided (a flag, no value needed).
                options.secure ? '; secure' : ''

            // Join all parts to form the final cookie string.
            ].join( '' ) );

        } // End of cookie writing logic.


        // *** Cookie Reading Logic ***
        // If 'value' is undefined, it means we are reading cookies.

        // Split the document.cookie string into individual cookie parts.
        var cookies = document.cookie.split( '; ' );

        // Initialize 'result'. If a 'key' is provided, result is undefined initially.
        // If no 'key' is provided (meaning we want all cookies), result is an empty object.
        var result = key ? undefined : {};

        // Loop through each cookie to find the requested one or collect all.
        for ( var i = 0, l = cookies.length; i < l; i++ ) {

            // Split each cookie part into name and value.
            var parts = cookies[ i ].split( '=' );

            // Decode the cookie name (the first part).
            var name = decode( parts.shift() );

            // The rest of the parts form the cookie value (in case value itself contained '=').
            var cookie = parts.join( '=' );


            // If a specific 'key' was requested and it matches the current cookie's name.
            if ( key && key === name ) {

                // Decode and parse the cookie value.
                result = decodeAndParse( cookie );

                // Found the cookie, so break the loop.
                break;
            }


            // If no specific 'key' was requested (collecting all cookies).
            if ( !key ) {

                // Store the decoded and parsed cookie value in the result object, using its name as the key.
                result[ name ] = decodeAndParse( cookie );

            }
        } // End of cookie iteration loop.

        // Return the found cookie value, or the object of all cookies, or undefined.
        return result;

    }; // End of $.cookie function definition.


    // Default options for the cookie plugin.
    // Currently, it's an empty object, allowing users to extend it.
    config.defaults = {};


    /**
     * Removes a cookie by setting its expiration to a past date.
     * @param {string} key The name of the cookie to remove.
     * @param {Object} [options] Options for removal (e.g., path, domain).
     * @returns {boolean} True if the cookie was found and removed, false otherwise.
     */
    $.removeCookie = function ( key, options ) {

        // Check if the cookie actually exists before attempting to remove it.
        if ( $.cookie( key ) !== undefined ) {

            // To remove a cookie, we set its value to an empty string and its expiration to -1 (a past date).
            // We must not alter the 'options' object passed in, so we extend a fresh object.
            // This ensures path/domain settings are correctly applied for removal.
            $.cookie( key, '', $.extend( {}, options, { expires: -1 } ) );

            return true; // Cookie was found and removed.
        }

        return false; // Cookie was not found.
    };


} ) ); // End of the IIFE execution.