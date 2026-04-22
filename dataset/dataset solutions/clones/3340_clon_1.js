/*
 * This JavaScript code implements a dynamic programming solution
 * for a combinatorial problem, likely related to distributing items
 * (candies) among children with certain constraints.
 * The 'use strict' directive ensures that the code runs in strict mode,
 * which helps catch common coding errors and "unsafe" actions.
 */
'use strict'
; // Enforces strict parsing and error handling for the entire script.


( function( input )
{
  // Initial processing of the input string:
  // 1. `trim()`: Removes whitespace from both ends of the string.
  // 2. `split(/\s+/)`: Divides the string into an array of substrings
  //    where each substring is separated by one or more whitespace characters.
  // 3. `map(x=>x-0)`: Converts each string element in the array to a number.
  //    The `x-0` trick is a concise way to perform numeric conversion.
  input = input . trim( ) . split( / \s+ / ) . map( x => x - 0 )
  ; // Input array now contains numbers.

  // Extract problem parameters from the processed input array:
  // `N` typically represents the number of children.
  const N = input . shift( )
  ; // Removes and returns the first element (N).
  // `K` typically represents the total available quantity of items (candies).
  const K = input . shift( )
  ; // Removes and returns the second element (K).

  // `M` is a large prime number used for modulo arithmetic.
  // This is common in combinatorial problems to prevent integer overflow
  // and keep results within a manageable range, usually 10^9 + 7.
  const M = Math . pow( 10, 9 ) + 7
  ;

  // The remaining elements in the `input` array are assigned to `a`.
  // `a` likely contains constraints for each child, e.g., maximum candies per child.
  const a = input
  ;

  // Initialize a 2D array (dynamic programming table) named `dp`.
  // `dp` will have `N` rows and `K+1` columns.
  // Each cell `dp[i][k]` will store the sum of ways to distribute candies
  // considering children from index `0` up to `i`, consuming `0` to `k` candies in total.
  // All elements are initially set to 0.
  const dp = new Array( N ) . fill( 0 ) . map( x => new Array( K + 1 ) . fill( 0 ) )
  ;

  // --- Base Cases Initialization for the DP table ---

  // `dp[-1]` represents a virtual state before considering any children.
  // In this state, there is 1 way to consume any number of candies from 0 to K (by not giving any).
  // This is crucial for the recurrence relation when `i-1` refers to `dp[-1]`.
  dp[ -1 ] = new Array( K + 1 ) . fill( 1 )
  ;

  // For each child `i`, if the number of candies `k` is -1 (another virtual state),
  // there are 0 ways to distribute, as `k` must be non-negative.
  for ( let i = 0 ; i < N ; i++ )
  {
    dp[ i ][ -1 ] = 0
    ;
  } // End of initialization loop.

  // --- Main Dynamic Programming Calculation Loop ---

  // Iterate through each child, from the first child (index 0) to the last child (index N-1).
  for ( let i = 0 ; i < N ; i++ )
  {
    // For each child `i`, iterate through the possible total number of candies `k`
    // that can be consumed, from 0 up to `K`.
    for ( let k = 0 ; k <= K ; k++ )
    {
      // Calculate `l`, which is a lower bound for the number of candies
      // that child `i` *could* have taken, to adjust for overcounting.
      // `a[i]` is the maximum number of candies child `i` can take.
      let l = Math . max( -1, k - a[ i ] )
      ;

      // Apply the recurrence relation:
      // `dp[i][k]` is the sum of ways to distribute up to `k` candies among children `0` to `i`.
      // It's calculated by:
      //  `dp[i][k-1]`       : Sum of ways considering child `i` and `0` to `k-1` candies.
      //  `+ dp[i-1][k]`     : Sum of ways considering children `0` to `i-1` and `0` to `k` candies.
      //  `- dp[i-1][l]`     : Subtracts ways where child `i` would have taken more than `a[i]` candies,
      //                       which were implicitly included by `dp[i-1][k]` but are invalid.
      dp[ i ][ k ] = dp[ i ][ k - 1 ] + dp[ i - 1 ][ k ] - dp[ i - 1 ][ l ]
      ;

      // Ensure the result stays within the modulo range [0, M-1].
      // If the result becomes negative due to subtraction, add `M` before applying the modulo.
      if ( dp[ i ][ k ] < 0 )
      {
        dp[ i ][ k ] += M
        ;
      }
      dp[ i ][ k ] %= M
      ;
    } // End of inner loop (candies `k`).
  } // End of outer loop (children `i`).

  // The following line is commented out but would typically be used for debugging
  // to inspect the final state of the DP table.
  // console.log( dp ) ;

  // Output the final result.
  // The problem asks for `dp[N-1][0]`, which represents the sum of ways
  // to distribute exactly 0 candies among all `N` children.
  // This value is typically 1 (one way: give no candies to anyone).
  console . log( dp[ N - 1 ][ 0 ] )
  ;

} )( require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) )
; // The entire script is wrapped in an Immediately Invoked Function Expression (IIFE).
  // It reads input synchronously from standard input (`/dev/stdin`) as a UTF-8 string
  // and passes it as the `input` argument to the function.