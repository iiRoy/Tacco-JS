/*
    json2.js - A JSON implementation for JavaScript.
    Version: 2013-05-26

    This code is in the Public Domain.
    NO WARRANTY IS EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    For more details, please visit http://www.JSON.org/js.html


    It is highly recommended that this code be minified before deployment
    to production environments.
    A good minifier can be found at http://javascript.crockford.com/jsmin.html

    IMPORTANT SECURITY NOTE:
    ALWAYS USE YOUR OWN COPY OF THIS LIBRARY. IT IS EXTREMELY UNWISE
    AND POTENTIALLY DANGEROUS TO LOAD CODE FROM SERVERS THAT YOU DO NOT
    CONTROL DIRECTLY.


    This file defines and creates a global JSON object if one doesn't already exist.
    The JSON object will contain two primary methods: `stringify` and `parse`.

        JSON.stringify( value, replacer, space )
            value       : Any JavaScript value, typically an object or an array.
                          This is the value to be converted to a JSON string.

            replacer    : An optional parameter. It dictates how object values
                          are processed during stringification. It can be:
                          - A function: Called for each key-value pair, with `this`
                            bound to the containing object. The return value is
                            serialized. Returning `undefined` excludes the member.
                          - An array of strings: Acts as a filter, ensuring only
                            members with keys present in this array are serialized.

            space       : An optional parameter that controls the indentation
                          of nested structures in the output JSON string.
                          - If omitted, the text will be packed without extra whitespace.
                          - If it's a number, it specifies the number of spaces to
                            use for indentation at each level.
                          - If it's a string (e.g., '\t' for tabs or '&nbsp;'),
                            it contains the characters to use for indentation.

            This method converts a JavaScript value into a JSON text string.

            When an object value is encountered, if that object possesses a `toJSON`
            method, then this `toJSON` method will be invoked. The result of this
            invocation will then be stringified. Note that a `toJSON` method does
            not directly serialize the object; instead, it returns the value that
            *should* be serialized for that name/value pair. If it returns `undefined`,
            nothing will be serialized for that pair. The `toJSON` method receives
            the key associated with the value, and its `this` context is bound to the
            value itself.

            For example, this snippet would cause `Date` objects to be serialized
            as ISO 8601 strings:

                Date.prototype.toJSON = function ( key ) {

                    function f(n) {
                        // Helper: Formats integers to have at least two digits,
                        // padding with a leading zero if necessary.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f( this.getUTCMonth() + 1 ) + '-' +
                         f( this.getUTCDate() )      + 'T' +
                         f( this.getUTCHours() )     + ':' +
                         f( this.getUTCMinutes() )   + ':' +
                         f( this.getUTCSeconds() )   + 'Z';
                };

            As mentioned, an optional `replacer` method can be supplied. This method
            will be passed the key and value of each member, with `this` bound to the
            containing object. The value returned by your `replacer` method is what
            will be serialized. If your method returns `undefined`, that specific
            member will be excluded from the final serialization output.

            If the `replacer` parameter is provided as an array of strings, it will
            be used to selectively choose which members are to be serialized. This
            effectively filters the output, ensuring that only members whose keys
            are present in the `replacer` array are stringified.

            Values that inherently lack JSON representations, such as `undefined` or
            `function` references, will not be serialized. In objects, such values
            will simply be dropped. In arrays, they will be replaced with `null`.
            A `replacer` function can be used to convert these into valid JSON values.
            Note that `JSON.stringify(undefined)` returns `undefined`.

            The optional `space` parameter, when provided, generates a stringification
            of the value that includes line breaks and indentation. This makes the
            resulting JSON text significantly easier to read and debug.

            If `space` is a non-empty string, that string will be directly used for
            indentation. If `space` is a number, then that many space characters
            will be used for indentation at each level.

            Example Usage:

            var text = JSON.stringify( [ 'e', { pluribus: 'unum' } ] );
            // text will be: '["e",{"pluribus":"unum"}]'


            text = JSON.stringify( [ 'e', { pluribus: 'unum' } ], null, '\t' );
            // text will be:
            // '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify( [ new Date() ], function ( key, value ) {
                return this[ key ] instanceof Date ?
                    'Date(' + this[ key ] + ')' : value;
            } );
            // text will be similar to: '["Date(---current time---)"]'


        JSON.parse( text, reviver )
            This method processes a JSON text string and constructs a JavaScript
            object or array based on the input.
            It is capable of throwing a `SyntaxError` exception if the input
            text is not valid JSON.

            The optional `reviver` parameter is a function. It provides a mechanism
            to filter and transform the results of the parsing process. It receives
            each key and value pair encountered during parsing, and its return value
            is used in place of the original value.
            - If it returns the value it received, the structure remains unmodified.
            - If it returns `undefined`, the member is effectively deleted from the
              resulting structure.

            Example Usage:

            // Parse a JSON text. Values that resemble ISO date strings will
            // be converted into actual Date objects.

            var myData = JSON.parse( text, function ( key, value ) {
                var a; // Temporary variable for regex match.
                if ( typeof value === 'string' ) {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec( value );
                    if ( a ) {
                        // Convert matched parts to numbers and create a UTC Date.
                        return new Date( Date.UTC( +a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6] ) );
                    }
                }
                return value; // Return original value if no transformation.
            } );

            myData = JSON.parse( '["Date(09/09/2001)"]', function ( key, value ) {
                var d; // Temporary Date object.
                if ( typeof value === 'string' &&
                        value.slice( 0, 5 ) === 'Date(' &&
                        value.slice( -1 ) === ')' ) {
                    d = new Date( value.slice( 5, -1 ) );
                    if ( d ) {
                        return d; // Return the new Date object if valid.
                    }
                }
                return value; // Return original value if no transformation.
            } );


    This implementation serves as a reference. You are explicitly free to copy,
    modify, and redistribute this code as needed.
*/

