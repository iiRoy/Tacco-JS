/*
 * This file contains the main logic for processing input data.
 * It uses dynamic programming to solve a specific problem.
 */
"use strict"; // Enforce strict mode for cleaner code.


function   main(  input  ) { // Main function to handle the program's execution.

    // Split the input string by newline characters to get individual lines.
    const inputs = input.split( "\n" );
    // The first line contains the length 'L'.
    const L = Number( inputs[0] );

    // Initialize an array 'A' to store numerical inputs.
    const A = [];
    // Loop through the remaining input lines to populate array A.
    for ( let i = 0 ; i < L ; i++ ) {
        // Convert each input line to a number and push it into A.
        A.push( Number( inputs[ i + 1 ] ) );
    }

    /*
     * Initialize a 2D dynamic programming array 'dp'.
     * The size is (L + 1) rows and 5 columns.
     * Each cell is initially undefined, then filled.
     */
    const dp = Array( L + 1 ) .fill( ) .map( ( ) => Array( 5 ) .fill( ) );
    // Set the base case for the DP table (first row).
    dp[ 0 ] = [ 0 , 0 , 0 , 0 , 0 ];

    // Iterate through the DP table, starting from the second row.
    for ( let i = 1 ; i <= L ; i++ ) {
        // Get the current value from array A.
        let cur = A[ i - 1 ];
        // Calculate 'curEven' based on 'cur'. If cur is 0, it's 2, otherwise cur % 2.
        let curEven = A[ i - 1 ] === 0 ? 2 : cur % 2;
        // Calculate 'curOdd' based on 'cur'.
        let curOdd = ( cur + 1 ) % 2;

        // DP state transitions:
        // dp[i][0] represents a specific state calculation
        dp[ i ][ 0 ] = dp[ i - 1 ][ 0 ] + cur;
        // dp[i][1] represents another state calculation, taking the minimum of two previous states.
        dp[ i ][ 1 ] = Math.min( dp[ i - 1 ][ 0 ] , dp[ i - 1 ][ 1 ] ) + curEven;
        // dp[i][2] involves three previous states.
        dp[ i ][ 2 ] = Math.min( dp[ i - 1 ][ 0 ] , dp[ i - 1 ][ 1 ] , dp[ i - 1 ][ 2 ] ) + curOdd;
        // dp[i][3] uses two specific previous states.
        dp[ i ][ 3 ] = Math.min( dp[ i - 1 ][ 2 ] , dp[ i - 1 ][ 3 ] ) + curEven;
        // dp[i][4] - This is a more complex transition involving multiple previous states.
        dp[ i ][ 4 ] = Math.min( dp[ i - 1 ][ 0 ] , dp[ i - 1 ][ 1 ] , dp[ i - 1 ][ 2 ] , dp[ i - 1 ][ 3 ] , dp[ i - 1 ][ 4 ] ) + cur;
    }

    // Output the minimum value found in the last row of the DP table.
    console.log( Math.min( ...dp[ L ] ) );
}


// Read input from stdin and pass it to the main function.
main( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) );