/* This directive enforces strict parsing and error handling in the script. */
"use strict" ;

// Global variables for input processing
var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ; // Reads the entire standard input as a UTF-8 string.

/*
 * The 'cin' array stores parsed input tokens.
 * 'cid' is the current index for reading tokens from 'cin'.
 * Input is split by spaces or newlines.
 */
var cin = input . split ( / |\n/ ) , cid = 0 ;


/*
 * Function to get the next input token as a number.
 * It uses the unary plus operator to convert the string token to a number.
 * The 'cid' index is incremented after each read.
 */
function next ( ) {
    return + cin [ cid ++ ] ; // Converts and returns the next token.
}


/*
 * Function to get the next input token as a string.
 * The 'cid' index is incremented after each read.
 */
function nextstr ( ) {
    return cin [ cid ++ ] ; // Returns the next token as a string.
}


/*
 * Function to get the next input token as a BigInt.
 * Useful for handling very large integer inputs.
 */
function nextbig ( ) {
    return BigInt ( cin [ cid ++ ] ) ; // Converts and returns the next token as a BigInt.
}


/*
 * Function to get 'n' subsequent input tokens.
 * If 'a' is truthy, tokens are returned as strings.
 * Otherwise, tokens are converted to numbers.
 *
 * @param {number} n - The number of tokens to read.
 * @param {boolean} a - Flag to indicate if tokens should be returned as strings (true) or numbers (false/undefined).
 * @returns {Array} An array containing the 'n' read tokens.
 */
function nexts ( n , a ) {
    // Check if 'a' is provided and truthy.
    if ( a ) {
        // If 'a' is true, return string tokens.
        return cin . slice ( cid , cid += n ) ;
    } else {
        // Otherwise, return number tokens.
        return cin . slice ( cid , cid += n ) . map ( a => + a ) ;
    }
}


/*
 * Function to read a 2D matrix of input tokens.
 * Reads 'h' rows and 'w' columns.
 *
 * @param {number} h - The number of rows.
 * @param {number} w - The number of columns per row.
 * @param {boolean} a - Flag to indicate if elements should be returned as strings (true) or numbers (false/undefined).
 * @returns {Array<Array>} A 2D array representing the matrix.
 */
function nextm ( h , w , a ) {
    var r = [ ] , i = 0 ; // Initialize result array and loop counter.

    // If 'a' is truthy, read elements as strings.
    if ( a ) {
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) ) ;
        }
    }
    // Otherwise, read elements as numbers.
    else {
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
        }
    }

    return r ; // Return the constructed matrix.
}


/*
 * Function to create a multi-dimensional array initialized with a value.
 * Uses dynamic evaluation to construct the array creation logic.
 *
 * @param {*} v - The initial value for the innermost elements.
 * @param {...number} dimensions - The dimensions of the array (e.g., xArray(0, 2, 3) creates a 2x3 array of 0s).
 * @returns {Array} The multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments , // Get all arguments passed to the function.
        l = a . length , // Get the total number of arguments.
        r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ; // Start building the array creation string for the innermost dimension.

    // Loop backwards through dimensions to build the nested array structure.
    while ( -- l ) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }

    // Evaluate the dynamically constructed string to create the array.
    return eval ( r ) ;
}


// Call the main function and store its result.
var myOut = main ( ) ;

// If the main function returned a value (i.e., not 'undefined'), print it to console.
if ( myOut !== undefined ) {
    console . log ( myOut ) ;
}


/*
 * The primary logic function of the program.
 * It reads input, performs calculations, and returns a formatted result.
 */
function main ( ) {

    var n = next ( ) ; // Read the first integer 'n'.

    var ans = xArray ( 0 , n ) ; // Initialize an array 'ans' of size 'n' with zeros.

    // Read a matrix 'c' of size (n-1) rows by 3 columns.
    var c = nextm ( n - 1 , 3 ) ;

    // Outer loop iterates from 0 to n-2.
    for ( var i = 0 ; i < n - 1 ; i ++ ) {

        // Inner loop iterates from 0 to 'i'.
        for ( var j = 0 ; j <= i ; j ++ ) {

            // If the current element in 'ans' is less than c[i][1], update it.
            if ( ans [ j ] < c [ i ] [ 1 ] ) {
                ans [ j ] = c [ i ] [ 1 ] ;
            }

            /*
             * Calculate the new value for ans[j].
             * This involves ceiling division and addition.
             * Math.ceil(A / B) * B ensures the result is a multiple of B,
             * greater than or equal to A.
             */
            ans [ j ] = Math . ceil ( ans [ j ] / c [ i ] [ 2 ] ) * c [ i ] [ 2 ] + c [ i ] [ 0 ] ;
        }
    }

    // Join the elements of the 'ans' array with newline characters and return the resulting string.
    return ans . join ( "\n" ) ;
}