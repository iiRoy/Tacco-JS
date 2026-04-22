// This file contains a JavaScript solution for a dynamic programming problem.
// The primary goal is to compute the number of possible matchings
// between two sets of entities (e.g., men and women) under certain constraints.
// This implementation uses bitmask DP for efficient state representation.

'use strict' ; // Activating strict mode for improved code quality.

( function ( input ) { // Anonymous self-executing function to encapsulate the logic.

  // Initial processing of the input string:
  // 1. Remove leading/trailing whitespace.
  // 2. Split the string into an array of lines.
  input = input . trim ( ) . split ( / \n / ) ;

  // Extract the problem size 'N' from the first line of input.
  // The 'shift()' method removes the first element from the array.
  // The '- 0' ensures explicit conversion to a number.
  const N = input . shift ( ) - 0 ;

  // Calculate 'M', which represents 2^N. This is the total number of possible subsets
  // for N items, crucial for bitmask operations.
  const M = Math . pow ( 2 , N ) ;

  // Define 'K', a large prime number (10^9 + 7).
  // This constant is used for modulo operations to prevent integer overflow
  // during calculations of large counts.
  const K = Math . pow ( 10 , 9 ) + 7 ;

  // Further process the remaining input lines:
  // Each line is split by whitespace into strings, then each string is converted to a number.
  // This creates a 2D array representing the compatibility matrix.
  input = input . map ( str => str . split ( / \s + / ) . map ( x => x - 0 ) ) ;

  // Assign the parsed input to a more semantically clear variable name.
  // 'Match[i][k]' will be 1 if man 'i' can be matched with woman 'k', else 0.
  const Match = input ;

  // Initialize 'ind': an array of objects.
  // 'ind[count][mask]' will store 'mask' if 'mask' has 'count + 1' set bits.
  // This structure helps efficiently retrieve bitmasks based on their population count.
  const ind = new Array ( N ) . fill ( 0 ) . map ( x => new Object ( ) ) ;

  // Populate the 'ind' array by iterating through all possible bitmasks from 1 to M-1.
  for ( let i = 1 ; i < M ; i ++ ) {

    let I = i ; // A temporary variable to manipulate the current mask 'i'.
    let counter = 0 ; // Counter for the number of set bits (1s) in 'I'.

    // Count the set bits in 'I' using a simple bit manipulation technique.
    while ( I > 0 ) {
      counter += ( I % 2 ) ; // Add 1 if the least significant bit is 1.
      I = ( I - I % 2 ) / 2 ; // Effectively right-shift 'I' by one bit.
    }

    // Store the current mask 'i' in the 'ind' array at the index corresponding
    // to its number of set bits (minus 1, as 'counter' is 1-indexed for bit counts).
    ind [ counter - 1 ] [ i ] = i ;
  }


  // Initialize the dynamic programming (DP) table.
  // 'dp[i][j]' will store the number of ways to match the first 'i+1' men
  // with a subset of women represented by the bitmask 'j'.
  const dp = new Array ( N ) . fill ( 0 ) . map ( ( x , j ) => new Object ( ) ) ;

  // Establish the base case for the DP.
  // 'dp[-1]' represents the state before any men have been considered.
  // In this state, there is 1 way to form any (empty) subset of women.
  // This is crucial for the recurrence relation to work correctly.
  dp [ -1 ] = new Array ( M ) . fill ( 1 ) ;


  // Detailed explanation of the DP state and transition:
  // We are considering men from 0 up to N-1 in sequential order.
  // dp[i][j] signifies the number of ways to match the first (i+1) men
  // (i.e., men from index 0 to 'i') with a specific subset of women
  // identified by the bitmask 'j'. The bitmask 'j' must have exactly (i+1) set bits,
  // indicating that (i+1) women have been chosen for matching.


  // Main DP loop: Iterate through each man, from the first (index 0) to the last (N-1).
  for ( let i = 0 ; i < N ; i ++ ) {

    // Inner loop: Iterate through all relevant subsets of women for the current man 'i'.
    // 'ind[i]' contains bitmasks 'J' that have exactly 'i+1' set bits.
    // These are the valid subsets of women to be considered when matching men 0..i.
    for ( let J in ind [ i ] ) {

      // If 'dp[i][J]' has not been initialized (e.g., no paths lead to this state yet),
      // set its value to 0 to ensure correct accumulation.
      if ( dp [ i ] [ J ] === undefined ) {
        dp [ i ] [ J ] = 0 ;
      }

      // Innermost loop: Iterate through each possible woman 'k' (from 0 to N-1)
      // to potentially match with the current man 'i'.
      for ( let k = 0 ; k < N ; k ++ ) {

        // Condition 1: Check compatibility.
        // If man 'i' cannot be matched with woman 'k' (Match[i][k] is 0),
        // then skip this combination and move to the next woman.
        if ( Match [ i ] [ k ] === 0 ) {
          continue ;
        }

        // Condition 2: Check if woman 'k' is part of the current subset 'J'.
        // The expression '(J & (1 << k)) === 0' means the k-th bit of J is NOT set.
        // If woman 'k' is not in 'J', she cannot be matched, so skip.
        if ( ( J & ( 1 << k ) ) === 0 ) {
          continue ;
        }

        // If both compatibility and subset inclusion conditions are met:
        // Update 'dp[i][J]' by adding the value from the previous DP state.
        // The previous state considers 'i-1' men matched with the subset 'J'
        // *excluding* woman 'k' (represented by 'J ^ (1 << k)').
        // The '|| 0' handles cases where 'dp[i-1][J ^ (1 << k)]' might be undefined.
        dp [ i ] [ J ] += ( dp [ i - 1 ] [ J ^ ( 1 << k ) ] || 0 ) ;
      }

      // After calculating all possibilities for dp[i][J], apply the modulo operation.
      // This keeps the numbers within manageable bounds and prevents overflow.
      dp [ i ] [ J ] %= K ;
    }
  }

  // Finally, print the result.
  // The answer is found in 'dp[N-1][M-1]'.
  // 'N-1' refers to the last man (all men considered).
  // 'M-1' is the bitmask where all N bits are set, meaning all N women are involved.
  // The '|| 0' ensures that if no valid matchings exist, 0 is printed instead of undefined.
  console . log ( dp [ N - 1 ] [ M - 1 ] || 0 ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// End of the self-executing anonymous function block.