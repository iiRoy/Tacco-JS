"use strict"
; // Enables strict mode for the entire script

const main =  arg  => {
    // Process input argument: trim whitespace and split by newlines
    arg =  arg . trim ( ) . split ( "\n" ) ;

    // Parse N (number of items) and W (knapsack capacity) from the first line
    const N  =  parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ;
    const W  =  parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ;

    // Parse item weights and values from subsequent lines
    // Each item is an array [weight, value]
    const wv  =  arg . slice ( 1 ,  N  +  1 ) . map ( n => n . split ( " " ) . map ( l => parseInt ( l ) ) ) ;

    // Initialize a 2D DP table with dimensions (N+1) x (W+1), filled with zeros
    // dp[i][j] will store the maximum value achievable with 'i' items and capacity 'j'
    let dp  =  [ ... Array ( N + 1 ) ] . map ( n => [ ... Array ( W + 1 ) ] . fill ( 0 ) ) ;

    // Iterate through each item (from 1 to N)
    for ( let i = 1 ; i < N + 1 ; i ++ ) {
        // Get the weight and value of the current item
        const w  =  wv [ i - 1 ] [ 0 ] ;
        const v  =  wv [ i - 1 ] [ 1 ] ;

        // Iterate through each possible capacity (from 0 to W)
        for ( let j = 0 ; j < W + 1 ; j ++ ) {
            // If the current item's weight exceeds the current capacity 'j'
            if ( w  >  j ) {
                // We cannot include this item, so the max value is the same as without this item
                // (i.e., from the previous row/item)
                dp [ i ] [ j ]  =  dp [ i - 1 ] [ j ] ;
            }
            else {
                // We have two options:
                // 1. Don't include the current item: dp[i-1][j]
                // 2. Include the current item: v (value of current item) + dp[i-1][j-w] (max value
                //    with previous items and remaining capacity j-w)
                // Take the maximum of these two options
                dp [ i ] [ j ]  =  Math . max ( dp [ i - 1 ] [ j ] ,  v  +  dp [ i - 1 ] [ j - w ] ) ;
            }
        }
    }

    // The final answer is the maximum value achievable with all N items and full capacity W
    console . log ( dp [ N ] [ W ] ) ;
}

// Read input from stdin, convert to UTF-8, and pass to the main function
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;