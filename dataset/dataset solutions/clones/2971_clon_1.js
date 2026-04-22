/*
 * This file contains utility functions for competitive programming,
 * including input/output handling, type conversions, and a main
 * function for problem-specific logic.
 *
 * All original logic, variable names, function names, and operators
 * have been preserved exactly as in the source code.
 * Only whitespace and comments have been altered to create a Type I clone.
 */

//  Initialize readline interface for standard input/output operations.
var read = require('readline') .createInterface( {
    input   :   process.stdin,
    output  :   process.stdout
} ) ;

//  Global variables to store parsed input and temporary line data.
var obj ;
var inLine = [ ] ;

//  Event listener: When a line of input is received, add it to the 'inLine' array.
read .on( 'line' , function ( input ) {
    inLine .push( input ) ;
} ) ;

//  Event listener: When the input stream closes, process the collected lines.
read .on( 'close' , function ( ) {

    //  Initialize the object for custom input parsing.
    obj = init( inLine ) ;

    //  Output a blank line to standard error for visual separation.
    console .error( "\n" ) ;

    //  Record the start time for performance measurement.
    var start = Date .now( ) ;

    //  Execute the main problem-solving logic.
    Main( ) ;

    //  Calculate the elapsed time.
    var end = Date .now( ) - start ;

    //  Output execution time to standard error.
    myerr( "time : " + ( end ) + "ms" ) ;

    //  Output memory usage to standard error.
    myerr( "memory : " + Math .round( process .memoryUsage( ) .heapTotal / 1024 ) + "KB" ) ;

} ) ;


/**
 * Creates a deep clone of a given object using JSON serialization/deserialization.
 * Note: This method has limitations (e.g., cannot clone functions, Dates, RegExps).
 * @param {object} obj - The object to clone.
 * @returns {object} A deep clone of the input object.
 */
function makeClone ( obj ) {
    return JSON .parse( JSON .stringify( obj ) ) ;
}

/**
 * Reads the next token from input and converts it to an integer.
 * @returns {number} The next integer from input.
 */
function nextInt ( ) { return myconv( next( ) , 1 ) ; }

/**
 * Reads the next token from input and converts it to a string array (split by space).
 * @returns {string[]} An array of strings.
 */
function nextStrArray ( ) { return myconv( next( ) , 2 ) ; }

/**
 * Reads the next token from input and converts it to an integer array (split by space).
 * @returns {number[]} An array of numbers.
 */
function nextIntArray ( ) { return myconv( next( ) , 4 ) ; }

/**
 * Reads the next token from input and converts it to a character array.
 * @returns {string[]} An array of characters.
 */
function nextCharArray ( ) { return myconv( next( ) , 6 ) ; }

/**
 * Retrieves the next line/token from the input buffer.
 * @returns {string} The next input token.
 */
function next ( ) { return obj .next( ) ; }

/**
 * Checks if there are more tokens available in the input buffer.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasNext ( ) { return obj .hasNext( ) ; }


/**
 * Initializes an object to manage input lines, providing methods to check for
 * more input and retrieve the next line.
 * @param {string[]} input - An array of strings representing input lines.
 * @returns {object} An object with 'hasNext' and 'next' methods.
 */
function init ( input ) {

    var returnObj = {
        list    :   input,
        index   :   0,
        max     :   input .length,

        //  Checks if there are more lines to read.
        hasNext :   function ( ) {
            return ( this .index < this .max ) ;
        },

        //  Retrieves the next line from the input list.
        next    :   function ( ) {
            if ( !this .hasNext( ) ) {
                //  Throw an error if no more input is available.
                throw "ArrayIndexOutOfBoundsException これ以上ないよ" ;
            } else {
                //  Get the current line, increment index, and return.
                var returnInput = this .list[ this .index ] ;
                this .index ++ ;
                return returnInput ;
            }
        }
    } ;

    return returnObj ;

}

/**
 * Prints a string to standard output, followed by a newline.
 * @param {string} s - The string to print.
 */
