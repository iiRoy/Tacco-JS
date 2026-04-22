"use strict"; /* This line enforces strict mode throughout the script, promoting cleaner code and preventing common errors. */


// This section defines the 'GET' utility, which is designed for parsing input data.
// It's wrapped in an Immediately Invoked Function Expression (IIFE) to create a private scope.
var GET = ( function ( ) {

    /*
     * The primary function exposed by the GET utility.
     * It takes a raw string input and returns an instance of the parser.
     * @param {string} s - The raw input string, typically read from a file or stdin.
     * @returns {g} - A new instance of the internal parser class 'g'.
     */
    function f ( s ) {
        return new g ( s ) ;
    }


    /**
     * Internal class 'g' is responsible for managing and parsing the input lines.
     * @param {string} s - The input string that needs to be parsed.
     * @constructor
     */
    function g ( s ) {
        // Trim leading/trailing whitespace from the entire input and then split it into an array of lines.
        this . _s = s . trim ( ) . split ( "\n" ) ;
        // _y serves as a pointer to the current line index being processed.
        this . _y = 0 ;
    }


    /*
     * Prototype method 'a' reads a single value from the current line.
     * It treats the current line as a sequence of space-separated tokens.
     * @param {boolean} f - If true, the value is returned as a string; otherwise, it's converted to a number.
     * @returns {string|number} The extracted value.
     */
    g . prototype . a = function ( f ) {
        var s = this . _s , // Reference to the array of input lines.
            y = this . _y , // The index of the current line.
            r ; // Variable to hold the result.

        // Check if the current line (s[y]) is still a raw string.
        // If so, split it into tokens and reverse the array to easily `pop()` from the "front".
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        // Extract the last element from the reversed array (which is the first token of the original line).
        r = s [ y ] . pop ( ) ;

        // If the current line is now empty after popping, increment the line pointer to move to the next line.
        if ( ! s [ y ] . length ) {
            this . _y ++ ;
        }

        // Return the result, conditionally converting it to a number using the unary plus operator.
        return f ? r : + r ;
    } ;


    /**
     * Prototype method 'l' reads an entire line, splitting it into an array of values.
     * @param {boolean} f - If true, values are returned as strings; otherwise, they are converted to numbers.
     * @returns {Array<string|number>} An array containing the parsed values from the line.
     */
    g . prototype . l = function ( f ) {
        // Fetch the current line, split it by spaces, and then advance the line pointer.
        var s = this . _s [ this . _y ++ ] . split ( " " ) ;
        // Return the array of strings, or map each string to a number.
        return f ? s : s . map ( a => + a ) ;
    } ;


    /**
     * Prototype method 'm' reads multiple lines (a "matrix" or 2D array of values).
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, values are returned as strings; otherwise, they are converted to numbers.
     * @returns {Array<Array<string|number>>} A 2D array of parsed values.
     */
    g . prototype . m = function ( n , f ) {
        // Slice 'n' lines from the input array, then update the line pointer.
        // Each sliced line is then mapped to an array of its space-separated tokens.
        var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;
        // If 'f' is true, return the 2D array of strings. Otherwise, map all inner values to numbers.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;


    /**
     * Prototype method 'r' reads 'n' lines, treating each line as a single value.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, values are returned as strings; otherwise, they are converted to numbers.
     * @returns {Array<string|number>} An array of parsed values, one per line.
     */
    g . prototype . r = function ( n , f ) {
        // Extract 'n' lines from the input array, and then advance the line pointer.
        var r = this . _s . slice ( this . _y , this . _y += n ) ;
        // Return the array of strings, or map each string to a number.
        return f ? r : r . map ( a => + a ) ;
    } ;

    // The IIFE returns the 'f' function, which is used to initialize the GET parser.
    return f ;

} ) ( ) ; // End of the GET IIFE.


// Initialize the input reader 'o' by reading the content of "/dev/stdin".
// `require("fs").readFileSync` is a synchronous operation to read a file.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * This helper function dynamically creates a multi-dimensional array.
 * The first argument `v` is the initial value for all elements.
 * Subsequent arguments define the dimensions of the array (e.g., xArray(0, 2, 3) creates a 2x3 array of zeros).
 * It uses `eval`, which should be used with caution as it can pose security risks if inputs are untrusted.
 */
function xArray ( v ) {
    var a = arguments , // The 'arguments' object holds all parameters passed to the function.
        l = a . length , // The total count of arguments.
        // Construct the innermost part of the array creation string. It initializes an array of the last dimension with 'v'.
        r = "Array(a[" + -- l + "]) . fill ( 0 ) . map ( x => { return " + v + " ; } )" ;

    // Loop backwards through the remaining dimensions to build nested `Array.map` calls.
    while ( -- l ) {
        r = "Array(a[" + l + "]) . fill ( 0 ) . map ( x => " + r + " )" ;
    }

    // Evaluate the dynamically constructed string to create and return the multi-dimensional array.
    return eval ( r ) ;
}


// Execute the main logic of the program and store its return value.
var myOut = main ( ) ;


// If the `main` function returns a value (i.e., it's not `undefined`), print it to the console.
if ( myOut !== undefined ) {
    console . log ( myOut ) ;
}


/**
 * The main function encapsulates the problem's core logic.
 * It reads input, performs calculations, and formats the output.
 * @returns {string} The final computed result, with elements joined by spaces.
 */
function main ( ) {

    // Read three integer values from the input using the 'o' parser's 'a' method.
    var n = o . a ( ) ;
    var k = o . a ( ) ;
    var s = o . a ( ) ;

    // Create an array named 'ans' with 'n' elements, all initialized to 1.
    var ans = xArray ( 1 , n ) ;

    // Fill the first 'k' elements of the 'ans' array with the value 's'.
    for ( var i = 0 ; i < k ; i ++ ) {
        ans [ i ] = s ;
    }

    // Conditional block: if 's' is less than or equal to 'n',
    // then fill the remaining elements (from index 'k' up to 'n'-1) with 's+1'.
    if ( s <= n ) {
        for ( ; i < n ; i ++ ) {
            ans [ i ] = s + 1 ;
        }
    }

    // Join all elements of the 'ans' array into a single string, separated by spaces, and return it.
    return ans . join ( " " ) ;
}