'use strict'; // Enable strict mode for better error handling and security.

// This is an immediately invoked function expression (IIFE) to encapsulate the code.
( function ( input )
{

  // Process the input string: trim whitespace, then split into an array of lines.
  input = input.trim().split( /\n/ );

  // Extract N (number of men/women) from the first line of input.
  // The '-0' converts the string to a number.
  const N = input.shift() - 0;

  // Calculate M, which is 2^N. This represents the total number of possible subsets of women.
  const M = Math.pow( 2, N );

  // Define K, the modulus for calculations, typically 10^9 + 7 for competitive programming.
  const K = Math.pow( 10, 9 ) + 7;

  // Process the remaining input lines:
  // - Each line is split by whitespace to get individual numbers.
  // - Each string number is converted to an actual number using '-0'.
  input = input.map( str => str.split( /\s+/ ).map( x => x - 0 ) );

  // Assign the processed input to the 'Match' constant.
  // Match[i][j] will be 1 if man 'i' can be matched with woman 'j', 0 otherwise.
  const Match = input;

  // Initialize an array 'ind' of length N.
  // Each element of 'ind' is an object that will store bitmasks.
  // ind[k] will store all bitmasks that have exactly (k+1) bits set.
  const ind = new Array( N ).fill( 0 ).map( x => new Object );

  // Populate the 'ind' array.
  // This loop iterates from 1 to M-1 (all possible non-empty subsets of women).
  for ( let i = 1; i < M; i++ )
  {
    let I = i;       // Use a temporary variable to count set bits without modifying 'i'.
    let counter = 0; // Initialize a counter for set bits.

    // Count the number of set bits (1s) in the binary representation of 'I'.
    while ( I > 0 )
    {
      counter += ( I % 2 );      // Add the least significant bit to the counter.
      I = ( I - I % 2 ) / 2;     // Right-shift 'I' by one bit (integer division by 2).
    }

    // Store the current bitmask 'i' in the object corresponding to its bit count.
    // E.g., if 'i' has 3 bits set, it goes into ind[2].
    ind[ counter - 1 ][ i ] = i;
  }


  // Initialize the dynamic programming table 'dp'.
  // dp[i] will be an object. The keys of this object will be bitmasks.
  // The value dp[i][J] will store the number of ways to match men up to 'i'
  // with women represented by the bitmask 'J'.
  const dp = new Array( N ).fill( 0 ).map( ( x, j ) => new Object );

  // Base case for dp:
  // dp[-1] represents the state before considering any men.
  // dp[-1][J] is initialized to 1 for all J, meaning there's one way to have no men matched yet.
  // This helps in the recurrence relation for dp[0].
  dp[ -1 ] = new Array( M ).fill( 1 );


  /*
   * DP state definition (rephrased from original comment):
   * dp[i][J] represents the number of ways to match the first 'i+1' men (from man 0 to man i)
   * with a specific combination of 'i+1' women, where 'J' is a bitmask
   * indicating which 'i+1' women have been chosen for these 'i+1' men.
   *
   * The problem is framed as matching men from 0 to N-1.
   * The 'ind' array helps iterate through bitmasks 'J' that have exactly 'i+1' bits set.
   *
   * The recurrence aims to calculate dp[i][J] based on dp[i-1][J_prime].
   * dp[i][J] = sum( dp[i-1][J ^ (1<<k)] ) for all k such that:
   *   1. The k-th woman is part of the set J (i.e., (J & (1<<k)) is true).
   *   2. Man 'i' can be matched with woman 'k' (Match[i][k] is 1).
   *
   * This means for man 'i', we try to match him with each possible woman 'k' from the set 'J'.
   * If man 'i' matches woman 'k', then the remaining 'i' men (0 to i-1) must have been matched
   * with the remaining 'i' women (set J excluding woman k), which is represented by J ^ (1<<k).
   */


  // Main dynamic programming loop.
  // Iterate through each man, from man 0 up to man N-1.
  for ( let i = 0; i < N; i++ )
  {
    // For the current man 'i', we are looking for states where 'i+1' women have been matched.
    // The 'ind[i]' object contains all bitmasks 'J' that have exactly 'i+1' bits set.
    for ( let J in ind[ i ] )
    {
      // Ensure dp[i][J] is initialized to 0 if it's not yet defined.
      // This is crucial for accumulating sums correctly.
      if ( dp[ i ][ J ] === undefined )
      {
        dp[ i ][ J ] = 0;
      }

      // Now, iterate through all possible women 'k' (from 0 to N-1) to try matching with man 'i'.
      for ( let k = 0; k < N; k++ )
      {
        // Condition 1: Check if man 'i' can be matched with woman 'k'.
        // If Match[i][k] is 0, they cannot be matched, so skip this woman.
        if ( Match[ i ][ k ] === 0 )
        {
          continue; // Move to the next woman.
        }

        // Condition 2: Check if woman 'k' is included in the current set of women 'J'.
        // (J & (1 << k)) isolates the k-th bit of J. If it's 0, woman 'k' is not in J.
        if ( ( J & ( 1 << k ) ) === 0 )
        {
          continue; // Move to the next woman.
        }

        // If both conditions are met, it means man 'i' can be matched with woman 'k'.
        // We then add the number of ways to match the previous 'i' men (0 to i-1)
        // with the set of women 'J' *excluding* woman 'k'.
        // J ^ (1 << k) creates a new bitmask where the k-th bit is flipped (removed from J).
        // The '|| 0' handles cases where dp[i-1][...] might be undefined (e.g., if no such previous state was reachable).
        dp[ i ][ J ] += ( dp[ i - 1 ][ J ^ ( 1 << k ) ] || 0 );

        // Apply modulo K to prevent integer overflow, as results can be very large.
        dp[ i ][ J ] %= K;
      }
    }
  }

  // The final answer is stored in dp[N-1][M-1].
  // N-1 refers to the last man (man N-1).
  // M-1 (which is (1<<N)-1) is the bitmask where all N bits are set, meaning all N women are involved.
  // The '|| 0' handles the case where no valid matching is found, resulting in an undefined value.
  console.log( dp[ N - 1 ][ M - 1 ] || 0 );

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ); // Read input from standard input using Node.js 'fs' module.