function myout ( s ) {
    console .log( s ) ;
}

/**
 * Prints a debug message to standard error, inspecting objects for detailed output.
 * @param {*} s - The value to inspect and print.
 */
function myerr ( s ) {
    console .error( "debug:" + require( "util" ) .inspect( s , false , null ) ) ;
}

/**
 * Converts input 'i' based on the specified conversion 'no'.
 * Handles various parsing and joining operations.
 *
 * Conversion types for 'no':
 *   1: Convert to integer.
 *   2: Split string by space into an array of strings.
 *   4: Split string by space into an array of numbers.
 *   6: Split string into a character array.
 *   7: Split string into an array of single-digit numbers.
 *   8: Join array elements with a space.
 *   9: Join array elements with a newline.
 *   0: Join array elements without any separator.
 *   Default/Error: Return input 'i' as is.
 *
 * @param {*} i - The input value to convert.
 * @param {number} no - The conversion type.
 * @returns {*} The converted value.
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1:
                return parseInt( i ) ;
            case 2:
                return i .split( " " ) ;
            case 4:
                return i .split( " " ) .map( Number ) ;
            case 6:
                return i .split( "" ) ;
            case 7:
                return i .split( "" ) .map( Number ) ;
            case 8:
                return i .join( " " ) ;
            case 9:
                return i .join( "\n" ) ;
            case 0:
                return i .join( "" ) ;
            default:
                return i ;
        }
    } catch ( e ) {
        //  If any error occurs during conversion, return the original input.
        return i ;
    }
}

/**
 * Main function containing the problem-specific logic.
 * Reads two integers M and K, then generates a specific sequence based on their values.
 */
function Main ( ) {

    // Read the first line of input, expected to be two integers.
    var one = nextIntArray( ) ;

    // Destructure the input into M and K.
    var M = one[ 0 ] ;
    var K = one[ 1 ] ;

    // Check if K is within the valid range [0, 2^M - 1].
    if ( K >= 0 && K < Math .pow( 2 , M ) ) {

        // Special case for M = 1.
        if ( M == 1 ) {

            if ( K == 0 ) {
                // If M=1 and K=0, output "0 0 1 1".
                myout( "0 0 1 1" ) ;
            } else {
                // If M=1 and K=1, output -1 (no valid sequence).
                myout( -1 ) ;
            }
            // Exit the function after handling M=1.
            return ;
        }

        // Handle the case where K = 0.
        if ( K == 0 ) {

            // Create an array to store the output sequence.
            // The length is 2 * 2^M, as each number from 0 to 2^M-1 appears twice.
            var output = new Array( Math .pow( 2 , M + 1 ) ) ;

            // Populate the output array: each number 'i' appears twice consecutively.
            for ( var i = 0 ; i < Math .pow( 2 , M ) ; i ++ ) {
                output[ i * 2 ] = i ;
                output[ i * 2 + 1 ] = i ;
            }

            // Output the sequence, joined by spaces.
            myout( myconv( output , 8 ) ) ;

        } else {
            // Handle the general case where K > 0.

            // Initialize the output sequence with K and 0.
            var output = [ K , 0 ] ;

            // Add numbers from 1 to (2^M - 1), excluding K.
            for ( var i = 1 ; i <= Math .pow( 2 , M ) - 1 ; i ++ ) {
                if ( i != K ) {
                    output .push( i ) ;
                }
            }

            // Add K again.
            output .push( K ) ;

            // Add numbers from (2^M - 1) down to 1, excluding K.
            for ( var i = Math .pow( 2 , M ) - 1 ; i > 0 ; i -- ) {
                if ( i != K ) {
                    output .push( i ) ;
                }
            }

            // Add 0 at the end.
            output .push( 0 ) ;

            // Output the complete sequence, joined by spaces.
            myout( myconv( output , 8 ) ) ;
        }

    } else {
        // If K is out of the valid range, output -1.
        myout( -1 ) ;
    }
}