/*
 * This JavaScript file processes input from stdin to solve a dynamic programming problem.
 * It calculates the minimum cost to traverse an array, jumping up to 2 steps forward.
 *
 * Type I clone demonstration: Extensive changes to whitespace and comments only.
 */

"use strict"
; /* Enforce strict mode for cleaner code and fewer errors. */

// --- Input Handling Section ---

process.stdin .resume( ) ;
process.stdin .setEncoding ( 'utf8' ) ; // Set the encoding for incoming data.

let input_stdin = '' ; // This variable will accumulate all input data.
let chunks      = '' ; // This will hold the input split into lines.

/*
 * Event listener for 'data' event.
 * Appends incoming data chunks to input_stdin.
 */
process.stdin .on ( 'data' , function ( data )
{
    input_stdin += data ; // Concatenate the received data.
} ) ;

/*
 * Event listener for 'end' event.
 * Triggered when all input has been received.
 * Splits the accumulated input into lines and then calls the main 'start' function.
 */
process.stdin .on ( 'end' , function ( )
{
    chunks = input_stdin.split ( '\n' ) ; // Split the entire input by newline characters.
    start ( ) ; /* Initiate the core logic of the program. */
} ) ;


// --- Core Logic Section ---

function start ( )
{
    // Read the first line, which is expected to be 'n', the size of the array.
    const n = parseInt ( chunks . shift ( ) ) ; // Parse 'n' as an integer and remove it from chunks.

    // Read the second line, which contains space-separated numbers, and convert them to an array of numbers.
    let array = chunks [ 0 ] . split ( ' ' ) . map ( Number ) ; // Split by space and map to Number type.

    // Initialize a DP array with 'Infinity' for all elements.
    // 'dp[i]' will store the minimum cost to reach index 'i'.
    const dp = Array ( n ) . fill ( Infinity ) ;

    // The cost to reach the first element (index 0) is 0.
    dp [ 0 ] = 0 ;

    // Iterate through the array to fill the DP table.
    // This loop calculates the minimum cost to reach each position.
    for ( let i = 0 ; i < n ; i ++ )
    {
        // Inner loop considers jumps of 1 or 2 steps forward from the current position 'i'.
        // Jumps are allowed to 'j' where 'j' is 'i + 1' or 'i + 2'.
        for ( let j = i + 1 ; j < i + 3 && j < n ; j ++ )
        {
            // Calculate the cost to reach 'j' from 'i'.
            // This is the cost to reach 'i' plus the absolute difference between array[i] and array[j].
            const current_cost_to_j = dp [ i ] + Math . abs ( array [ i ] - array [ j ] ) ;

            // Update dp[j] if the newly calculated cost is less than the current stored cost for dp[j].
            dp [ j ] = Math . min ( dp [ j ] , current_cost_to_j ) ;
        }
    }

    // Output the minimum cost to reach the last element of the array.
    console . log ( dp [ n - 1 ] ) ; // Print the final result.
}

// End of file.