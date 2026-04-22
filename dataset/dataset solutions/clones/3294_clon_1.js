/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same as in the source code.
 *
 * The only modifications are to whitespace (indentation, spacing, blank lines)
 * and comments (added, removed, or modified).
 * This transformation aims to make the code visually distinct
 * while preserving its exact logical and structural identity.
 */

'use strict' ; // Enforces strict mode for the entire script.

// Standard input setup for Node.js environment.

process.stdin.resume() ; // Pauses the stdin stream.

process.stdin.setEncoding( 'utf-8' ) ; // Sets the encoding for input data.

let inputString = '' ; // Accumulates the incoming input data.

let currentLine = 0 ; // Keeps track of the current line being read from input.

// Event listener for incoming data on standard input.
process.stdin.on( 'data' ,   inputStdin   =>   {
    inputString += inputStdin ; // Appends new data chunks to the input string.
} ) ;

// Event listener for the end of standard input.
process.stdin.on( 'end' ,   _   =>   {
    // Processes the accumulated input string.
    inputString = inputString
        .trim() // Removes leading/trailing whitespace from the whole string.
        .split( '\n' ) // Splits the string into an array of lines.
        .map( string => {
            return string.trim() ; // Trims each individual line.
        } ) ;

    // Calls the main function to start the program's logic.
    main() ;
} ) ;

/**
 * Reads a single line from the processed input string.
 * Increments the currentLine counter after each read.
 * @returns {string} The next line from the input.
 */
function readline ( ) {
    return inputString[ currentLine ++ ] ;
}

/**
 * Converts a space-separated string of numbers into an array of numbers.
 * @param {string} str The input string.
 * @returns {number[]} An array of numbers.
 */
function getArray ( str ) {
    return str.split( ' ' ).map( x => Number( x ) ) ;
}

/**
 * Converts a string to an integer.
 * @param {string} str The input string.
 * @returns {number} The integer representation of the string.
 */
function getInt ( str ) {
    return Number( str ) ;
}

/**
 * Converts a space-separated string into an array of strings.
 * (Essentially splits the string by spaces).
 * @param {string} str The input string.
 * @returns {string[]} An array of strings.
 */
function getStrArray ( str ) {
    return str.split( ' ' ).map( x => x ) ;
}

/* --- End of Utility Functions --- */


/**
 * The main function containing the core logic of the program.
 * It solves a dynamic programming problem, likely related to
 * finding the minimum cost path or similar.
 */
function main ( ) {
    // Reads the first line of input, which contains 'len' and 'k'.
    const x = getArray( readline() ) ;
    const len = x[ 0 ] ; // The total length or number of elements.
    const k = x[ 1 ] ; // The maximum jump step.

    // Reads the second line of input, which contains the array 'a'.
    const a = getArray( readline() ) ;

    // Initializes a dynamic programming array 'dp' of size 'len'.
    const dp = new Array( len ) ;
    dp.fill( -1 ) ; // Fills the dp array with -1 to indicate uncomputed states.

    // Base cases for the DP problem.
    dp[ 0 ] = 0 ; // Cost to reach the first element is 0.

    // If 'len' is at least 2, calculate the cost to reach the second element.
    if ( len >= 2 ) {
        dp[ 1 ] = Math.abs( a[ 1 ] - a[ 0 ] ) ; // Cost to reach index 1 from index 0.
    }

    // Iterates from the third element (index 2) up to 'len - 1'.
    for ( let i = 2 ; i < len ; i ++ ) {
        let min = 100 ; // Initialize 'min' with a sufficiently large value.
        // This inner loop considers all possible previous steps (j) up to 'k'.
        for ( let j = 1 ; j <= k ; j ++ ) {
            // Check if the previous index (i - j) is valid (within array bounds).
            if ( i - j >= 0 ) {
                // Calculates the cost from a previous state (i - j) to the current state (i).
                // The cost is dp[i - j] (cost to reach i - j) + absolute difference between a[i] and a[i - j].
                min = Math.min( min ,   dp[ i - j ] + Math.abs( a[ i ] - a[ i - j ] ) ) ;
            }
        }
        dp[ i ] = min ; // Stores the minimum cost to reach the current index 'i'.
    }

    // Prints the minimum cost to reach the last element (index 'len - 1').
    console.log( dp[ len - 1 ] ) ;
}