/*jslint evil: true, regexp: true, white: true */
/*global JSON */
/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Ensure a global JSON object exists. If not, create it.
// All methods are defined within a closure to prevent global variable leakage.

if ( typeof JSON !== 'object' )
{
    JSON = {};
}


( function () {
    'use strict';

    // Helper function to format numbers to at least two digits, used for dates.
    function f( n ) {

        // Prepend a '0' if the number is less than 10.
        return n < 10 ? '0' + n : n;
    }


    // Extend Date.prototype with a toJSON method if it doesn't already exist.
    // This allows Date objects to be serialized as ISO 8601 strings by default.
    if ( typeof Date.prototype.toJSON !== 'function' )
    {

        Date.prototype.toJSON = function () {

            // Only serialize finite date values; otherwise, return null.
            return isFinite( this.valueOf() )
                ? this.getUTCFullYear() + '-' +
                    f( this.getUTCMonth() + 1 ) + '-' + // getUTCMonth() is 0-indexed
                    f( this.getUTCDate() )      + 'T' +
                    f( this.getUTCHours() )     + ':' +
                    f( this.getUTCMinutes() )   + ':' +
                    f( this.getUTCSeconds() )   + 'Z'
                : null;
        };

        // Add toJSON methods for String, Number, and Boolean prototypes.
        // These simply return the primitive value.
        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    // Regular expression to identify control characters and problematic Unicode characters.
    // These characters need to be escaped during stringification.
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        // Regular expression to identify characters that must be escaped within JSON strings.
        escapable = /[\\\"\x00-\x1f\x7f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

        gap,        // The current indentation string (e.g., '  ' or '\t').
        indent,     // The indentation string for one level (e.g., '  ').

        // Map of common escape sequences for JSON.
        meta = {
            '\b': '\\b', // Backspace
            '\t': '\\t', // Horizontal tab
            '\n': '\\n', // Line feed
            '\f': '\\f', // Form feed
            '\r': '\\r', // Carriage return
            '"' : '\\"', // Double quote
            '\\': '\\\\' // Backslash
        },

        rep;        // The replacer function or array, if provided to stringify.


    // The `quote` function wraps a string in double quotes and escapes any
    // problematic characters within it according to JSON rules.
    function quote( string ) {

        // If the string contains no control characters, no double quotes,
        // and no backslashes, we can simply wrap it in quotes.
        // Otherwise, we must replace the offending characters with escape sequences.

        escapable.lastIndex = 0; // Reset the regex's lastIndex for consistent matching.
        return escapable.test( string ) ? '"' + string.replace( escapable, function ( a ) {
            var c = meta[ a ]; // Check if a direct escape sequence exists in `meta`.
            return typeof c === 'string'
                ? c
                // If not a common escape, convert to Unicode escape sequence (\uXXXX).
                : '\\u' + ( '0000' + a.charCodeAt( 0 ).toString( 16 ) ).slice( -4 );
        } ) + '"' : '"' + string + '"'; // If no escaping needed, just quote it.
    }


    // The `str` function is the core recursive serialization method.
    // It produces a JSON string representation of `holder[key]`.
    function str( key, holder ) {

        var i,          // Loop counter for arrays/replacer arrays.
            k,          // Key (property name) for objects.
            v,          // Value of the current member.
            length,     // Length of arrays or replacer arrays.
            mind = gap, // Store the indentation level before descending.
            partial,    // Array to hold stringified members of an object/array.
            value = holder[ key ]; // The value to be stringified.

        // If the value has a `toJSON` method, call it to get the actual
        // value that should be serialized.
        if ( value && typeof value === 'object' &&
                typeof value.toJSON === 'function' )
        {
            value = value.toJSON( key );
        }

        // If a `replacer` function was provided to `JSON.stringify`,
        // call it to potentially transform the value.
        if ( typeof rep === 'function' )
        {
            value = rep.call( holder, key, value );
        }

        // Determine how to stringify based on the value's type.
        switch ( typeof value )
        {
        case 'string':
            return quote( value ); // String values are quoted and escaped.

        case 'number':
            // JSON numbers must be finite. Non-finite numbers (NaN, Infinity)
            // are encoded as 'null'.
            return isFinite( value ) ? String( value ) : 'null';

        case 'boolean':
        case 'null':
            // Boolean and null values are converted directly to their string forms.
            // Note: `typeof null` returns 'object', but we handle it separately.
            return String( value );

        // If the type is 'object', it could be an object, an array, or null.
        case 'object':

            // Handle the `null` case explicitly, as `typeof null` is 'object'.
            if ( !value )
            {
                return 'null';
            }

            // Prepare to store the stringified members.
            partial = [];

            // Increase indentation level for nested structures.
            gap += indent;

            // Check if the value is an array.
            // Use `Object.prototype.toString.apply` for reliable array detection.
            if ( Object.prototype.toString.apply( value ) === '[object Array]' )
            {
                // The value is an array. Stringify each element.
                // Non-JSON values in arrays are replaced with 'null'.
                length = value.length;
                for ( i = 0; i < length; i += 1 )
                {
                    partial[ i ] = str( i, value ) || 'null';
                }

                // Join all elements with commas and wrap in brackets.
                // Apply indentation if `gap` is active.
                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join( ',\n' + gap ) + '\n' + mind + ']'
                    : '[' + partial.join( ',' ) + ']';

                // Restore previous indentation level.
                gap = mind;
                return v;
            }

            // If a `replacer` array was provided, iterate over its elements
            // to select which members of the object to stringify.
            if ( rep && typeof rep === 'object' )
            {
                length = rep.length;
                for ( i = 0; i < length; i += 1 )
                {
                    if ( typeof rep[ i ] === 'string' )
                    {
                        k = rep[ i ]; // The key from the replacer array.
                        v = str( k, value ); // Stringify the member.
                        if ( v )
                        {
                            // Add the key-value pair to the partial array.
                            partial.push( quote( k ) + ( gap ? ': ' : ':' ) + v );
                        }
                    }
                }
            }
            else
            {
                // No replacer array: iterate over all enumerable properties of the object.
                for ( k in value )
                {
                    // Ensure the property is directly on the object and not inherited.
                    if ( Object.prototype.hasOwnProperty.call( value, k ) )
                    {
                        v = str( k, value ); // Stringify the member.
                        if ( v )
                        {
                            // Add the key-value pair to the partial array.
                            partial.push( quote( k ) + ( gap ? ': ' : ':' ) + v );
                        }
                    }
                }
            }

            // Join all member texts together with commas and wrap them in braces.
            // Apply indentation if `gap` is active.
            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join( ',\n' + gap ) + '\n' + mind + '}'
                : '{' + partial.join( ',' ) + '}';

            // Restore previous indentation level.
            gap = mind;
            return v;
        }
    }

    // If `JSON.stringify` does not already exist, define it.
    if ( typeof JSON.stringify !== 'function' )
    {
        JSON.stringify = function ( value, replacer, space ) {

            // This method converts a JavaScript `value` into a JSON text string.
            // It accepts an optional `replacer` (function or array) and an optional
            // `space` parameter for formatting the output.

            var i; // Loop counter.
            gap = ''; // Initialize current indentation string.
            indent = ''; // Initialize single-level indentation string.

            // If `space` is a number, create an indent string consisting of
            // that many space characters.
            if ( typeof space === 'number' )
            {
                for ( i = 0; i < space; i += 1 )
                {
                    indent += ' ';
                }
            }
            // If `space` is a string, use it directly as the indent string.
            else if ( typeof space === 'string' )
            {
                indent = space;
            }

            // Assign the replacer. Validate its type: it must be a function or an array.
            // Otherwise, throw an error.
            rep = replacer;
            if ( replacer && typeof replacer !== 'function' &&
                    ( typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number' ) )
            {
                throw new Error( 'JSON.stringify: Invalid replacer argument.' );
            }

            // Create a fake root object to hold the value under the key ''.
            // Then, call `str` to stringify this root value.
            return str( '', { '': value } );
        };
    }


    // If `JSON.parse` does not already exist, define it.
    if ( typeof JSON.parse !== 'function' )
    {
        JSON.parse = function ( text, reviver ) {

            // This method parses a JSON text string and returns the corresponding
            // JavaScript value (object or array).
            // It accepts an optional `reviver` function for post-processing.

            var j; // Variable to hold the parsed JavaScript structure.

            // The `walk` method recursively traverses the parsed structure,
            // applying the `reviver` function to each key-value pair.
            function walk( holder, key ) {

                var k, v, value = holder[ key ]; // Current key, value, and the value itself.

                // If the value is an object, recursively walk its properties.
                if ( value && typeof value === 'object' )
                {
                    for ( k in value )
                    {
                        if ( Object.prototype.hasOwnProperty.call( value, k ) )
                        {
                            v = walk( value, k ); // Recurse.
                            if ( v !== undefined )
                            {
                                value[ k ] = v; // Update value if reviver returned something.
                            }
                            else
                            {
                                delete value[ k ]; // Delete property if reviver returned undefined.
                            }
                        }
                    }
                }
                // Call the reviver function for the current key-value pair.
                return reviver.call( holder, key, value );
            }


            // Parsing proceeds in several stages for security and robustness.

            // Stage 1: Normalize the input text.
            // Replace certain Unicode characters that JavaScript handles
            // incorrectly (e.g., by deleting them or treating as line endings)
            // with their proper escape sequences.
            text = String( text );
            cx.lastIndex = 0; // Reset regex index.
            if ( cx.test( text ) )
            {
                text = text.replace( cx, function ( a ) {
                    return '\\u' +
                        ( '0000' + a.charCodeAt( 0 ).toString( 16 ) ).slice( -4 );
                } );
            }

            // Stage 2: Validate the JSON text against a set of regular expressions
            // to ensure it conforms to JSON syntax and does not contain malicious code.
            // We're particularly wary of '()', 'new', and '=' as they can lead to
            // invocation or mutation. This stage rejects all non-JSON forms.

            // This stage is split into multiple regex operations to work around
            // performance issues in some JavaScript engines (like IE and Safari).
            // 1. Replace JSON backslash pairs with a non-JSON character '@'.
            // 2. Replace simple value tokens (strings, numbers, booleans, null) with ']'.
            // 3. Delete all open brackets that follow a colon or comma, or that
            //    begin the text.
            // 4. Finally, check if the remaining characters are only whitespace,
            //    ']', ',', ':', '{', or '}'. If so, the text is considered safe for `eval`.

            if ( /^[\],:{}\s]*$/
                    .test( text.replace( /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@' )
                        .replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']' )
                        .replace( /(?:^|:|,)(?:\s*\[)+/g, '' ) ) )
            {

                // Stage 3: Use the `eval` function to compile the validated text
                // into a JavaScript structure.
                // The '{' operator can be ambiguous (block vs. object literal).
                // Wrapping the text in parentheses `()` resolves this ambiguity,
                // forcing it to be interpreted as an expression.
                j = eval( '(' + text + ')' );

                // Stage 4: If a `reviver` function was provided, recursively walk
                // the newly created structure, passing each name/value pair to the
                // reviver for potential transformation.
                return typeof reviver === 'function'
                    ? walk( { '': j }, '' ) // Use a fake root object for the initial call.
                    : j; // If no reviver, return the parsed object directly.
            }

            // If the text fails the JSON parseability checks, throw a SyntaxError.
            throw new SyntaxError( 'JSON.parse: Invalid JSON string.' );
        };
    }
}() );



/**
 *  indoor.js - A library for handling indoor mapping features.
 *  Developed by Whatamap.com Ltd, 2013.
 *  All rights reserved.
 */
L.indoor =
 {
  /**
   *  Creates a LatLng object with an associated level.
   *  @param {number} lat - The latitude.
   *  @param {number} lng - The longitude.
   *  @param {number} level - The indoor level.
   *  @returns {L.LatLng} A Leaflet LatLng object with an added `level` property.
   */
  latLng: function( lat, lng, level ) {
    var latLng = new L.LatLng( lat, lng ); // Create a standard Leaflet LatLng.
    latLng.level = level;                 // Attach the level information.
    return latLng;
  },

  /**
   *  Initializes an indoor map.
   *  @param {HTMLElement|string} element - The HTML element or its ID where the map will be initialized.
   *  @param {*} _ - An unused parameter (placeholder).
   *  @param {object} options - Configuration options for the map.
   *  @param {function} callback - A callback function to be executed after map initialization.
   */
  map: function( element, _, options, callback ) {
    // ... further implementation ...
  }
};