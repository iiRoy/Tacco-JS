/*
 * This JavaScript file contains the implementation for a dynamic programming problem.
 * It calculates the number of ways to color stones based on specific rules and constraints.
 * The problem involves tracking the last occurrence of colors and applying modular arithmetic.
 */

"use strict" /* This directive enforces strict parsing and error handling for the entire script. */

function Main( input )
{

  // The input string is first trimmed to remove leading/trailing whitespace.
  // Then, it's split into an array of strings using any whitespace as a delimiter.
  // Finally, each string element is converted to a number using the 'x - 0' trick.
  input = input .trim( ) .split( /\s+/ ) .map( x => x - 0 ) ;

  // The first element of the processed input array is extracted and assigned to N.
  // N represents the total number of stones to be considered in the problem.
  var N = input .shift( ) ;

  // 'last' is an array used to store the most recent index at which a particular color was encountered.
  // For example, last[color_value] will hold the 0-based index of the stone where 'color_value' was last seen.
  var last = [ ] ; // Initialize an empty array to track the last positions of colors.

  // Initialize all potential color indices within a predefined range.
  // The range 0 to 2,000,000 is chosen based on typical problem constraints for color values.
  for ( let i = 0 ; i < 2000000 ; i++ )
  {
    last[ i ] = "not yet" ; // Mark each color as "not yet" encountered to distinguish from index 0.
  }

  // The color of the very first stone (at index 0) is input[0].
  // Its last known position is naturally 0.
  last[ input[ 0 ] ] = 0 ;

  // 'dp' is a dynamic programming array. dp[i] will store the number of ways to color
  // the sequence of stones from index 0 up to and including index 'i'.
  var dp = [ 1 ] ; // Base case: There is 1 way to color the first stone (at index 0).

  // M is a large prime number used for modular arithmetic.
  // This is essential to prevent integer overflow when calculating large sums.
  var M = Math .pow( 10 , 9 ) + 7 ; // Commonly used modulo: 10^9 + 7.


  // Iterate through the stones starting from the second stone (index 1) up to N-1.
  for ( let i = 1 ; i < N ; i++ )
  {

    // 'c' holds the color of the stone currently being processed at index 'i'.
    let c = input[ i ] ;

    // Check if the current color 'c' has either never been seen before,
    // OR if its previous occurrence was immediately preceding the current stone (at i-1).
    if ( last[ c ] === "not yet" || last[ c ] === i - 1 )
    {
      last[ c ] = i ; // Update the last known position of color 'c' to the current index 'i'.
      dp[ i ] = dp[ i - 1 ] ; // The number of ways remains the same as for the previous stone.
      continue ; // Proceed to the next stone in the loop.
    }

    // If the color 'c' has been seen before, and its last occurrence was not at i-1,
    // calculate dp[i] as the sum of dp[i-1] (ways without considering the current stone's constraint)
    // and dp[last[c]] (ways considering the constraint imposed by the previous occurrence of 'c').
    dp[ i ] = ( dp[ i - 1 ] + dp[ last[ c ] ] ) % M ; // Apply the modulo 'M' to the sum.

    last[ c ] = i ; // Update the last known position of color 'c' to the current index 'i'.
  }

  // After iterating through all stones, the final result is the last element of the dp array.
  // The .pop() method removes and returns the last element, which corresponds to dp[N-1].
  console .log( dp .pop( ) ) ;
}


// This is the entry point for the Node.js environment.
// It reads the entire content of standard input (/dev/stdin) as a UTF-8 string.
// The read string is then passed as the 'input' argument to the Main function for processing.
Main( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ;