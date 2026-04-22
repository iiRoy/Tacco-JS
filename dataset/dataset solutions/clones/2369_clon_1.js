/*
 * This section contains utility functions for input/output and
 * general helper operations. It's typically boilerplate for competitive programming.
 * No need to deeply analyze this part for the main logic.
 */
// Initialize a readline interface for standard input and output processing.
var read = require ( 'readline' ) .createInterface ( {
      input  : process.stdin      // Standard input stream
    , output : process.stdout     // Standard output stream
} ) ;


// Declare global variables for storing the processed input object
// and an array to accumulate raw input lines.
var obj ;
var inLine = [ ] ;


// Attach an event listener to the 'line' event of the readline interface.
// This function is executed every time a new line of input is received.
read .on ( 'line' , function ( input ) {
    inLine .push ( input ) ; // Add the received line to the 'inLine' array.
} ) ;


// Attach an event listener to the 'close' event of the readline interface.
// This function runs once all input has been received and the stream is closed.
read .on ( 'close' , function ( ) {
    // Initialize the input object using the collected lines.
    obj = init ( inLine ) ;

    // Output a blank line to standard error for better visual separation
    // in the console, useful for debugging output.
    console .error ( '\n' ) ;

    // Record the current time to measure the execution duration of the main logic.
    var start = Date .now ( ) ;

    // Execute the primary function containing the core logic of the program.
    Main ( ) ;

    // Calculate the total time taken for the 'Main' function to complete.
    var end = Date .now ( ) - start ;

    // Report the execution time to standard error using a custom error logging function.
    myerr ( 'time : ' + end + 'ms' ) ;

    // Report the memory usage (heapTotal) in kilobytes to standard error.
    myerr ( 'memory : ' + Math .round ( process .memoryUsage ( ) .heapTotal / 1024 ) + 'KB' ) ;
} ) ;


/**
 * Creates a deep clone of an object.
 * It specifically handles Set objects by creating a new Set from its elements.
 * For other types of objects, it uses JSON serialization and deserialization
 * as a common method for deep cloning (with limitations like functions, dates, etc.,
 * but sufficient for simple data structures).
 *
 * @param {any} obj - The object to be cloned.
 * @returns {any} A deep copy of the input object.
 */
function makeClone ( obj ) {
    return ( obj instanceof Set )
        ? new Set ( Array .from ( obj ) )                  // Clone a Set
        : JSON .parse ( JSON .stringify ( obj ) )          // Deep clone using JSON for other objects
    ;
}


// --- Input parsing helper functions ---
// These functions provide convenient ways to read and convert different types of input.


/**
 * Reads the next available input token and attempts to parse it as an integer.
 *
 * @returns {number} The parsed integer value.
 */
function nextInt ( ) {
    return myconv ( next ( ) , 1 ) ;
}


/**
 * Reads the next input token and splits it into an array of strings,
 * typically using space as a delimiter.
 *
 * @returns {string[]} An array of strings.
 */
function nextStrArray ( ) {
    return myconv ( next ( ) , 2 ) ;
}


/**
 * Reads the next input token, splits it by space, and then converts each part
 * into a number, returning an array of integers.
 *
 * @returns {number[]} An array of integers.
 */
function nextIntArray ( ) {
    return myconv ( next ( ) , 4 ) ;
}


/**
 * Reads the next input token and splits it into an array of individual characters.
 *
 * @returns {string[]} An array of characters.
 */
function nextCharArray ( ) {
    return myconv ( next ( ) , 6 ) ;
}


/**
 * Retrieves the next token (line) from the globally managed input object.
 *
 * @returns {string} The next line/token from the input.
 */
function next ( ) {
    return obj .next ( ) ;
}


/**
 * Checks if there are more tokens (lines) available in the input stream.
 *
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasNext ( ) {
    return obj .hasNext ( ) ;
}


/**
 * Initializes and returns an input reader object.
 * This object manages the input lines, keeps track of the current position,
 * and provides methods to check for available input and retrieve the next line.
 *
 * @param {string[]} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with `list`, `index`, `max`, `hasNext`, and `next` properties.
 */
