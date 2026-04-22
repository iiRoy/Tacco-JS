/*
 * This JavaScript module processes input to determine a game outcome.
 * It uses dynamic programming to solve a specific problem.
 * All rights reserved.
 */
'use strict' ; // Enforce strict parsing and error handling in the script.

( function ( input ) { // Immediately Invoked Function Expression (IIFE) starts here.

    // --- Input Processing Section ---
    // First, trim any leading/trailing whitespace from the input string.
    // Then, split the string by one or more whitespace characters into an array of strings.
    // Finally, map each string element to a number by subtracting zero (a common JS trick).
    input = input . trim ( ) . split ( / \s+ / ) . map ( x => x - 0 ) ;

    // Extract problem parameters from the processed input array.
    const N = input . shift ( ) ; // N represents the number of elements in array A.
    const K = input . shift ( ) ; // K is a target value or limit for the game.

    // The remaining elements in the input array form array A.
    const A = input ;

    // Initialize a dynamic programming (DP) array.
    // Its size is K + 2, and all elements are initially marked as 'tbd' (to be determined).
    const dp = new Array ( K + 2 ) . fill ( 'tbd' ) ;

    // --- DP Table Initialization and Calculation ---

    // Base case: The state K+1 is considered a winning state for the current player.
    dp [ K + 1 ] = true ;


    // Iterate backwards from K+1 down to A[0].
    // This loop calculates winning/losing states for different game positions.
    for ( let i = K + 1 ; i >= A [ 0 ] ; i -- ) {

        // If the current state 'i' is already determined to be a winning state (true):
        if ( dp [ i ] ) {
            // Check the previous state. If it's also a winning state,
            // it implies a specific condition or skip behavior.
            if ( dp [ i - 1 ] === true ) {
                continue ; // Skip further processing for this 'i' and move to the next iteration.
            }

            // Inner loop: Iterate from 1 up to A[0].
            // This part might be related to moves of a certain size.
            for ( let j = 1 ; j <= A [ 0 ] ; j ++ ) {
                // Ensure the index i-j is within valid bounds.
                if ( i - j >= 0 ) {
                    // If the state i-j is 'tbd', mark it as false (losing state).
                    if ( dp [ i - j ] === 'tbd' ) {
                        dp [ i - j ] = false ;
                    }
                }
            }
        }

        // If the current state 'i' is determined to be a losing state (false or 'tbd' and not winning):
        if ( ! dp [ i ] ) {
            // Another inner loop: Iterate through elements of array A.
            // This part explores moves based on the values in A.
            for ( let a = 0 ; a < N ; a ++ ) {
                // Ensure the index i-A[a] is within valid bounds.
                if ( i - A [ a ] >= 0 ) {
                    // If a move from 'i' by A[a] leads to a valid state,
                    // and 'i' itself is a losing state, then i-A[a] becomes a winning state.
                    dp [ i - A [ a ] ] = true ;
                }
            }
        }
    }


    // --- Final Result Output ---
    // After filling the DP table, check the outcome for the initial state (dp[0]).
    if ( dp [ 0 ] === true ) {
        console . log ( 'First' ) ; // If dp[0] is true, the first player wins.
    } else {
        console . log ( 'Second' ) ; // Otherwise, the second player wins.
    }

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // IIFE closure and execution with file system input.