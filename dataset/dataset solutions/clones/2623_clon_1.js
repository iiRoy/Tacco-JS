/*
 This is a Type I clone of the original JavaScript code.
 The content, structure, and logic are identical.
 Only whitespace and comments have been altered significantly
 to produce a visually distinct but functionally equivalent version.
 */

// Module imports and setup for standard input/output handling.
// This section prepares the environment for reading user input.
var read = require('readline').createInterface({

    input : process.stdin,
    output: process.stdout

});

// Global variables for input processing.
var obj;
var inLine = [ ]; // Array to store each line of input.

// Event listener: When a line is received from standard input, add it to 'inLine'.
read.on( 'line', function( input ) {

    inLine.push( input );

});

/*
 Event listener: When the input stream is closed,
 initialize the input object, display a debug message,
 and then execute the main logic of the program.
 */
read.on( 'close', function() {

    obj = init( inLine ); // Initialize the custom input object.

    console.error( '\n↑入力 ↓出力' ); // Debug message indicating input/output direction.

    Main( ); // Call the primary function of the application.
});

/**
 * Creates a deep clone of an object.
 * Handles Set objects specifically, otherwise uses JSON serialization for deep cloning.
 * @param {any} obj - The object to be cloned.
 * @returns {any} A deep clone of the input object.
 */
function makeClone( obj ) {

    return ( obj instanceof Set )
        ? new Set( Array.from( obj ) )
        : JSON.parse( JSON.stringify( obj ) );

}

// Helper functions for reading various types of input from the custom 'obj' input stream.

function nextInt( ) { return myconv( next( ), 1 ); }

function nextStrArray( ) { return myconv( next( ), 2 ); }

function nextIntArray( ) { return myconv( next( ), 4 ); }

function nextCharArray( ) { return myconv( next( ), 6 ); }

function next( ) { return obj.next( ); }

function hasNext( ) { return obj.hasNext( ); }


/**
 * Initializes a custom input object to manage reading lines from an array.
 * This object provides methods to check for available input and retrieve the next line.
 * @param {string[]} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with `list`, `index`, `max`, `hasNext`, and `next` properties.
 */
function init( input ) {

    return {
        list : input,
        index : 0,
        max : input.length,

        hasNext : function( ) {
            return ( this.index < this.max );
        },

        next : function( ) {
            if ( this.hasNext( ) ) {
                return this.list[ this.index++ ];
            } else {
                throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
            }
        }
    };

}

/**
 * Outputs a given value to the console, followed by a newline.
 * This is a wrapper for `console.log`.
 * @param {any} s - The value to be printed.
 */
function myout( s ) {

    console.log( s );

}

/**
 * Outputs a debug message to the standard error stream.
 * It uses `util.inspect` for detailed object inspection.
 * @param {any} s - The value to be inspected and printed as a debug message.
 */
function myerr( s ) {

    console.error( 'debug:' + require( 'util' ).inspect( s, false, null ) );

}

/*
 The 'no' parameter in 'myconv' dictates the conversion type:
 1: Parses string to integer.
 2: Splits string by space.
 4: Splits string by space and converts parts to numbers.
 6: Splits string into an array of characters.
 7: Splits string into characters and converts each to a number.
 8: Joins array elements with spaces.
 9: Joins array elements with newlines.
 0: Joins array elements without any separator.
 Default: Returns input as is.
 */
function myconv( i, no ) {

    try {
        switch ( no ) {
            case 1:
                return parseInt( i );
            case 2:
                return i.split( ' ' );
            case 4:
                return i.split( ' ' ).map( Number );
            case 6:
                return i.split( '' );
            case 7:
                return i.split( '' ).map( Number );
            case 8:
                return i.join( ' ' );
            case 9:
                return i.join( '\n' );
            case 0:
                return i.join( '' );
            default:
                return i;
        }
    } catch ( e ) {
        return i; // In case of conversion error, return the original input.
    }

}

// End of utility functions and setup.
// The main program logic begins here.

/**
 * The primary function where the main program execution resides.
 * It reads an integer N, then iterates through pairs (i, j)
 * where 0 <= i < j < N. For each pair, it calculates the positions
 * where their binary representations differ and prints these positions.
 */
function Main( ) {

    var N = nextInt( ); // Read the integer N from input.

    // Outer loop: iterates from i = 0 up to N - 2.
    for ( var i = 0; i < N - 1; i++ ) {

        // Inner loop: iterates from j = i + 1 up to N - 1.
        for ( var j = i + 1; j < N; j++ ) {

            var output = [ ]; // Initialize an empty array to store differing bit positions.

            // Innermost loop: checks bits from 0 to 9 (representing positions 1 to 10).
            for ( var k = 0; k < 10; k++ ) {

                // Check if the k-th bit of i is different from the k-th bit of j.
                // (i >> k & 1) extracts the k-th bit of i.
                // (j >> k & 1) extracts the k-th bit of j.
                if ( ( ( i >> k ) & 1 ) != ( ( j >> k ) & 1 ) ) {

                    output.push( k + 1 ); // If bits differ, add the 1-based position to output.

                }

            }

            // Convert the array of differing positions into a space-separated string and print it.
            myout( myconv( output, 8 ) );

        }

    }

}