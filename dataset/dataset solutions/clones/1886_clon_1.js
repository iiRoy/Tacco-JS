"use strict" ; /* This directive enforces strict mode for the entire script. */

// Input handling utilities
var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;
var cin   = input . split ( / |\n/ ) ,
    cid   = 0 ; // Current index for reading input tokens

/**
 * Reads the next token from the input.
 * If 'a' is truthy, returns the token as a string.
 * Otherwise, attempts to convert the token to a number.
 * @param {boolean} a - Flag to return as string or number.
 * @returns {string|number} The next token.
 */
function next ( a ) {
    return a
           ? cin [ cid++ ]
           : + cin [ cid++ ] ;
}

/**
 * Reads 'n' tokens from the input.
 * If 'a' is truthy, returns them as an array of strings.
 * Otherwise, returns them as an array of numbers.
 * @param {number} n - The number of tokens to read.
 * @param {boolean} a - Flag to return as strings or numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function nexts ( n , a ) {
    return a
           ? cin . slice ( cid , cid += n )
           : cin . slice ( cid , cid += n ) . map ( token => + token ) ;
}

/**
 * Reads a 2D matrix of dimensions h x w from the input.
 * If 'a' is truthy, elements are strings. Otherwise, they are numbers.
 * @param {number} h - Height of the matrix.
 * @param {number} w - Width of the matrix.
 * @param {boolean} a - Flag for string or number elements.
 * @returns {Array<Array<string|number>>} The matrix.
 */
function nextm ( h , w , a ) {
    var r = [] ,
        i = 0 ;
    if ( a ) {
        for ( ; i < h ; i++ ) {
            r . push ( cin . slice ( cid , cid += w ) ) ;
        }
    } else {
        for ( ; i < h ; i++ ) {
            r . push ( cin . slice ( cid , cid += w ) . map ( token => + token ) ) ;
        }
    }
    return r ;
}

/**
 * Dynamically creates a multi-dimensional array.
 * The dimensions are passed as arguments after the initial value 'v'.
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with 0s.
 * @param {*} v - The initial value for the array elements.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments ,
        l = a . length ,
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ;
    while ( --l ) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }
    return eval ( r ) ; // Executes the string as JavaScript code.
}


// --- Main execution block ---
var myOut = main ( ) ; // Call the main function to get the result

// If the main function returns a value, print it to console.
if ( myOut !== undefined ) {
    console . log ( myOut ) ;
}


/**
 * The primary logic function for the problem.
 * It processes a sequence of parentheses strings to determine if they can be balanced.
 * @returns {string} "Yes" if balanceable, "No" otherwise.
 */
function main ( ) {

    // Define constants for output messages.
    var NN = "No" ,
        YY = "Yes" ;

    // Read the number of parentheses strings.
    var n = next ( ) ;

    // Initialize arrays and counters for processing.
    var up = [] ,   // Stores strings that end with a positive balance but had a negative minimum.
        ud = [] ,   // Stores strings that end with a negative balance (or zero) but had a negative minimum.
        sum = 0 ,   // Total balance change across all strings.
        rest = 0 ;  // Current balance during processing.

    // Loop through each of the 'n' parentheses strings.
    for ( var i = 0 ; i < n ; i++ ) {

        var mn = 0 , // Minimum balance encountered during string traversal.
            last = 0 ; // Final balance after traversing the string.

        var s = next ( 1 ) ; // Read the current string.

        // Traverse the current string to calculate balance and minimum balance.
        for ( var j = 0 ; j < s . length ; j++ ) {
            if ( s [ j ] === "(" ) {
                last++ ; // Increment balance for an opening parenthesis.
            }
            else {
                last-- ; // Decrement balance for a closing parenthesis.
                if ( last < mn ) {
                    mn = last ; // Update minimum balance if current balance is lower.
                }
            }
        }

        sum += last ; // Accumulate the final balance of the current string to the total sum.

        // Classify the string based on its minimum and final balance.
        if ( mn >= 0 ) {
            // String never went negative (e.g., "()()", "((()))").
            rest += last ;
        } else if ( last <= 0 ) {
            // String went negative and ended negative or zero (e.g., "())", "(()").
            // Store minimum balance required to make it positive and its final balance.
            up . push ( [ - mn + last , last ] ) ;
        } else { // mn < 0 and last > 0
            // String went negative but ended positive (e.g., "())(").
            // Store minimum balance required to make it positive and its final balance.
            ud . push ( [ - mn , last ] ) ;
        }
    }

    // If the total sum of balances is not zero, it's impossible to balance.
    if ( sum ) {
        return NN ;
    }

    // Sort 'ud' strings: those that started negative but ended positive.
    // Sort by the minimum balance required (-mn) in ascending order.
    // This prioritizes strings that need less initial balance to start correctly.
    ud . sort ( ( a , b ) => a [ 0 ] - b [ 0 ] ) ;

    // Process 'ud' strings.
    for ( var i = 0 ; i < ud . length ; i++ ) {
        // If the current minimum required balance for 'ud[i]' is greater than 'rest',
        // it means we don't have enough positive balance accumulated so far.
        if ( ud [ i ] [ 0 ] > rest ) {
            return NN ;
        }
        rest += ud [ i ] [ 1 ] ; // Add the final balance of this string to 'rest'.
    }

    // Sort 'up' strings: those that started negative and ended negative or zero.
    // Sort by the minimum balance required (-mn + last) in descending order.
    // This prioritizes strings that need a larger initial balance to start correctly,
    // which is better when processing strings that consume balance.
    up . sort ( ( a , b ) => b [ 0 ] - a [ 0 ] ) ;

    // Process 'up' strings.
    for ( var i = 0 ; i < up . length ; i++ ) {
        var [ mn , last ] = up [ i ] ; // Destructure the stored values.

        // If the current minimum required balance for 'up[i]' is greater than 'rest',
        // it means we don't have enough positive balance accumulated so far.
        if ( mn > rest ) {
            return NN ;
        }
        rest += last ; // Add the final balance of this string to 'rest' (which will be negative or zero).
    }

    // If all strings have been processed and conditions met, it's possible to balance.
    return YY ;
}