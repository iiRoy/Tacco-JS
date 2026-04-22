var GET = ( function ( ) {
    // This is an IIFE (Immediately Invoked Function Expression)
    // designed to create a flexible input parsing utility.

    /**
     * Factory function to create a new parser instance.
     * @param {string} s - The raw input string to be parsed.
     * @returns {g} A new parser object.
     */
    function f ( s ) {
        return new g( s );
    }

    /**
     * Constructor for the parser object.
     * @param {string} s - The input string.
     */
    function g ( s ) {
        // Trim whitespace from the input string and split it into an array of lines.
        this._s = s . trim( ) . split( "\n" );
        // Initialize the current line index to 0.
        this._y = 0;
    }

    /**
     * Reads a single "atom" or token from the current line.
     * If 'f' is true, returns the token as a string; otherwise, as a number.
     * @param {boolean} f - Flag to determine return type (true for string, false for number).
     * @returns {string|number} The parsed token.
     */
    g.prototype.a = function ( f ) {
        var s = this._s,
            y = this._y,
            r; // Declare 'r' to hold the result.

        // If the current line hasn't been processed into tokens yet (it's still a single string),
        // split it by spaces and reverse the order. Reversing allows efficient `pop()` from the end.
        if ( typeof s[ y ] === "string" ) {
            s[ y ] = s[ y ] . split( " " ) . reverse( );
        }

        // Extract the last token from the current line's array.
        r = s[ y ] . pop( );

        // If the current line is now empty after popping, advance to the next line.
        if ( ! s[ y ] . length ) {
            this._y++;
        }

        // Return the token, converting to a number if 'f' is false.
        return f ? r : + r;
    };

    /**
     * Reads an entire line of tokens.
     * If 'f' is true, returns tokens as strings; otherwise, as numbers.
     * @param {boolean} f - Flag for return type.
     * @returns {Array<string|number>} An array of parsed tokens from the line.
     */
    g.prototype.l = function ( f ) {
        // Get the current line, split it by spaces, and then increment the line index.
        var s = this._s[ this._y++ ] . split( " " );
        // Return the tokens, mapping to numbers if 'f' is false.
        return f ? s : s . map( a => + a );
    };

    /**
     * Reads 'n' lines, treating each as a row of space-separated tokens (a matrix).
     * If 'f' is true, returns a 2D array of strings; otherwise, a 2D array of numbers.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - Flag for return type.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    g.prototype.m = function ( n, f ) {
        // Slice 'n' lines from the input, advancing the line index by 'n'.
        // Each sliced line is then mapped to an array of its space-separated tokens.
        var r = this._s . slice( this._y, this._y += n ) . map( a => a . split( " " ) );
        // Return the result, converting to numbers if 'f' is false.
        return f ? r : r . map( a => a . map( a => + a ) );
    };

    /**
     * Reads 'n' raw lines without splitting them into tokens.
     * If 'f' is true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - Flag for return type.
     * @returns {Array<string|number>} An array of raw lines.
     */
    g.prototype.r = function ( n, f ) {
        // Slice 'n' lines from the input, advancing the line index by 'n'.
        var r = this._s . slice( this._y, this._y += n );
        // Return the result, converting to numbers if 'f' is false.
        return f ? r : r . map( a => + a );
    };

    // The IIFE returns the 'f' function, which is the public interface for creating parsers.
    return f;

} ) ( ); // End of GET IIFE

// Initialize the input parser 'o' by reading the entire content of /dev/stdin.
// This assumes the script is run in an environment where 'require("fs")' is available (e.g., Node.js).
var o = GET( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) );

