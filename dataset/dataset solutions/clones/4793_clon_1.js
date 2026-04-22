/*
 * This file contains a JavaScript program that processes input
 * and performs a specific calculation. It includes utility functions
 * for input parsing and output formatting.
 *
 * This section handles the setup for reading input from stdin
 * and writing output to stdout using the 'readline' module.
 */
var read = require ( 'readline' ) . createInterface ( {
    input  : process . stdin ,
    output : process . stdout
} ) ;

var obj ; // Object to manage input stream.
var inLine = [ ] ; // Array to store all input lines.

// Event handler for each line of input received.
read . on ( 'line' , function ( input ) {
    inLine . push ( input ) ;
} ) ;

/**
 * Event handler for when the input stream 'close' event is emitted.
 * This signifies that all input has been received.
 */
read . on ( 'close' , function ( ) {
    obj = init ( inLine ) ; // Initialize the input manager with collected lines.
    console . error ( '\n↑入力 ↓出力' ) ; // Debug message indicating I/O direction.
    Main ( ) ; // Execute the main program logic.
} ) ;

/**
 * Creates a deep clone of an object.
 * Handles Set objects specifically, otherwise uses JSON serialization for deep cloning.
 *
 * @param {object} obj - The object to be cloned.
 * @returns {object} A deep copy of the input object.
 */
function makeClone ( obj ) {
    return ( obj instanceof Set )
        ? new Set ( Array . from ( obj ) )
        : JSON . parse ( JSON . stringify ( obj ) ) ;
}

/**
 * Retrieves and parses the next integer from the input stream.
 * Uses the 'myconv' utility function for type conversion.
 *
 * @returns {number} The next integer from input.
 */
function nextInt ( ) {
    return myconv ( next ( ) , 1 ) ;
}

/**
 * Retrieves the next line from input and splits it into an array of strings.
 *
 * @returns {Array<string>} An array of strings.
 */
function nextStrArray ( ) {
    return myconv ( next ( ) , 2 ) ;
}

/**
 * Retrieves the next line from input, splits it by spaces, and converts parts to numbers.
 *
 * @returns {Array<number>} An array of integers.
 */
function nextIntArray ( ) {
    return myconv ( next ( ) , 4 ) ;
}

/**
 * Retrieves the next line from input and splits it into an array of individual characters.
 *
 * @returns {Array<string>} An array of characters.
 */
function nextCharArray ( ) {
    return myconv ( next ( ) , 6 ) ;
}

/**
 * Advances the internal input pointer and returns the current input line.
 *
 * @returns {string} The next line from the input.
 */
function next ( ) {
    return obj . next ( ) ;
}

/**
 * Checks if there are more lines available in the input stream.
 *
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasNext ( ) {
    return obj . hasNext ( ) ;
}

/**
 * Initializes an input manager object with an array of input lines.
 * Provides methods to check for more input and retrieve the next line.
 *
 * @param {Array<string>} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with 'list', 'index', 'max', 'hasNext', and 'next' properties.
 */
function init ( input ) {
    return {
        list  : input ,
        index : 0 ,
        max   : input . length ,

        /**
         * Checks if the current index is within the bounds of the input list.
         *
         * @returns {boolean} True if there is more input, false otherwise.
         */
        hasNext : function ( ) {
            return ( this . index < this . max ) ;
        } ,

        /**
         * Retrieves the next line from the input list and increments the index.
         * Throws an error if no more input is available.
         *
         * @returns {string} The next line of input.
         * @throws {string} 'ArrayIndexOutOfBoundsException ‚There is no more input'
         *                  if the end of input is reached.
         */
        next : function ( ) {
            if ( this . hasNext ( ) ) {
                return this . list [ this . index ++ ] ;
            } else {
                throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ;
            }
        }
    } ;
}

/**
 * Prints a given string to the console, followed by a newline.
 * This is the primary function for program output.
 *
 * @param {string} s - The string to be printed.
 */
function myout ( s ) {
    console . log ( s ) ;
}

/**
 * Prints debug information to the standard error stream.
 * Uses Node.js 'util.inspect' for detailed object inspection.
 *
 * @param {any} s - The data to be debugged.
 */
function myerr ( s ) {
    console . error ( 'debug:' + require ( 'util' ) . inspect ( s , false , null ) ) ;
}

/**
 * A versatile conversion function that transforms input 'i' based on the 'no' parameter.
 *
 * @param {any} i - The input value to be converted.
 * @param {number} no - A numerical code specifying the desired conversion type:
 *   - 1: Parses 'i' as an integer.
 *   - 2: Splits string 'i' by spaces into an array of strings.
 *   - 4: Splits string 'i' by spaces and maps each part to a number.
 *   - 6: Splits string 'i' into an array of individual characters.
 *   - 7: Splits string 'i' into characters and maps each to a number.
 *   - 8: Joins array 'i' elements with spaces.
 *   - 9: Joins array 'i' elements with newlines.
 *   - 0: Joins array 'i' elements without any separator.
 *   - Default: Returns 'i' unchanged if 'no' is unknown or an error occurs.
 * @returns {any} The converted value, or the original 'i' if conversion fails or 'no' is invalid.
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1 :
                return parseInt ( i ) ;
            case 2 :
                return i . split ( ' ' ) ;
            case 4 :
                return i . split ( ' ' ) . map ( Number ) ;
            case 6 :
                return i . split ( '' ) ;
            case 7 :
                return i . split ( '' ) . map ( Number ) ;
            case 8 :
                return i . join ( ' ' ) ;
            case 9 :
                return i . join ( '\n' ) ;
            case 0 :
                return i . join ( '' ) ;
            default :
                return i ;
        }
    } catch ( e ) {
        // If any error occurs during conversion, return the original input.
        return i ;
    }
}

// End of utility and boilerplate functions.
// --------------------------------------------------------------------------------

/**
 * The Main function contains the primary logic of the program.
 * It reads an array of integers, performs calculations based on these values,
 * and outputs the maximum of two derived results plus an offset.
 */
function Main ( ) {
    // Read the first line of input as an array of integers.
    var one = nextIntArray ( ) ;

    // Assign individual integer values from the 'one' array to distinct variables.
    var ai = one [ 0 ] ;
    var ao = one [ 1 ] ;
    var at = one [ 2 ] ;
    var aj = one [ 3 ] ;
    var al = one [ 4 ] ;
    var as = one [ 5 ] ;
    var az = one [ 6 ] ;

    // Calculate 'output1' based on specific floor divisions and multiplications.
    // This calculation involves 'ai', 'aj', and 'al'.
    var output1 = Math . floor ( ai / 2 ) * 2
                + Math . floor ( aj / 2 ) * 2
                + Math . floor ( al / 2 ) * 2 ;

    // Calculate 'output2' using a slightly modified formula for 'ai', 'aj', and 'al',
    // which includes subtracting 1 before division, and adding a constant 6 at the end.
    var output2 = Math . floor ( ( ai - 1 ) / 2 ) * 2
                + Math . floor ( ( aj - 1 ) / 2 ) * 2
                + Math . floor ( ( al - 1 ) / 2 ) * 2
                + 6 ;

    // Determine the maximum value between 'output1' and 'output2',
    // then add 'ao' to this maximum, and finally print the result to the console.
    myout ( Math . max ( output1 , output2 ) + ao ) ;
}