function init ( input ) {
    return {
          list    : input               // The array holding all input lines.
        , index   : 0                   // The current position (index) in the input array.
        , max     : input .length       // The total number of input lines.

        // Method to check if there are more lines to read.
        , hasNext : function ( ) {
            return ( this .index < this .max ) ;
        }

        // Method to get the next line of input. Throws an error if no more input.
        , next : function ( ) {
            if ( this .hasNext ( ) ) {
                return this .list [ this .index ++ ] ;
            } else {
                throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ;
            }
        }
    } ;
}


/**
 * Prints a given string or value to the standard output, followed by a newline.
 * This is a wrapper for `console.log`.
 *
 * @param {any} s - The value to be printed.
 */
function myout ( s ) {
    console .log ( s ) ;
}


/**
 * Prints a debug message to the standard error stream.
 * It uses Node.js's `util.inspect` to provide a detailed, formatted string
 * representation of the input value, which is particularly useful for objects.
 *
 * @param {any} s - The value (e.g., string, object, array) to output for debugging.
 */
function myerr ( s ) {
    console .error (
          'debug:'
        + require ( 'util' ) .inspect ( s , false , null )
    ) ;
}


/*
 * A versatile helper function for converting input data `i` based on a numerical code `no`.
 * It handles various common parsing and joining operations for competitive programming inputs.
 *
 * The `no` parameter dictates the conversion type:
 *  - Default / unknown / outlier: Returns `i` as is.
 *  - 1: Parses `i` as an integer using `parseInt()`.
 *  - 2: Splits string `i` by space (' ') into an array of strings.
 *  - 4: Splits string `i` by space (' ') and then maps each resulting string to a Number.
 *  - 6: Splits string `i` into an array of individual characters.
 *  - 7: Splits string `i` into characters and then maps each character to a Number.
 *  - 8: Joins elements of array `i` with a space (' ').
 *  - 9: Joins elements of array `i` with a newline character ('\n').
 *  - 0: Joins elements of array `i` with no separator (concatenates them).
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1:
                return parseInt ( i ) ;
            case 2:
                return i .split ( ' ' ) ;
            case 4:
                return i .split ( ' ' ) .map ( Number ) ;
            case 6:
                return i .split ( '' ) ;
            case 7:
                return i .split ( '' ) .map ( Number ) ;
            case 8:
                return i .join ( ' ' ) ;
            case 9:
                return i .join ( '\n' ) ;
            case 0:
                return i .join ( '' ) ;
            default:
                return i ;
        }
    }
    catch ( e ) {
        // In case of any conversion error, return the original input `i`.
        return i ;
    }
}


// --- End of Utility Functions ---
// --------------------------------------------------------------------------


/**
 * The Main function contains the primary logic of the program.
 * It reads an integer N and performs calculations to determine an output (0 or 1)
 * based on N's value and its components.
 */
function Main ( ) {
    // Read the input integer N using the helper function.
    var N = nextInt ( ) ;

    // Calculate the 'hundreds' part of N (e.g., if N=345, h=3).
    var h = Math .floor ( N / 100 ) ;

    // Calculate the remainder when N is divided by 100 (e.g., if N=345, a=45).
    var a = N % 100 ;

    // Check if N is less than 100.
    // If true, output 0 and exit the function early.
    if ( N < 100 ) {
        myout ( 0 ) ;
        return ;
    }

    // Check if the remainder 'a' is not equal to zero.
    if ( a != 0 ) {
        // If 'a' is not zero, calculate 'req' by dividing 'a' by 5 and rounding up.
        // This represents a requirement or a threshold.
        var req = Math .ceil ( a / 5 ) ;

        // Compare 'h' (hundreds part) with 'req'.
        // If 'h' is greater than or equal to 'req', output 1.
        if ( h >= req ) {
            myout ( 1 ) ;
        }
        // Otherwise, output 0.
        else {
            myout ( 0 ) ;
        }
    }
    // This block is executed if the remainder 'a' is zero (i.e., N is a multiple of 100).
    else {
        myout ( 1 ) ;
    }
}