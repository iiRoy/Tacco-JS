/*
 * This file contains a solution for a dynamic programming problem.
 * It calculates the number of ways to pick items such that their sum equals K.
 * The 'use strict' directive helps catch common coding errors and "unsafe" actions.
 */
'use strict';


// Define a constant for the modulo operation.
// This is often used in competitive programming to prevent integer overflow.
const mod = 1e9 + 7;


/**
 * Solves the main problem using dynamic programming.
 * @param {number} N - The number of elements in array A.
 * @param {number} K - The target sum.
 * @param {number[]} A - An array of integers representing item counts or limits.
 * @returns {number} The number of ways to achieve the sum K, modulo 'mod'.
 */
function solve ( N , K , A ) {

    // Base case: If the target sum K is 0, there is always one way (by choosing nothing).
    if ( K === 0 ) {
        return 1 ;
    }

    // Initialize a DP array to store the number of ways to achieve sums up to K for the current item.
    // dp[j] will store the number of ways to form sum 'j'.
    var dp = new Array( K + 1 ) . fill ( 0 ) ;

    // Initialize a 2D prefix sum array.
    // prefix[i][j] will store the sum of dp values up to index 'j' for item 'i'.
    // This is used for efficient range sum queries in the DP transition.
    var prefix = new Array( N ) . fill ( 0 ) . map ( e => new Array( K + 1 ) . fill ( 0 ) ) ;


    // Iterate through each item (N items).
    for ( var i = 0 ; i < N ; i++ ) {

        // For each item, iterate through all possible sums from 0 to K.
        for ( var j = 0 ; j <= K ; j++ ) {

            // Handle the first item (i = 0) separately.
            // This is the base case for the DP.
            if ( i === 0 ) {

                // If the current sum 'j' is less than or equal to the count of the first item A[i],
                // there is 1 way to form this sum (by taking 'j' items from A[i]).
                // Otherwise, there are 0 ways.
                dp [ j ] = j <= A [ i ] ? 1 : 0 ;

                // Calculate the prefix sum for the current item 'i'.
                // prefix[i][j] = prefix[i][j-1] + dp[j]
                prefix [ i ] [ j ] = j > 0 ? ( ( prefix [ i ] [ j - 1 ] + dp [ j ] ) % mod ) : dp [ j ] ;

            } else { // For subsequent items (i > 0).

                // Calculate dp[j] using the prefix sums from the previous item (i-1).
                // This is a common optimization for "knapsack-like" problems where items can be taken multiple times.
                // It represents the sum of dp[j-x] for x from 0 to A[i], where x is the number of items taken from A[i].
                // This sum can be efficiently calculated as prefix[i-1][j] - prefix[i-1][j - A[i] - 1].
                dp [ j ] = ( j - 1 - A [ i ] ) >= 0 ? ( ( prefix [ i - 1 ] [ j ] - prefix [ i - 1 ] [ j - A [ i ] - 1 ] + mod ) % mod ) : prefix [ i - 1 ] [ j ] ;
                // Note: Adding 'mod' before the outer modulo ensures the result is positive if the subtraction yields a negative number.

                // Update the prefix sum for the current item 'i' and current sum 'j'.
                prefix [ i ] [ j ] = j > 0 ? ( ( prefix [ i ] [ j - 1 ] + dp [ j ] ) % mod ) : dp [ j ] ;

            }
        }
    }

    // The final answer is the number of ways to achieve the target sum K using all N items.
    // This is stored in dp[K] after the last item has been processed.
    return dp [ K ] ;
}


/**
 * Main function to read input, call the solver, and print the output.
 * @param {string} input - The raw input string from stdin.
 */
function main ( input ) {

    // Split the input string into an array of lines.
    var lines = input . split ( "\n" ) ;

    // Parse the first line to get N and K.
    // The map function converts string parts to integers.
    var NK = lines [ 0 ] . split ( ' ' ) . map ( l => parseInt ( l ) ) ;

    // Extract N (number of items) from the parsed array.
    var N = NK [ 0 ] ;

    // Extract K (target sum) from the parsed array.
    var K = NK [ 1 ] ;

    // Parse the second line to get the array A.
    // Each element is converted to an integer.
    var A = lines [ 1 ] . split ( ' ' ) . map ( l => parseInt ( l ) ) ;

    // Call the solve function with the parsed inputs.
    var ans = solve ( N , K , A ) ;

    // Print the final answer to the console.
    console . log ( ans ) ;
}


// This line reads input from standard input (usually a file or piped data)
// and passes it to the main function to start the program execution.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;