"use strict"; /* This directive enables strict mode for the entire script. */

// --- Input Reading Utilities ---

/*
 * Reads the entire content of standard input synchronously.
 * It uses 'fs' module to read from '/dev/stdin' and decodes it as UTF-8.
 */
var input = require("fs") . readFileSync ( "/dev/stdin" , "utf8" ) ;

// 'cin' stores the input tokens, 'cid' is the current index for 'cin'.
var cin = input . split ( / |\n/ ) ,
    cid = 0 ; // Current index for consumption of input tokens.

/**
 * Retrieves the next token from input and converts it to a number.
 * @returns {number} The next numeric token.
 */
function next ( ) {
    return + cin [ cid ++ ] ;
}

/**
 * Retrieves the next token from input as a string.
 * @returns {string} The next string token.
 */
function nextstr ( ) {
    return cin [ cid ++ ] ;
}

/**
 * Retrieves the next token from input and converts it to a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function nextbig ( ) {
    return BigInt ( cin [ cid ++ ] ) ;
}

/**
 * Retrieves 'n' tokens from input. Optionally converts them to numbers.
 * @param {number} n - The number of tokens to retrieve.
 * @param {boolean} [a] - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<string|number>} An array of the next 'n' tokens.
 */
function nexts ( n , a ) {
    return a
        ? cin . slice ( cid , cid += n )
        : cin . slice ( cid , cid += n ) . map ( a => + a ) ;
}

/**
 * Retrieves a 2D array (matrix) of tokens.
 * @param {number} h - The number of rows.
 * @param {number} w - The number of columns per row.
 * @param {boolean} [a] - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<Array<string|number>>} A 2D array of tokens.
 */
function nextm ( h , w , a ) {
    var r = [ ] ,
        i = 0 ;

    if ( a ) {
        // If 'a' is true, do not convert elements to numbers.
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) ) ;
        }
    }
    else {
        // If 'a' is false or undefined, convert elements to numbers.
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
        }
    }

    return r ;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a value 'v'.
 * Uses eval, so caution is advised.
 * @param {*} v - The initial value for the innermost elements.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments ,
        l = a . length ,
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ;

    while ( --l ) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }

    return eval ( r ) ;
}

// --- Main Program Execution ---

// Execute the main logic and store its result.
var myOut = main ( ) ;

// If 'myOut' is not undefined, print its string representation to console.
if ( myOut !== undefined ) {
    console . log ( String ( myOut ) ) ;
}

// --- Main Logic Function ---

/**
 * The core business logic of the program.
 * Calculates the maximum possible score by traversing a permutation cycle.
 * @returns {BigInt} The maximum calculated score.
 */
function main ( ) {

    // Read N (number of elements) and K (number of steps).
    var n = next ( ) ,
        k = next ( ) ;

    // Read permutation array 'p' and adjust to 0-indexed.
    var p = nexts ( n ) . map ( a => a - 1 ) ;

    // Read costs array 'c'.
    var c = nexts ( n ) ;

    // Initialize the answer with a very small BigInt value.
    var ans = BigInt ( -2e18 ) ; // Using BigInt for ans because intermediate calculations might exceed Number.MAX_SAFE_INTEGER

    // Declare 'a' array for temporary cycle sums.
    var a = Array ( n ) ;

    // Iterate through each starting point 'i'.
    for ( var i = 0 ; i < n ; i ++ ) {

        var cnt = 1 ; // Counter for steps within the current cycle.

        // Reset 'a' array for each new cycle starting point.
        a . fill ( 0 ) ;

        var id = p [ i ] ; // Start traversing from the element pointed by p[i].

        // The first step's score is the cost of the initial element.
        a [ 0 ] = c [ id ] ;

        // Traverse the cycle until 'k' steps are reached or the cycle closes.
        while ( cnt < k && id !== i ) {
            id = p [ id ] ; // Move to the next element in the cycle.
            a [ cnt ] = a [ cnt - 1 ] + c [ id ] ; // Accumulate score.
            cnt ++ ; // Increment step counter.
        }

        // The 'cnt' variable now holds the length of the cycle (or up to k steps if k is smaller).
        // This line does nothing, but is kept as per Type I clone definition.
        cnt ;

        // Check if the total sum of the cycle (a[cnt-1]) is positive.
        if ( a [ cnt - 1 ] > 0 ) {
            /*
             * If the cycle sum is positive, we can traverse it multiple times
             * to maximize the score.
             */
            for ( var j = 0 ; j < cnt ; j ++ ) {
                // Calculate the score for 'j' steps plus full cycle traversals.
                var t = BigInt ( a [ j ] ) + BigInt ( Math . floor ( ( k - j - 1 ) / cnt ) ) * BigInt ( a [ cnt - 1 ] ) ;

                // Update the maximum answer if 't' is greater.
                if ( ans < t ) {
                    ans = t ;
                }
            }
        }
        else {
            /*
             * If the cycle sum is non-positive, traversing it more times
             * will not increase the score (or will decrease it).
             * So, we only consider taking steps within the cycle up to 'k' (or 'cnt').
             */
            for ( var j = 0 ; j < cnt ; j ++ ) {
                var t = BigInt ( a [ j ] ) ; // Current accumulated score up to 'j' steps.

                // Update the maximum answer if 't' is greater.
                if ( ans < t ) {
                    ans = t ;
                }
            }
        }

    } // End of outer loop (for each starting point 'i').

    return ans ; // Return the overall maximum score found.
}