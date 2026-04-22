/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are kept exactly the same.
 * Only whitespace (indentation, spacing, newlines) and comments have been altered
 * to create a visually distinct, yet functionally identical, version.
 */

'use strict'
;
// Immediately Invoked Function Expression (IIFE) to encapsulate the code
( function ( input ) {

  // Process the input string: trim whitespace and split by newline characters
  input = input . trim ( ) . split ( /\n/ ) ;

  // N represents the number of elements, derived from the first line of input
  const N = input . shift ( ) - 0 ;

  // M is calculated as 2 to the power of N, often used for bitmasks or subsets
  const M = Math . pow ( 2 , N ) ;

  // K is a large prime number, typically used for modulo operations in combinatorics
  const K = Math . pow ( 10 , 9 ) + 7 ;


  // Further process the input: each line is split by whitespace and elements converted to numbers
  input = input . map ( str => str . split ( /\s+/ ) . map ( x => x - 0 ) ) ;

  // 'Match' matrix stores the processed input, likely representing a compatibility matrix
  const Match = input ;

  // 'ind' is an array of objects, used to group numbers by their 'popcount' (number of set bits)
  const ind = new Array ( N ) . fill ( 0 ) . map ( x => new Object ) ;

  // Populate the 'ind' array
  // This loop iterates from 1 to M-1 (exclusive), representing all possible subsets/bitmasks
  for ( let i = 1 ; i < M ; i ++ ) {
    let I = i ;       // Temporary variable to count set bits without modifying 'i'
    let counter = 0 ; // Counter for set bits (popcount)

    // Count the number of set bits in 'I'
    while ( I > 0 ) {
      counter += ( I % 2 ) ;    // Add 1 if the last bit is set
      I = ( I - I % 2 ) / 2 ;   // Right shift 'I' by one bit (integer division)
    }

    // Store the current number 'i' in the 'ind' object corresponding to its popcount
    // The popcount is 1-indexed, so we use 'counter - 1' for 0-indexed array access
    ind [ counter - 1 ] [ i ] = i ;
  }


  // 'dp' is a dynamic programming table.
  // It's an array of objects, initialized with N elements.
  const dp = new Array ( N ) . fill ( 0 ) . map ( ( x , j ) => new Object ) ;

  // Initialize a base case for the DP table, often representing an empty set or starting condition
  // dp[-1] is used here to represent a state before any elements have been considered.
  dp [ -1 ] = new Array ( M ) . fill ( 1 ) ;


  /*
   * The problem likely involves matching 'N' men and 'N' women.
   * The comment suggests thinking about men N-1 to 0 in descending order.
   * dp[i][j] represents the number of ways to match men 0 through 'i'
   * with a subset of women represented by the bitmask 'j'.
   * The value stored is the count of remaining matching possibilities.
   */


  // Main dynamic programming loop
  // 'i' iterates through the 'men' (from 0 to N-1)
  for ( let i = 0 ; i < N ; i ++ ) {

    // 'k' iterates through the 'women' (from 0 to N-1)
    for ( let k = 0 ; k < N ; k ++ ) {

      // Check if man 'i' can be matched with woman 'k' (Match[i][k] === 1 means they are compatible)
      if ( Match [ i ] [ k ] === 1 ) {

        // Iterate through all subsets 'J' that have 'i+1' women (these are the subsets relevant for man 'i')
        // The `ind[i]` object contains all bitmasks with `i+1` set bits.
        for ( let J in ind [ i ] ) {

          // If woman 'k' is NOT included in the current subset 'J', skip this combination
          // (1 << k) creates a bitmask with only the k-th bit set.
          // J & (1 << k) checks if the k-th bit is set in J. If it's 0, woman 'k' is not in subset J.
          if ( ( J & ( 1 << k ) ) === 0 ) {
            continue ; // Move to the next subset J
          }

          // If dp[i][J] has not been initialized for this state, set it to 0
          if ( dp [ i ] [ J ] === undefined ) {
            dp [ i ] [ J ] = 0 ;
          }

          // DP transition:
          // Add the possibilities from the previous state (man i-1)
          // where woman 'k' was removed from the subset 'J'.
          // J ^ (1 << k) removes the k-th bit from J (XOR with a bitmask containing only the k-th bit)
          // The '|| 0' handles cases where dp[i-1][...] might be undefined (no ways to match)
          dp [ i ] [ J ] += ( dp [ i - 1 ] [ J ^ ( 1 << k ) ] || 0 ) ;

          // Apply modulo K to keep the result within the required range
          dp [ i ] [ J ] %= K ;
        }
      }
    }
  }

  // The final answer is the number of ways to match all N men with all N women.
  // This corresponds to dp[N-1][M-1], where N-1 is the last man index and M-1 is the bitmask for all women.
  // If no matches are found, it defaults to 0.
  console . log ( dp [ N - 1 ] [ M - 1 ] || 0 ) ;

// The IIFE is immediately executed with the content of '/dev/stdin' as input.
} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;