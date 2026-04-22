/*
 * This JavaScript file processes input from stdin to solve a dynamic programming problem.
 * It calculates the minimum number of coins needed to reach a target sum 'n'
 * using a given set of coin denominations 'cm'.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

// Import the 'fs' module to handle file system operations, specifically reading from stdin.
const    input     =  require ('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ;

// Process the raw input string: trim whitespace and split into lines.
const   list    =    input . trim ( ) . split ( '\n' ) ;

// Extract the first line which contains 'n' and 'm' (target sum and number of coin denominations).
let [ n , m ] = list [ 0 ] . split ( ' ' ) ;

// Convert 'n' and 'm' from strings to numbers.
n = Number ( n ) ;
m = Number ( m ) ;

// Extract the second line which contains coin denominations, trim, and split by space.
let cm = list [ 1 ] . trim ( ) . split ( ' ' ) ;

// Convert each coin denomination string to a number.
cm = cm . map ( c => Number ( c ) ) ;

// Initialize a Map to store the minimum number of coins needed for each sum.
// This acts as our dynamic programming table.
const   dp   =   new   Map ( ) ;

// Initialize the DP table for the base cases:
// For each coin denomination, it takes 1 coin to make that sum.
for ( let i = 0 ; i < m ; i ++ ) {
    dp . set ( cm [ i ] , 1 ) ; // Set the count for the current coin denomination.
}

// Define a maximum value to represent an unreachable state or initial minimum.
// 'n + 1' is a common choice as it's guaranteed to be greater than any valid coin count for 'n'.
const max = n + 1 ;

// Iterate from 0 up to 'n' to fill the DP table.
// 'i' represents the current target sum we are trying to achieve.
for ( let i = 0 ; i <= n ; i ++ ) {

    // If the current sum 'i' is already in our DP table (meaning it's a direct coin denomination),
    // we don't need to calculate it again, so we skip.
    if ( dp . has ( i ) ) {
        continue ;
    }

    // Initialize 'min' for the current sum 'i' with our 'max' (infinity) value.
    let min = max ;

    // Iterate through each available coin denomination.
    for ( let j = 0 ; j < m ; j ++ ) {

        // Calculate the 'target' sum that would be needed before adding the current coin 'cm[j]'.
        const target = i - cm [ j ] ;

        // Check if 'target' is valid:
        // 1. It must be non-negative.
        // 2. It must be a sum for which we have already calculated a minimum coin count (i.e., it's in dp).
        if ( target < 0 || ! dp . has ( target ) ) {
            continue ; // If invalid, skip to the next coin denomination.
        }

        // Retrieve the minimum coin count required to reach 'target'.
        const count = dp . get ( target ) ;

        // Update 'min' with the smaller of the current 'min' and the 'count' from 'target'.
        // This finds the minimum coins needed for 'i' using 'cm[j]' as the last coin.
        min = Math . min ( count , min ) ;
    }

    // If 'min' is still less than 'max', it means we found a way to reach sum 'i'.
    if ( min < max ) {
        // Store the result in the DP table: 'min + 1' (the +1 is for the current coin 'cm[j]').
        dp . set ( i , min + 1 ) ;
    }
}

// Finally, print the minimum number of coins required to reach the target sum 'n'.
console . log ( dp . get ( n ) ) ;