'use strict'; // Enforce strict mode for cleaner code.

// Read input from standard input file system.
const input = require('fs') . readFileSync ( '/dev/stdin', 'utf8' ) . trim ( ) . split ( '\n' ) ;

// Parse N, Ma, Mb from the first line of input.
const N = + input [ 0 ] . split ( ' ' ) [ 0 ] ; // Total number of items.
const Ma = + input [ 0 ] . split ( ' ' ) [ 1 ] ; // Target ratio component A.
const Mb = + input [ 0 ] . split ( ' ' ) [ 2 ] ; // Target ratio component B.

// Parse the remaining lines into an array of [A, B, C] values.
const ABCs = input . slice ( 1 ) . map ( l => l . split ( ' ' ) . map ( Number ) ) ;

// Initialize a 3D array (DP table) to store minimum costs.
let cost = [ ] ;

// Define maximum possible values for A, B, and C to size the DP table.
const maxA = 10;
const maxB = 10;
const maxC = 100;


// --- DP table initialization loop ---
// This loop sets up the initial state of our dynamic programming table.
for ( let i = 0 ; i < N ; i++ )
{
    // Initialize the second dimension for the current item 'i'.
    cost [ i ] = [ ] ;

    // Iterate through all possible values of 'a' (component A sum).
    for ( let a = 1 ; a <= maxA * N ; a++ )
    {
        // Initialize the third dimension for the current 'a' value.
        cost [ i ] [ a - 1 ] = [ ] ;

        // Iterate through all possible values of 'b' (component B sum).
        for ( let b = 1 ; b <= maxB * N ; b++ )
        {
            // Initialize the cost for this (a, b) state to a very large value,
            // representing infinity or an unreachable state.
            cost [ i ] [ a - 1 ] [ b - 1 ] = maxC * N + 1 ;
        }
    }
}


// --- DP calculation loop ---
// This section fills the DP table based on the given items (ABCs).
for ( let i = 0 ; i < N ; i++ )
{
    // Extract the A, B, and C values for the current item.
    let a_i = ABCs [ i ] [ 0 ] ;
    let b_i = ABCs [ i ] [ 1 ] ;
    let c_i = ABCs [ i ] [ 2 ] ;

    // Handle the base case: the first item.
    if ( i == 0 )
    {
        // If it's the first item, its cost is simply c_i for its (a_i, b_i) state.
        cost [ i ] [ a_i - 1 ] [ b_i - 1 ] = c_i ;
        continue ; // Move to the next item.
    }

    // Iterate through all possible 'a' sums for the current item 'i'.
    for ( let a = 1 ; a <= maxA * N ; a++ )
    {
        // If the current 'a' sum is less than or equal to a_i,
        // we cannot "take" the current item 'i' if 'a' is too small.
        // In this case, the cost remains the same as without item 'i'.
        if ( a <= a_i )
        {
            // Iterate through 'b' sums and copy costs from the previous item's state.
            for ( let b = 1 ; b < maxB * N ; b++ )
            {
                cost [ i ] [ a - 1 ] [ b - 1 ] = cost [ i - 1 ] [ a - 1 ] [ b - 1 ]
            }
            continue ; // Skip to the next 'a' sum.
        }

        // Iterate through all possible 'b' sums for the current item 'i'.
        for ( let b = 1 ; b <= maxB * N ; b++ )
        {
            // Similar to 'a', if 'b' sum is too small for item 'i', copy from previous state.
            if ( b <= b_i )
            {
                cost [ i ] [ a - 1 ] [ b - 1 ] = cost [ i - 1 ] [ a - 1 ] [ b - 1 ]
                continue ; // Skip to the next 'b' sum.
            }

            // Core DP transition:
            // Calculate the minimum cost for state (a, b) at item 'i'.
            // It's either the cost without including item 'i',
            // or the cost of including item 'i' (cost of (a-a_i, b-b_i) from previous item + c_i).
            cost [ i ] [ a - 1 ] [ b - 1 ] = Math . min (
                cost [ i - 1 ] [ a - 1 ] [ b - 1 ] , // Cost without current item
                cost [ i - 1 ] [ a - a_i - 1 ] [ b - b_i - 1 ] + c_i // Cost with current item
            ) ;
        }
    }
}


// --- Final answer calculation ---
// Initialize the answer with a very large value.
let answer = maxC * N ;

// Start with the target ratio components.
let a = Ma ;
let b = Mb ;

// Iterate through all multiples of (Ma, Mb) within the DP table bounds.
while ( a <= maxA * N && b <= maxB * N )
{
    // Update the minimum answer found so far.
    answer = Math . min ( answer , cost [ N - 1 ] [ a - 1 ] [ b - 1 ] ) ;

    // Increment 'a' and 'b' by their respective target components to maintain the ratio.
    a += Ma ;
    b += Mb ;
}

// Output the final result.
// If the answer is still the initial large value, it means no valid combination was found, so output -1.
// Otherwise, output the minimum cost.
console . log ( answer == maxC * N + 1 ? -1 : answer ) ;