/**
 * Creates a multi-dimensional array filled with a specified value.
 * The dimensions are provided as additional arguments.
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with 0s.
 * @param {*} v - The value to fill the array with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments,
        l = a . length,
        r = "Array(a[" + --l + "]).fill(v)"; // Start with the innermost array dimension.

    // Dynamically construct the JavaScript code string to create the nested arrays.
    while ( --l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create and return the array.
    // Use of eval is generally discouraged for security and performance reasons,
    // but it's part of the original code's logic.
    return eval( r );
}

// Execute the main function and print its return value to the console.
console . log( main( ) );

/**
 * The main function containing the core logic of the program.
 * This typically solves a specific problem based on input data.
 * @returns {number} The final calculated answer.
 */
function main ( ) {
    // Read the number of events (N) and the number of channels (C) from input.
    var N = o . a( );
    var C = o . a( );

    // Initialize an array of arrays, 'c', to store events per channel.
    // Each element `c[i]` will be an array of events for channel `i`.
    var c = Array( C ) . fill( 0 ) . map( a => [ ] );

    // Initialize `tmax` to keep track of the maximum end time across all events.
    var tmax = 0;

    // Loop N times to read each event.
    for ( var i = 0; i < N; i++ ) {
        // Read an event: `t` will be an array like [start_time, end_time, channel_id].
        var t = o . l( );

        // Store the event's start and end times in the corresponding channel.
        // Channel IDs are 1-indexed in the input, so subtract 1 for 0-indexed array access.
        c[ t[ 2 ] - 1 ] . push( [ t[ 0 ], t[ 1 ] ] );

        // Update `tmax` if the current event's end time is greater.
        if ( tmax < t[ 1 ] ) {
            tmax = t[ 1 ];
        }
    }

    // Initialize two arrays, 'a' and 'b', to store event start and end points for processing.
    var a = [ ],
        b = [ ];

    // Process each channel to merge overlapping events and populate 'a' and 'b'.
    for ( i = 0; i < C; i++ ) {
        // Sort events within the current channel by their start times.
        c[ i ] . sort( ( a, b ) => a[ 0 ] - b[ 0 ] );

        // Get the number of events in the current channel.
        var l = c[ i ] . length;

        // Iterate through the sorted events of the current channel.
        for ( var j = 0; j < l; j++ ) {
            // Add the adjusted start time (start_time - 1) to array 'a'.
            // This adjustment might be for 0-indexed time slots or interval representation.
            a . push( c[ i ][ j ][ 0 ] - 1 );

            // Merge overlapping or adjacent events within the same channel.
            // If the current event's end time + 1 is greater than or equal to
            // the next event's start time, they can be considered contiguous.
            while ( j + 1 < l && c[ i ][ j ][ 1 ] + 1 >= c[ i ][ j + 1 ][ 0 ] ) {
                j++; // Advance 'j' to effectively merge the current event with the next.
            }

            // Add the (potentially merged) end time to array 'b'.
            b . push( c[ i ][ j ][ 1 ] );
        }
    }

    // Sort all collected start times in ascending order.
    a . sort( ( a, b ) => a - b );

    // Sort all collected end times in ascending order.
    b . sort( ( a, b ) => a - b );

    // Initialize pointers for arrays 'a' and 'b'.
    var an = 0, // Pointer for array 'a' (start times).
        bn = 0; // Pointer for array 'b' (end times).

    // Initialize 'ans' to store the maximum concurrent events found,
    // and 'v' to store the current count of active events.
    var ans = 0,
        v = 0;

    // Iterate through time slots from 0 up to the maximum observed end time (`tmax`).
    for ( i = 0; i <= tmax; i++ ) {
        // Process all events that *end* at the current time `i`.
        // Decrement the count of active events `v` for each ending event.
        while ( b[ bn ] === i ) {
            v--;
            bn++;
        }

        // Process all events that *start* at the current time `i`.
        // Increment the count of active events `v` for each starting event.
        while ( a[ an ] === i ) {
            v++;
            an++;
        }

        // Update the maximum concurrent events (`ans`) if the current count (`v`) is higher.
        if ( ans < v ) {
            ans = v;
        }
    }

    // Return the final maximum number of concurrent events found.
    return ans;

} // End of main function