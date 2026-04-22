"use strict"
; /* Strict mode enabled */


const main =  arg  => { // Main program entry point
  // Trim whitespace from input and split it into an array of lines.
  arg = arg . trim ( ) . split ( "\n" ) ;

  // Parse the number of items (N) and the knapsack capacity (W) from the first line.
  const N = parseInt( arg [0] . split ( " " ) [0] ) ;
  const W = parseInt( arg [0] . split ( " " ) [1] ) ;


  /*
   * Process the remaining input lines to get item weights and values.
   * `slice(1, N + 1)` selects lines from the second (index 1) up to N+1.
   * Each line is then split by space and its parts converted to integers.
   * This creates an array of [weight, value] pairs for each item.
   */
  const wv = arg . slice ( 1 , N + 1 ) . map ( n => n . split ( " " ) . map ( l => parseInt ( l ) ) ) ;

  // Initialize the dynamic programming table (dp array).
  // It will have N+1 rows and W+1 columns, all filled with zeros initially.
  let dp = [ ... Array ( N + 1 ) ] . map ( n => [ ... Array ( W + 1 ) ] . fill ( 0 ) ) ;
  let answer = 0 ; // Variable to store the maximum value found.

  // Iterate through each item, from the first (index 1) to the N-th.
  for ( let i = 1 ; i < N + 1 ; i ++ ) {
    // Get the weight (w) and value (v) of the current item.
    // Note: wv is 0-indexed, so we use i-1.
    const w = wv [ i - 1 ] [ 0 ] ;
    const v = wv [ i - 1 ] [ 1 ] ;

    // Iterate through all possible knapsack capacities, from 0 to W.
    for ( let j = 0 ; j < W + 1 ; j ++ ) {
      // Check if the current item's weight is greater than the current capacity 'j'.
      if ( w > j ) {
        // If the item is too heavy for the current capacity, we cannot include it.
        // So, the maximum value for this capacity 'j' with 'i' items is the same
        // as the maximum value with 'i-1' items (i.e., without the current item).
        dp [ i ] [ j ] = dp [ i - 1 ] [ j ] ;
      } else {
        // If the item can fit, we have two choices:
        // 1. Do not include the current item: The value is dp[i-1][j].
        // 2. Include the current item: The value is 'v' (item's value) plus
        //    the maximum value obtained from previous items for the remaining capacity (j - w).
        dp [ i ] [ j ] = Math . max ( dp [ i - 1 ] [ j ] , v + dp [ i - 1 ] [ j - w ] ) ;
      }

      // After calculating dp[i][j], update the overall maximum answer if it's greater.
      if ( dp [ i ] [ j ] > answer ) {
        answer = dp [ i ] [ j ] ;
      } // End of answer update check.
    } // End of inner loop (capacity iteration).
  } // End of outer loop (item iteration).

  // Print the final maximum value that can be achieved.
  console . log ( answer ) ;
} ; // End of main function definition.


// Execute the main function with input read from standard input.
main( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;