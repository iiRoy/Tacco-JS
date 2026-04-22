// This is a Type I clone of a JavaScript program.
// The original code has been reformatted and extensively commented.

"use strict" ; // Enforce strict mode for better code quality and fewer common errors.

// --- Input Processing Utility Functions ---

// Initialize input by reading from /dev/stdin.
// The 'fs' module is used for file system operations.
var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

// Split the input string by spaces or newlines into an array of tokens.
// 'cid' (current index) keeps track of the next token to be read.
var cin   = input . split ( / |\n/ ) , cid = 0 ;


/**
 * Reads the next token from the input array (`cin`) and converts it to a number.
 * The `+` unary operator is used for type conversion.
 * Increments the token index (`cid`) after reading.
 * @returns {number} The next numerical token from the input.
 */
function next ( ) {
    return + cin [ cid ++ ] ;
}


/**
 * Reads the next token from the input array (`cin`) as a string.
 * Increments the token index (`cid`) after reading.
 * @returns {string} The next string token from the input.
 */
function nextstr ( ) {
    return cin [ cid ++ ] ;
}


/**
 * Reads the next token from the input array (`cin`) and converts it to a BigInt.
 * Useful for handling very large integer values that exceed JavaScript's standard number precision.
 * Increments the token index (`cid`) after reading.
 * @returns {BigInt} The next BigInt token from the input.
 */
function nextbig ( ) {
    return BigInt ( cin [ cid ++ ] ) ;
}


/**
 * Reads a specified number of tokens from the input array.
 * Depending on the 'a' parameter, tokens are either returned as strings or converted to numbers.
 * @param {number} n - The number of tokens to read.
 * @param {boolean} [a] - If `true`, returns tokens as strings. Otherwise, converts them to numbers.
 * @returns {Array<string|number>} An array containing the read tokens.
 */
function nexts ( n , a ) {
    // If 'a' is truthy, return the slice of tokens as strings.
    // Otherwise, map each token in the slice to a number.
    return a
        ? cin . slice ( cid , cid += n )
        : cin . slice ( cid , cid += n ) . map ( a => + a ) ;
}


/**
 * Reads a 2D matrix (h rows, w columns) from the input array.
 * Each row is read as a slice of tokens.
 * @param {number} h - The number of rows in the matrix.
 * @param {number} w - The number of columns in each row.
 * @param {boolean} [a] - If `true`, matrix elements are strings. Otherwise, they are numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm ( h , w , a ) {
    var r = [ ] , i = 0 ; // 'r' will store the matrix rows, 'i' is the row counter.

    if ( a ) {
        // If 'a' is true, push slices directly (elements remain strings).
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) ) ;
        }
    } else {
        // Otherwise, push slices after mapping elements to numbers.
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
        }
    }
    return r ; // Return the constructed matrix.
}


/**
 * Dynamically creates a multi-dimensional array based on provided dimensions.
 * The dimensions are passed as additional arguments after 'v'.
 * @param {*} v - The initial value for the innermost elements of the array.
 * @returns {Array} A new multi-dimensional array initialized with 'v'.
 */
function xArray ( v ) {
    var a = arguments , // 'a' holds all arguments passed to this function.
        l = a . length ,  // 'l' is the total number of arguments.
        // 'r' starts as a string representing the innermost array creation.
        r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ;

    // Loop backwards through the dimensions to build up the array creation string.
    while ( -- l ) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }
    return eval ( r ) ; // Use eval to execute the dynamically generated string and create the array.
}


// --- Main Program Execution Flow ---

// Call the 'main' function to execute the core logic of the program.
// The result of 'main' is stored in 'myOut'.
var myOut = main ( ) ;

// Check if 'myOut' has a defined value (i.e., not 'undefined').
// If it does, convert it to a string and print it to the console.
if ( myOut !== undefined ) {
    console . log ( String ( myOut ) ) ;
}


/**
 * The primary function containing the application's core logic.
 * This function calculates a specific sum based on an initial input 'n'
 * and then modifies it based on subsequent pairs of inputs 'u' and 'v'.
 *
 * The problem appears to involve combinatorics or graph theory,
 * where `n * (n+1) * (n+2) / 6` is the sum of `k * (k+1) / 2` from k=1 to n,
 * or the number of paths in a complete graph or combinations of 3 items from n+2.
 * The subtraction `u * (n-v+1)` seems to remove certain invalid paths or combinations.
 *
 * @returns {number} The final calculated answer after all operations.
 */
function main ( ) {
    // Read the first integer input, which defines the problem size 'n'.
    var n = next ( ) ;

    // Initialize 'ans' with a base value. This value represents the sum of
    // all possible paths or combinations before any subtractions.
    // This formula is equivalent to nC3 + nC2 + nC1, or (n+2)C3.
    var ans = n * ( n + 1 ) * ( n + 2 ) / 6 ;

    // Loop 'n-1' times to process subsequent pairs of inputs.
    // Each pair (u, v) modifies the 'ans' based on some condition.
    for ( var i = 1 ; i < n ; i ++ ) {
        // Read the two integers for the current iteration: 'u' and 'v'.
        var u = next ( ) , v = next ( ) ;

        // Ensure that 'u' is always less than or equal to 'v'.
        // If 'u' is greater than 'v', swap their values.
        if ( u > v ) {
            var temp = u ; // Use a temporary variable for the swap.
            u = v ;
            v = temp ;
        }

        // Subtract a calculated value from 'ans'.
        // The term `u * (n - v + 1)` suggests a calculation related to
        // intervals or ranges defined by 'u' and 'v' within 'n'.
        ans -= u * ( n - v + 1 ) ;
    }

    // Return the final computed answer.
    return ans ;
}