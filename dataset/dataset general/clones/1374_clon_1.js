/*
 * Duration Format Plugin for Moment.js
 * Version: 1.3.0
 *
 * This file contains the implementation of the duration formatting functionality.
 *
 * Original Author: John Madhavan-Reese
 * Project Home: https://github.com/jsmreese/moment-duration-format
 * License: MIT License (see original project for details)
 *
 * Date of Generation: 2014-07-15
 *
 * This is a Type I clone, meaning it is exactly equal to the original code
 * except for variations in whitespace and comments. All functional code,
 * identifiers, and expressions remain precisely the same.
 */

( function ( root, undefined ) {

    // -------------------------------------------------------------------------
    // Utility Functions - These are internal helpers used by the main plugin.
    // -------------------------------------------------------------------------

    /**
     * repeatZero(qty)
     * Generates a string consisting of '0' repeated 'qty' times.
     *
     * @param {number} qty - The number of zeros to repeat.
     * @returns {string} A string of repeated zeros.
     */
    function repeatZero ( qty ) {
        var result = ""; // Initialize an empty string for the result.

        // Early exit condition:
        // If qty is not a valid positive integer, return an empty string.
        qty = parseInt( qty, 10 );
        if ( !qty || qty < 1 ) {
            return result;
        }

        // Loop to append zeros to the result string.
        while ( qty ) {
            result += "0";
            qty -= 1; // Decrement the counter.
        }

        return result; // Return the final string.
    }


    /**
     * padZero(str, len [, isRight])
     * Pads a string with leading (or trailing) zeros up to a specified length.
     * No padding occurs if the string's length is already sufficient.
     *
     * @param {string|any} str - The string (or value to convert to string) to pad.
     * @param {number} len - The target length of the padded string.
     * @param {boolean} [isRight=false] - If true, pads zeros on the right; otherwise, pads on the left.
     * @returns {string} The padded string.
     */
    function padZero ( str, len, isRight ) {
        if ( str == null ) {
            str = ""; // Ensure str is an empty string if null or undefined.
        }
        str = "" + str; // Coerce to string.

        // Construct the padded string based on `isRight`.
        // repeatZero calculates the necessary padding.
        return ( isRight ? str : "" ) + repeatZero( len - str.length ) + ( isRight ? "" : str );
    }


    /**
     * isArray(array)
     * Checks if the given argument is an array.
     *
     * @param {any} array - The value to check.
     * @returns {boolean} True if the value is an array, false otherwise.
     */
    function isArray ( array ) {
        return Object.prototype.toString.call( array ) === "[object Array]";
    }


    /**
     * isObject(obj)
     * Checks if the given argument is a plain object.
     *
     * @param {any} obj - The value to check.
     * @returns {boolean} True if the value is a plain object, false otherwise.
     */
    function isObject ( obj ) {
        return Object.prototype.toString.call( obj ) === "[object Object]";
    }


    /**
     * findLast(array, callback)
     * Iterates over an array from right to left, returning the first element
     * that satisfies the provided testing function.
     *
     * @param {Array} array - The array to search.
     * @param {Function} callback - The function to execute on each element.
     * @returns {any|undefined} The found element, or undefined if not found.
     */
    function findLast ( array, callback ) {
        var index = array.length; // Start from the end of the array.

        while ( index -= 1 ) { // Decrement index and loop while valid.
            if ( callback( array[ index ] ) ) {
                return array[ index ]; // Return the element if callback returns true.
            }
        }
    }


    /**
     * find(array, callback)
     * Iterates over an array from left to right, returning the first element
     * that satisfies the provided testing function or is strictly equal to `callback`
     * if `callback` is not a function.
     *
     * @param {Array} array - The array to search.
     * @param {Function|any} callback - The function to execute, or a value to match.
     * @returns {any|undefined} The found element, or undefined if not found.
     */
    function find ( array, callback ) {
        var index = 0,
            max = array.length,
            match;

        // If callback is not a function, create a comparison function.
        if ( typeof callback !== "function" ) {
            match = callback;
            callback = function ( item ) {
                return item === match; // Strict equality check.
            };
        }

        while ( index < max ) {
            if ( callback( array[ index ] ) ) {
                return array[ index ]; // Return the element if the condition is met.
            }
            index += 1; // Move to the next element.
        }
    }


    /**
     * each(array, callback)
     * Iterates over an array, executing a callback function for each element.
     * The iteration stops if the callback returns `false`.
     *
     * @param {Array} array - The array to iterate.
     * @param {Function} callback - The function to execute (item, index).
     */
    function each ( array, callback ) {
        var index = 0,
            max = array.length;

        // Exit early if the array is null/undefined or empty.
        if ( !array || !max ) {
            return;
        }

        while ( index < max ) {
            if ( callback( array[ index ], index ) === false ) {
                return; // Stop iteration if callback returns false.
            }
            index += 1; // Increment index.
        }
    }


    /**
     * map(array, callback)
     * Creates a new array with the results of calling a provided function
     * on every element in the calling array.
     *
     * @param {Array} array - The array to map.
     * @param {Function} callback - The function to execute for each element.
     * @returns {Array} A new array with the mapped results.
     */
    function map ( array, callback ) {
        var index = 0,
            max = array.length,
            ret = []; // Initialize the result array.

        // Return empty array if input array is invalid or empty.
        if ( !array || !max ) {
            return ret;
        }

        while ( index < max ) {
            ret[ index ] = callback( array[ index ], index ); // Store the result of the callback.
            index += 1;
        }

        return ret;
    }


    /**
     * pluck(array, prop)
     * Extracts a list of property values from an array of objects.
     *
     * @param {Array<Object>} array - The array of objects.
     * @param {string} prop - The name of the property to extract.
     * @returns {Array} A new array containing the values of the specified property.
     */
    function pluck ( array, prop ) {
        return map( array, function ( item ) {
            return item[ prop ]; // Return the value of the specified property.
        } );
    }


    /**
     * compact(array)
     * Creates a new array with all falsey values removed.
     *
     * @param {Array} array - The array to compact.
     * @returns {Array} A new array with truthy values only.
     */
    function compact ( array ) {
        var ret = []; // Initialize the result array.

        each( array, function ( item ) {
            if ( item ) {
                ret.push( item ); // Add item to result if it's truthy.
            }
        } );

        return ret;
    }


    /**
     * unique(array)
     * Creates a duplicate-free version of an array.
     *
     * @param {Array} array - The array to process.
     * @returns {Array} A new array with unique elements.
     */
    function unique ( array ) {
        var ret = []; // Initialize the result array.

        each( array, function ( _a ) {
            if ( !find( ret, _a ) ) { // If the item is not already in the result array.
                ret.push( _a ); // Add it.
            }
        } );

        return ret;
    }


    /**
     * intersection(a, b)
     * Computes the list of values that are the intersection of two arrays.
     * Each value in the result is present in both arrays.
     *
     * @param {Array} a - The first array.
     * @param {Array} b - The second array.
     * @returns {Array} A new array containing unique common elements.
     */
    function intersection ( a, b ) {
        var ret = []; // Initialize the result array.

        each( a, function ( _a ) {
            each( b, function ( _b ) {
                if ( _a === _b ) { // Check for strict equality.
                    ret.push( _a );
                }
            } );
        } );

        return unique( ret ); // Ensure the result contains only unique elements.
    }


    /**
     * rest(array, callback)
     * Returns the rest of an array's elements after the first element that
     * does NOT satisfy the callback.
     *
     * @param {Array} array - The input array.
     * @param {Function} callback - The predicate function.
     * @returns {Array} The sliced array.
     */
    function rest ( array, callback ) {
        var ret = []; // Initialize the result array.

        each( array, function ( item, index ) {
            if ( !callback( item ) ) { // When the callback returns false (or falsey).
                ret = array.slice( index ); // Slice from this index to the end.
                return false; // Stop iteration.
            }
        } );

        return ret;
    }


    /**
     * initial(array, callback)
     * Returns all but the last element(s) of an array, or all but the last
     * elements that do NOT satisfy the callback.
     *
     * @param {Array} array - The input array.
     * @param {Function} callback - The predicate function.
     * @returns {Array} The sliced array.
     */
    function initial ( array, callback ) {
        // Reverse the array, use `rest`, then reverse back to get the initial part.
        var reversed = array.slice().reverse();

        return rest( reversed, callback ).reverse();
    }


    /**
     * extend(a, b)
     * Copies all enumerable own properties from one or more source objects
     * to a target object. It mutates the target object.
     *
     * @param {Object} a - The target object.
     * @param {Object} b - The source object.
     * @returns {Object} The modified target object.
     */
    function extend ( a, b ) {
        for ( var key in b ) { // Iterate over properties of the source object.
            if ( b.hasOwnProperty( key ) ) { // Ensure it's an own property.
                a[ key ] = b[ key ]; // Copy the property.
            }
        }

        return a;
    }


    // -------------------------------------------------------------------------
    // Moment.js Integration and Error Handling
    // -------------------------------------------------------------------------

    // Declare a variable to hold the Moment.js object.
    var moment;

    // Attempt to load Moment.js if `require` is available (e.g., Node.js environment).
    if ( typeof require === "function" ) {
        try {
            moment = require( 'moment' );
        }
        catch ( e ) {
            // If require fails, `moment` remains undefined.
        }
    }

    // If Moment.js wasn't loaded via `require`, check the global `root` object.
    if ( !moment && root.moment ) {
        moment = root.moment;
    }

    // If Moment.js is still not found, throw an error.
    if ( !moment ) {
        throw "Moment Duration Format cannot find Moment.js";
    }


    // -------------------------------------------------------------------------
    // Main Plugin Functionality: moment.duration.fn.format
    // -------------------------------------------------------------------------

    /**
     * Formats a Moment.js duration object into a human-readable string.
     *
     * @param {string|Function} [template] - The format template string or function.
     * @param {number} [precision] - The number of decimal places for the least-significant token.
     * @param {Object} [settings] - An object containing format settings.
     * @returns {string} The formatted duration string.
     */
    moment.duration.fn.format = function () {

        var tokenizer, // Regular expression for splitting the template into tokens.
            tokens,    // Array of parsed token objects.
            types,     // Array of moment token types (e.g., 'years', 'months').
            typeMap,   // Function to map a token string to its type.
            momentTypes, // Unique moment token types actually present in the template.
            foundFirst,  // Flag to track the first moment token found during output generation.
            trimIndex,   // Not used in final implementation, but kept for consistency.
            args = [].slice.call( arguments ), // Convert arguments object to a real array.
            settings = extend( {}, this.format.defaults ), // Create a mutable copy of default settings.
            remainder = moment.duration( this ); // A copy of the duration to track remaining time for calculations.

        // Add a reference to the original duration object to the settings.
        // This allows template functions to access the duration itself.
        settings.duration = this;

        // Parse and apply arguments: template, precision, and settings object.
        each( args, function ( arg ) {
            if ( typeof arg === "string" || typeof arg === "function" ) {
                settings.template = arg; // Argument is a template string or function.
                return;
            }

            if ( typeof arg === "number" ) {
                settings.precision = arg; // Argument is a numeric precision.
                return;
            }

            if ( isObject( arg ) ) {
                extend( settings, arg ); // Argument is a settings object, merge it.
            }
        } );

        // Ensure 'types' setting is an array, splitting if it's a string.
        types = settings.types = ( isArray( settings.types ) ? settings.types : settings.types.split( " " ) );

        // If the template is a function, execute it to get the actual template string.
        if ( typeof settings.template === "function" ) {
            settings.template = settings.template.apply( settings );
        }

        // Construct the tokenizer regex from the sources of all defined token types.
        tokenizer = new RegExp( map( types, function ( type ) {
            return settings[ type ].source; // Get the regex source for each type.
        } ).join( "|" ), "g" ); // Join them with OR and make it global.

        // Define a function to map a matched token string to its corresponding type.
        typeMap = function ( token ) {
            return find( types, function ( type ) {
                return settings[ type ].test( token ); // Test if the token matches the type's regex.
            } );
        };

        // Tokenize the template string into an array of token objects.
        tokens = map( settings.template.match( tokenizer ), function ( token, index ) {
            var type = typeMap( token ),
                length = token.length;

            return {
                index: index,       // Original index in the template.
                length: length,     // Length of the token string.

                // If it's an escape token, remove the escape characters.
                token: ( type === "escape" ? token.replace( settings.escape, "$1" ) : token ),

                // Set type to null for non-moment tokens (escape, general).
                type: ( ( type === "escape" || type === "general" ) ? null : type )

                // `baseValue` was commented out in original, so keeping it commented.
                // baseValue: ((type === "escape" || type === "general") ? null : this.as(type))
            };
        }, this );

        // Identify unique moment token types present in the template, ordered by descending magnitude.
        momentTypes = intersection( types, unique( compact( pluck( tokens, "type" ) ) ) );

        // If no moment tokens are found in the template, return the raw template string.
        if ( !momentTypes.length ) {
            return pluck( tokens, "token" ).join( "" );
        }

        // ---------------------------------------------------------------------
        // Calculate Values for Each Moment Token
        // ---------------------------------------------------------------------

        // Iterate through each unique moment type found in the template (e.g., years, months, days).
        each( momentTypes, function ( momentType, index ) {
            var value,        // The total value for this momentType (e.g., 2.5 hours).
                wholeValue,   // The integer part of the value (e.g., 2 hours).
                decimalValue, // The fractional part of the value (e.g., 0.5 hours).
                isLeast,      // Is this the least significant moment token in the template?
                isMost;       // Is this the most significant moment token in the template?

            // Calculate the total value for this moment type from the remaining duration.
            value = remainder.as( momentType );
            // Determine the whole (integer) and decimal parts.
            wholeValue = ( value > 0 ? Math.floor( value ) : Math.ceil( value ) );
            decimalValue = value - wholeValue;

            // Flags for identifying the most/least significant tokens.
            isLeast = ( ( index + 1 ) === momentTypes.length ); // True if it's the last type in momentTypes.
            isMost = ( !index ); // True if it's the first type in momentTypes.

            // Update the individual token objects in the 'tokens' array.
            // This loop ensures all occurrences of a momentType get their calculated values.
            each( tokens, function ( token ) {
                if ( token.type === momentType ) {
                    extend( token, {
                        value: value,
                        wholeValue: wholeValue,
                        decimalValue: decimalValue,
                        isLeast: isLeast,
                        isMost: isMost
                    } );

                    // Special handling for the most significant token.
                    if ( isMost ) {
                        // If `forceLength` is not explicitly set and the token's length is > 1,
                        // default `forceLength` to true. This ensures padding for "hh" in "hh:mm".
                        if ( settings.forceLength == null && token.length > 1 ) {
                            settings.forceLength = true;
                        }

                        // Rationale:
                        // "h:mm:ss" for 5 minutes should be "5:00", not "05:00".
                        // "hh:mm:ss" for 5 minutes should be "00:05:00" if trim is false, or "05:00" if trim is true.
                        // The user's template (e.g., "hh") implies a desire for padding.
                    }
                }
            } );

            // Subtract the whole value from the remainder to prepare for the next moment type.
            remainder.subtract( wholeValue, momentType );
        } );

        // ---------------------------------------------------------------------
        // Trim Tokens Array (if 'trim' setting is active)
        // ---------------------------------------------------------------------

        if ( settings.trim ) {
            // Choose `rest` or `initial` based on trim direction.
            tokens = ( settings.trim === "left" ? rest : initial )( tokens, function ( token ) {
                // Keep trimming (return true) if:
                // 1. It's not the least significant moment token (don't trim the last one).
                // 2. It's a moment token AND it has no whole value (i.e., it's zero).
                return !( token.isLeast || ( token.type != null && token.wholeValue ) );
            } );
        }


        // ---------------------------------------------------------------------
        // Build Output String from Processed Tokens
        // ---------------------------------------------------------------------

        // Flag to track if the first moment token has been processed (for padding logic).
        foundFirst = false;

        // If trimming from the right, reverse the tokens array to process from right to left.
        if ( settings.trim === "right" ) {
            tokens.reverse();
        }

        // Map tokens to their final string representations.
        tokens = map( tokens, function ( token ) {
            var val,    // The string representation of the whole value.
                decVal; // The string representation of the decimal value.

            if ( !token.type ) {
                // If it's not a moment token (e.g., separator, escaped text), use its raw text.
                return token.token;
            }

            // Apply negative precision formatting if applicable to the least-significant token.
            // Example: precision -1 on 1234.5 would make it 1230.
            if ( token.isLeast && ( settings.precision < 0 ) ) {
                val = ( Math.floor( token.wholeValue * Math.pow( 10, settings.precision ) ) * Math.pow( 10, -settings.precision ) ).toString();
            } else {
                val = token.wholeValue.toString(); // Convert whole value to string.
            }

            // Remove any negative sign from the beginning of the value string.
            // The overall sign is handled later for the most significant token.
            val = val.replace( /^\-/, "" );

            // Apply token length formatting (padding with zeros).
            // This happens if:
            // 1. The token's original length in the template is > 1 (e.g., "mm").
            // 2. AND (it's the first moment token found, OR it's the most significant token, OR forceLength is true).
            if ( token.length > 1 && ( foundFirst || token.isMost || settings.forceLength ) ) {
                val = padZero( val, token.length );
            }

            // Add decimal value if precision > 0 and it's the least significant token.
            if ( token.isLeast && ( settings.precision > 0 ) ) {
                // Get decimal part, remove sign, split by decimal point or scientific notation.
                decVal = token.decimalValue.toString().replace( /^\-/, "" ).split( /\.|e\-/ );
                switch ( decVal.length ) {
                    case 1: // No decimal point (e.g., "0" for 0.0)
                        val += "." + padZero( decVal[ 0 ], settings.precision, true ).slice( 0, settings.precision );
                        break;

                    case 2: // Standard decimal (e.g., "0.5") -> ["0", "5"]
                        val += "." + padZero( decVal[ 1 ], settings.precision, true ).slice( 0, settings.precision );
                        break;

                    case 3: // Scientific notation (e.g., "5e-3") -> ["5", "", "3"]
                        // Pad with zeros based on exponent.
                        val += "." + padZero( repeatZero( ( +decVal[ 2 ] ) - 1 ) + ( decVal[ 0 ] || "0" ) + decVal[ 1 ], settings.precision, true ).slice( 0, settings.precision );
                        break;

                    default:
                        // Should not happen with typical decimal representations.
                        throw "Moment Duration Format: unable to parse token decimal value.";
                }
            }

            // Add a negative sign if the overall duration value is negative
            // and this is the most significant token.
            if ( token.isMost && token.value < 0 ) {
                val = "-" + val;
            }

            foundFirst = true; // Mark that a moment token has been processed.

            return val; // Return the formatted string for this token.
        } );

        // If tokens were reversed for right-trimming, reverse them back to original order.
        if ( settings.trim === "right" ) {
            tokens.reverse();
        }

        return tokens.join( "" ); // Join all formatted token strings to form the final output.
    };


    // -------------------------------------------------------------------------
    // Default Settings for moment.duration.fn.format
    // -------------------------------------------------------------------------

    moment.duration.fn.format.defaults = {
        // Token Definitions (Regular Expressions)
        // These regexes define how different parts of the template string are recognized.
        escape: /\[(.+?)\]/,      // Matches content inside square brackets, treated as literal text.
        years: /[Yy]+/,          // Matches 'Y' or 'y' for years (e.g., 'Y', 'YY', 'y', 'yyy').
        months: /M+/,             // Matches 'M' for months.
        weeks: /[Ww]+/,          // Matches 'W' or 'w' for weeks.
        days: /[Dd]+/,            // Matches 'D' or 'd' for days.
        hours: /[Hh]+/,          // Matches 'H' or 'h' for hours.
        minutes: /m+/,            // Matches 'm' for minutes.
        seconds: /s+/,            // Matches 's' for seconds.
        milliseconds: /S+/,       // Matches 'S' for milliseconds.
        general: /.+?/,           // Catch-all for any other characters (e.g., separators like ':', ',', ' ').

        // Token Type Names (Order of Descending Magnitude)
        // This array defines the hierarchy of duration units, used for calculations.
        // Can be a space-separated string or an array of strings.
        types: "escape years months weeks days hours minutes seconds milliseconds general",

        // Format Options

        // `trim`: Controls how leading/trailing zero-value tokens are handled.
        // "left": Removes tokens from the left until a non-zero moment token is found.
        // "right": Removes tokens from the right until a non-zero moment token is found.
        //          (The last non-trimmed moment token is never trimmed, even if zero).
        // `false`: No trimming, all tokens are rendered.
        trim: "left",

        // `precision`: Number of decimal places for the least-significant moment token.
        // Positive integer: Number of digits after the decimal point.
        // Negative integer: Number of digits to truncate to zero before the decimal point.
        precision: 0,

        // `forceLength`: If `true`, forces the first moment token with a value to render
        // at its full template length, even if `trim` is active and its length is 1.
        // If `null`, it defaults to `true` if the most significant token in the template
        // has a length > 1 (e.g., "hh").
        forceLength: null,

        // `template`: The string or function used to format the duration.
        // If a function, it's executed with `this` bound to the `settings` object,
        // allowing dynamic template generation based on `this.duration` or other settings.
        template: function () {
            var types = this.types,      // Get the configured types array.
                dur = this.duration,     // Access the duration object.
                // Find the least significant moment type that actually has a value in the duration.
                lastType = findLast( types, function ( type ) {
                    // Check if the duration's internal data for this type is non-zero.
                    return dur._data[ type ];
                } );

            // Provide default template strings based on the most significant non-zero duration unit.
            switch ( lastType ) {
                case "seconds":
                    return "h:mm:ss"; // e.g., "1:05:30"
                case "minutes":
                    return "d[d] h:mm"; // e.g., "1d 2:05"
                case "hours":
                    return "d[d] h[h]"; // e.g., "1d 2h"
                case "days":
                    return "M[m] d[d]"; // e.g., "1m 2d"
                case "weeks":
                    return "y[y] w[w]"; // e.g., "1y 2w"
                case "months":
                    return "y[y] M[m]"; // e.g., "1y 2m"
                case "years":
                    return "y[y]";      // e.g., "1y"
                default:
                    // Fallback for durations with multiple units or very small units.
                    return "y[y] M[m] d[d] h:mm:ss";
            }
        }
    };

} )( this ); // Pass `this` (global object) to the IIFE.