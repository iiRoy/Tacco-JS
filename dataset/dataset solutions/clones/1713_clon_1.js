"use strict"; /* This directive enables strict mode for the entire script. */

// --- Input Processing Utility Functions ---
// Requires the 'fs' module to read files.
var input = require( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;
// Splits the input string by spaces or newlines into an array.
var cin = input . split ( / |\n/ ) , cid = 0 ;

/**
 * Reads the next numerical token from the input array.
 * @returns {number} The next number.
 */
function next ( ) {
    return + cin [ cid ++ ] ;
}

/**
 * Reads the next string token from the input array.
 * @returns {string} The next string.
 */
function nextstr ( ) {
    return cin [ cid ++ ] ;
}

/**
 * Reads the next BigInt token from the input array.
 * @returns {BigInt} The next BigInt.
 */
function nextbig ( ) {
    return BigInt ( cin [ cid ++ ] ) ;
}

/**
 * Reads 'n' tokens and returns them as an array.
 * Optionally converts them to numbers if 'a' is false or undefined.
 * @param {number} n - The number of tokens to read.
 * @param {boolean} a - If true, returns strings; otherwise, converts to numbers.
 * @returns {Array<number|string>} An array of tokens.
 */
function nexts ( n , a ) {
    return a ? cin . slice ( cid , cid += n ) : cin . slice ( cid , cid += n ) . map ( val => + val ) ;
}

/**
 * Reads a 2D matrix of dimensions h x w from the input.
 * Optionally keeps values as strings if 'a' is true.
 * @param {number} h - Height of the matrix.
 * @param {number} w - Width of the matrix.
 * @param {boolean} a - If true, returns string arrays; otherwise, converts to number arrays.
 * @returns {Array<Array<number|string>>} The 2D matrix.
 */
function nextm ( h , w , a ) {
    var r = [ ] , i = 0 ;
    if ( a ) {
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) ) ;
        }
    } else {
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) . map ( val => + val ) ) ;
        }
    }
    return r ;
}

/**
 * Dynamically creates a multi-dimensional array filled with a specified value.
 * The dimensions are passed as arguments after the initial fill value.
 * @param {*} v - The value to fill the array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., 10, 5 for 10x5 array).
 * @returns {Array} The initialized multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments , l = a . length ,
        r = "Array(a[" + -- l + "]) . fill ( ) . map ( x => { return " + v + " ; } )" ;
    while ( -- l ) {
        r = "Array(a[" + l + "]) . fill ( ) . map ( x => " + r + " )" ;
    }
    return eval ( r ) ; // Executes the dynamically generated string as JavaScript code.
}

// --- Main Program Execution ---

// Initialize a global score variable.
var score = 0 ;

// Call the main function and store its return value.
var myOut = main ( ) ;

// If the main function returned a defined value, print it to the console.
if ( myOut !== undefined ) {
    console . log ( String ( myOut ) ) ;
}


/**
 * The primary logic function for the program.
 * Reads input, performs calculations, and prints intermediate scores.
 */
function main ( ) {

    // Read the number of days (d).
    const d = next ( ) ; // Example: 365 days.

    // Define a constant for the number of content types (n).
    const n = 26 ;

    // Read an array 'c' of length 'n'. This might represent costs or decrements.
    const c = nexts ( n ) ;

    // Read a 2D matrix 's' of size d x n. This likely represents daily scores for each content type.
    const s = nextm ( d , n ) ;

    // Initialize an array 'a' of size 'n' with all elements set to 0.
    var a = xArray ( 0 , n ) ;

    // Loop through each day from 0 to d-1.
    for ( var i = 0 ; i < d ; i ++ ) {

        // Read the content type 't' for the current day.
        var t = next ( ) ;

        // Decrement each element in array 'a' by the corresponding 'c' value.
        for ( var j = 0 ; j < n ; j ++ ) {
            a [ j ] -= c [ j ] ;
        }

        // Reset the element at index (t-1) in array 'a' to 0.
        a [ t - 1 ] = 0 ;

        // Add the score for the selected content type on the current day to the total score.
        score += s [ i ] [ t - 1 ] ;

        // Add all elements of array 'a' to the total score.
        for ( var j = 0 ; j < n ; j ++ ) {
            score += a [ j ] ;
        }

        // Print the current total score after processing the day.
        console . log ( score ) ;
    }

    // The main function does not explicitly return a value in this problem setup.
    // The problem output is printed incrementally.
}