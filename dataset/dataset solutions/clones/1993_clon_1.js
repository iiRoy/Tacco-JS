/*
 * This is a Type I code clone generated from an original JavaScript source.
 * The purpose is to demonstrate variations solely in whitespace and comments,
 * while maintaining exact structural and logical identity.
 *
 * All identifiers, operators, and expressions are preserved without alteration.
 * Only spacing, indentation, and comments have been modified extensively.
 */
"use strict";

// --- Input/Output Utility Functions ---

/*
 * Reads the entire standard input file synchronously.
 * Assumes input is provided via /dev/stdin.
 */
var input = require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) ;

/*
 * Parses the input string into an array of tokens.
 * Tokens are separated by spaces or newlines.
 * `cid` acts as a cursor for consuming tokens.
 */
var cin = input . split( / |\n/ ) ,
    cid = 0 ;

/**
 * Retrieves the next token from the input array.
 * Converts to number by default unless 'a' is truthy.
 *
 * @param {boolean} a - If true, returns the token as a string. Otherwise, as a number.
 * @returns {string|number} The next token.
 */
function next( a ) {
    // If 'a' is true, return the token as a string.
    // Otherwise, convert it to a number using the unary plus operator.
    return a
        ? cin[ cid++ ]
        : +cin[ cid++ ]
    ;
}

/**
 * Retrieves a specified number of next tokens from the input array.
 * Converts to numbers by default unless 'a' is truthy.
 *
 * @param {number} n - The number of tokens to retrieve.
 * @param {boolean} a - If true, returns tokens as strings. Otherwise, as numbers.
 * @returns {Array<string|number>} An array of the next 'n' tokens.
 */
function nexts( n, a ) {
    // If 'a' is true, return string tokens.
    if ( a ) {
        return cin . slice( cid, cid += n ) ;
    } else {
        // Otherwise, convert tokens to numbers.
        return cin . slice( cid, cid += n ) . map( a => +a ) ;
    }
}

/**
 * Retrieves a 2D matrix of tokens from the input array.
 *
 * @param {number} h - The number of rows (height) of the matrix.
 * @param {number} w - The number of columns (width) of the matrix.
 * @param {boolean} a - If true, returns tokens as strings. Otherwise, as numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm( h, w, a ) {
    var r = [],
        i = 0 ;

    // If 'a' is true, return string tokens for the matrix.
    if ( a ) {
        for ( ; i < h ; i++ ) {
            r . push( cin . slice( cid, cid += w ) ) ;
        }
    } else {
        // Otherwise, convert tokens to numbers for the matrix.
        for ( ; i < h ; i++ ) {
            r . push( cin . slice( cid, cid += w ) . map( a => +a ) ) ;
        }
    }

    return r ;
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * Uses `eval` to construct the array dynamically.
 *
 * @param {*} v - The initial value for the innermost elements.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} The initialized multi-dimensional array.
 */
function xArray( v ) {
    var a = arguments ,
        l = a . length ,
        // Construct the innermost array creation string first.
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ;

    // Wrap with outer array creations for remaining dimensions.
    while ( --l ) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }

    // Evaluate the constructed string to create the array.
    return eval( r ) ;
}


// --- Mathematical Utility Functions ---

/*
 * Modulo constant used for arithmetic operations.
 * Represents 10^9 + 7.
 */
var mod = 1e9 + 7 ;

/**
 * Multiplies an arbitrary number of arguments modulo `mod`.
 * Uses a specific multiplication algorithm to prevent intermediate overflow
 * when dealing with large numbers that fit within standard JavaScript number precision.
 *
 * @param {...number} arguments - Numbers to be multiplied.
 * @returns {number} The product of all arguments modulo `mod`.
 */
function mul() {
    var a = arguments ,
        r = a[ 0 ] ,
        i = a . length ;

    // Iterate through arguments, multiplying them one by one.
    while ( --i ) {
        // This specific multiplication technique handles large numbers
        // by splitting them into two 16-bit parts.
        r = ( ( r >> 16 ) * a[ i ] % mod * 65536 + ( r & 65535 ) * a[ i ] ) % mod ;
    }

    return r ;
}

/**
 * Calculates (a^n) modulo `mod` using binary exponentiation (exponentiation by squaring).
 *
 * @param {number} a - The base.
 * @param {number} n - The exponent.
 * @returns {number} (a^n) % mod.
 */
function pow( a, n ) {
    var r = 1 ; // Initialize result to 1 (a^0).

    // Iterate while the exponent 'n' is greater than 0.
    for ( ; n ;
        a = mul( a, a ), // Square the base in each step.
        n >>= 1          // Halve the exponent in each step.
    ) {
        // If the current bit of 'n' is 1, multiply 'r' by the current 'a'.
        if ( n & 1 ) {
            r = mul( a, r ) ;
        }
    }

    return r ;
}


// --- Main Program Execution ---

/*
 * Calls the main logic function and stores its return value.
 * This structure allows for potential pre- or post-processing of the output.
 */
var myOut = main() ;

/*
 * If the main function returns a defined value, print it to the console.
 * This is a common pattern for competitive programming to handle different output requirements.
 */
if ( myOut !== undefined ) {
    console . log( myOut ) ;
}

/**
 * The main function containing the core logic of the program.
 * It calculates a specific sum based on given inputs 'n' and 'k'.
 * The problem likely involves number theory concepts such as Mobius inversion or similar.
 *
 * @returns {number} The final calculated answer modulo `mod`.
 */
function main() {
    // Read the first integer input 'n'.
    var n = next() ;

    // Read the second integer input 'k'.
    var k = next() ;

    // Initialize an array 's' of size k+1 with all elements set to 0.
    // This array will store intermediate results, likely related to counts or sums.
    var s = xArray( 0, k + 1 ) ;

    // Initialize the answer variable with 'k'.
    var ans = k ;

    // Set the last element of 's' to 1. This often serves as a base case or initial condition.
    s[ k ] = 1 ;

    /*
     * The core loop iterates downwards from k-1 to 1.
     * This structure is characteristic of algorithms that build solutions
     * for smaller values based on results for larger values (e.g., dynamic programming, Mobius inversion).
     */
    for ( var i = k - 1 ; i > 0 ; i-- ) {
        // Calculate s[i] based on (k/i)^n. The '|0' ensures integer division.
        // This step is crucial for the specific mathematical problem being solved.
        s[ i ] = pow( ( k / i ) | 0, n ) ;

        /*
         * Inner loop: subtracts values from s[j] (where j is a multiple of i) from s[i].
         * This "inclusion-exclusion" type of subtraction is common in problems
         * involving properties of divisors or multiples.
         */
        for ( var j = i + i ; j <= k ; j += i ) {
            s[ i ] -= s[ j ] ;
        }

        // Apply modulo operation to s[i] to keep it within the defined range.
        s[ i ] %= mod ;

        // Ensure s[i] remains positive by adding 'mod' if it becomes negative.
        // This is necessary because JavaScript's '%' operator can return negative results for negative numbers.
        if ( s[ i ] < 0 ) {
            s[ i ] += mod ;
        }

        // Update the total answer by adding mul(s[i], i) modulo 'mod'.
        // This accumulation step combines the results from each 'i' to form the final answer.
        ans += mul( s[ i ], i ) ;
    }

    // Return the final answer, ensuring it's within the modulo range.
    return ans % mod ;
}