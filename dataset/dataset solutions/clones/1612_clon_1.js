/*
 * This is a Type I clone of a JavaScript program.
 * It processes input from stdin to solve a dynamic programming problem.
 * All identifiers, operators, and expressions are strictly preserved.
 * Only whitespace and comments have been altered significantly.
 */
"use strict" ; // Enforce strict mode for better code quality

// Global input handling variables
var input = require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ;

var cin = input . split( / |\n/ ) , cid = 0 ; // Split input by space or newline, initialize cursor

/**
 * Reads the next number from the input array.
 * Converts the string to a number using unary plus operator.
 * @returns {number} The next number.
 */
function next ( ) {
    return + cin [ cid ++ ] ;
}

/**
 * Reads the next string from the input array.
 * @returns {string} The next string.
 */
function nextstr ( ) {
    return cin [ cid ++ ] ;
}

/**
 * Reads the next BigInt from the input array.
 * @returns {BigInt} The next BigInt.
 */
function nextbig ( ) {
    return BigInt ( cin [ cid ++ ] ) ;
}

/**
 * Reads 'n' items from the input array.
 * Optionally converts them to numbers if 'a' is falsy.
 * @param {number} n - The number of items to read.
 * @param {boolean} [a] - If true, returns strings; otherwise, converts to numbers.
 * @returns {Array<string|number>} An array of the read items.
 */
function nexts ( n , a ) {
    return a
        ? cin . slice ( cid , cid += n )
        : cin . slice ( cid , cid += n ) . map ( a => + a ) ;
}

/**
 * Reads a 2D array (matrix) of dimensions h x w from the input.
 * Optionally returns strings or converts to numbers.
 * @param {number} h - Height of the matrix.
 * @param {number} w - Width of the matrix.
 * @param {boolean} [a] - If true, returns strings; otherwise, converts to numbers.
 * @returns {Array<Array<string|number>>} The 2D array.
 */
function nextm ( h , w , a ) {
    var r = [ ] , i = 0 ;

    // If 'a' is true, slices are taken as strings
    if ( a ) {
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) ) ;
        }
    }
    // Otherwise, slices are mapped to numbers
    else {
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
        }
    }

    return r ;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as additional arguments after 'v'.
 * Uses eval, which is generally discouraged but part of the original logic.
 * @param {*} v - The initial value for the innermost elements.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments ,
        l = a . length ,
        r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ;

    while ( -- l ) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }

    return eval ( r ) ;
}


// --- Main Execution Block ---

// Call the main function to get the result
var myOut = main ( ) ;

// If the main function returned a value, print it to console
if ( myOut !== undefined ) {
    console . log ( String ( myOut ) ) ;
}


/**
 * The primary logic function for the program.
 * Solves a dynamic programming problem involving a grid.
 * @returns {number} The maximum value found in the DP table.
 */
function main ( ) {
    // Read grid dimensions (r, c) and number of items (k)
    var [ r , c , k ] = nexts ( 3 ) ;

    // Initialize a 2D array 'a' with 'r+1' rows,
    // where inner elements are objects (represented by "{}").
    var a = xArray ( "{}" , r + 1 ) ;

    // Populate the 'a' array with 'k' items, each having coordinates (u,v) and value (w)
    for ( var i = 0 ; i < k ; i ++ ) {
        var [ u , v , w ] = nexts ( 3 ) ;
        a [ u ] [ v ] = w ;
    }

    // Initialize the dynamic programming table 'dp'
    // It's a 2D array with (c+1) columns and 4 rows (or depth 4).
    // Initialized with 0s.
    var dp = xArray ( 0 , c + 1 , 4 ) ;

    // Iterate through rows of the grid (from 1 to r)
    for ( var y = 1 ; y <= r ; y ++ ) {
        // Create a new DP table for the current row (dp2)
        var dp2 = xArray ( 0 , c + 1 , 4 ) ;

        // Iterate through columns of the grid (from 1 to c)
        for ( var x = 1 ; x <= c ; x ++ ) {
            // Calculate dp2[x][0] based on previous row's max and current row's previous column
            dp2 [ x ] [ 0 ] = Math . max ( dp [ x ] [ 3 ] , dp2 [ x - 1 ] [ 0 ] ) ;

            // Iterate for the 'i' dimension (from 1 to 3)
            for ( var i = 1 ; i <= 3 ; i ++ ) {
                // If there's an item at a[y][x]
                if ( a [ y ] [ x ] ) {
                    // Consider three paths:
                    // 1. From previous row's max + current item
                    // 2. From current row's previous column (with one less item collected) + current item
                    // 3. From current row's previous column (without collecting current item)
                    dp2 [ x ] [ i ] = Math . max (
                        dp [ x ] [ 3 ] + a [ y ] [ x ] ,
                        dp2 [ x - 1 ] [ i - 1 ] + a [ y ] [ x ] ,
                        dp2 [ x - 1 ] [ i ]
                    ) ;
                }
                // If there's no item at a[y][x]
                else {
                    // Consider two paths:
                    // 1. From previous row's max
                    // 2. From current row's previous column (without collecting current item)
                    dp2 [ x ] [ i ] = Math . max ( dp [ x ] [ 3 ] , dp2 [ x - 1 ] [ i ] ) ;
                }
            }
        }
        // After processing the entire row, update 'dp' to 'dp2' for the next iteration
        dp = dp2 ;
    }

    // Return the maximum value from the last column of the final DP table
    return Math . max ( ... dp [ c ] ) ;
}