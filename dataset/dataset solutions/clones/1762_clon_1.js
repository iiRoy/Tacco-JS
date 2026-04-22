/*
 * This file contains a recursive calculation function with memoization.
 * It calculates a specific combinatorial value based on four BigInt inputs.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */


// Helper function to generate a unique string key for memoization.
// Parameters:
//   r - row index (BigInt)
//   c - column index (BigInt)
// Returns: A string in the format "r{r}c{c}"
const keyStr = ( r,  c )  =>  `r${r}c${c}` ;


// A Map object used for memoization to store previously computed results
// of the 'calc' function, mapping a key string to its calculated BigInt value.
const calcMap = new Map();


/**
 *  Performs a complex calculation with memoization.
 *  This function computes a value based on four BigInt parameters,
 *  using a recursive definition with base cases.
 *
 *  @param {BigInt} a - The first BigInt parameter.
 *  @param {BigInt} b - The second BigInt parameter.
 *  @param {BigInt} c - The third BigInt parameter (varies in recursion).
 *  @param {BigInt} d - The fourth BigInt parameter (varies in recursion).
 *  @returns {BigInt} The calculated BigInt result, modulo 998244353n.
 */
const calc = ( a,  b,  c,  d )  =>  {

    // Generate a unique key for the current state (c, d) for memoization.
    const key = keyStr( c, d );

    // Check if the result for this key has already been computed and stored.
    if  ( calcMap.has( key ) )  {
        // If yes, return the stored result directly, avoiding redundant computation.
        return calcMap.get( key ) ;
    }

    // Variable to hold the calculated answer.
    let ans ;

    // First base case: if 'a' is equal to 'c'.
    if  ( a  ===  c )  {
        // Calculate (a ^ (d - b)) modulo 998244353n.
        ans  =  ( a  **  ( d  -  b ) )  %  998244353n ;
    }
    // Second base case: if 'b' is equal to 'd'.
    else  if  ( b  ===  d )  {
        // Calculate (b ^ (c - a)) modulo 998244353n.
        ans  =  ( b  **  ( c  -  a ) )   %  998244353n ;
    }
    // Recursive step: if neither of the base cases are met.
    else  {
        // Apply the recursive formula:
        // (calc(a, b, c-1, d) * d + calc(a, b, c, d-1) * c - calc(a, b, c-1, d-1) * (c-1) * (d-1)) mod MOD
        ans  =  (
              calc( a, b, c - 1n , d )  *  d
            + calc( a, b, c, d - 1n )  *  c
            - calc( a, b, c - 1n, d - 1n )  *  ( c - 1n )  *  ( d - 1n )
        )   %  998244353n ;
    }

    // Store the computed answer in the memoization map before returning.
    // The key is generated again to ensure consistency, though 'key' variable could also be used.
    calcMap.set( keyStr( c, d ), ans ) ;

    // Return the final calculated result.
    return ans ;
}


/**
 * The main entry point of the program.
 * It reads input, parses BigInt values, prints them,
 * and then calls the 'calc' function to get the final result.
 *
 * @param {string} input - The raw input string from stdin.
 */
const main = ( input )  =>  {

    // Split the input string by newlines to get individual lines.
    const inputs = input.split( "\n" ) ;

    // Parse the first line of input to extract four BigInt values (a, b, c, d).
    // The values are space-separated.
    const [ a,  b,  c,  d ]  =  inputs[ 0 ].split( " " ).map( num  =>  BigInt( num ) ) ;

    // Log the parsed BigInt values to console for debugging or verification.
    console.log( `${a}:${b}:${c}:${d}` ) ;

    // Call the main calculation function and print its result.
    // The result from 'calc' is a BigInt, so convert it to Number for console.log
    // (though BigInts can also be logged directly, this matches a common pattern).
    console.log( Number( calc( a, b, c, d ) ) ) ;
}


// Execute the main function by reading input from standard input.
// This is typical for competitive programming environments.
main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;