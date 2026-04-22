/*
 * This JavaScript file contains the implementation for solving a specific
 * combinatorial problem, likely related to Amida lottery (also known as Ghost Leg).
 *
 * Author:   Code Clone Generator
 * Date:     2023-10-27
 * Version:  1.0.0
 *
 * Description:
 *   The 'Main' function calculates the number of ways to reach a specific
 *   column in an Amida lottery grid of H rows and W columns, given certain
 *   constraints on the horizontal lines.
 *
 * License: Public Domain
 */

/**
 * Main function to solve the Amida lottery problem.
 *
 * @param {string} input - A string containing space-separated integers: H W K.
 *                         H: Height of the Amida grid (number of rows).
 *                         W: Width of the Amida grid (number of columns).
 *                         K: Target column index (1-based).
 * @returns {number} The total number of valid paths to reach column K-1 at height H.
 */
function Main( input )
{
  // First, parse the input string into an array of integers.
  // The input is expected to be "H W K".
  input = input . split ( " " ) . map ( a => ~~a ) ;

  // Deconstruct the parsed input into individual variables.
  var H = input[ 0 ] ; // Height of the grid.
  var W = input[ 1 ] ; // Width of the grid.
  var K = input[ 2 ] ; // Target column (1-indexed).

  // Define the modulo constant for calculations to prevent overflow.
  var mod = 10**9 + 7 ;

  // Handle a base case: if the width is 1, there's only one path.
  if ( W === 1 )
  {
    return 1 ;
  }


  // --- Generate all valid Amida configurations for a single row ---
  // A configuration is valid if no two horizontal lines are adjacent (represented by "11").
  // Each bit in the binary representation corresponds to a potential horizontal line
  // between two adjacent vertical lines.
  var validAmidaList = Array( 2**( W - 1 ) ) // Create an array representing all possible bitmasks for W-1 gaps.
    . fill ( 0 )                          // Initialize with zeros.
    . map ( ( a, b ) => b )               // Map to indices (0 to 2^(W-1)-1).
    . map ( a => a . toString ( 2 ) )     // Convert each index to its binary string representation.
    . filter ( a => !/11/ . test ( a ) )  // Filter out configurations where '11' (adjacent lines) appears.
    . map ( a => "000000" + a )           // Pad with leading zeros (arbitrary large number of zeros).
    . map ( a => a . slice ( 1 - W ) )    // Trim to ensure exactly W-1 bits, effectively padding to the left.
    . map ( a => "0" + a + "0" )          // Add '0' at the start and end to simplify boundary checks later.
  ; /* End of validAmidaList generation */


  // --- Initialize Dynamic Programming (DP) table ---
  // dp[i][j] will store the number of ways to reach column 'j' at height 'i'.
  var dp = Array( H + 1 ) ; // DP table with H+1 rows (from 0 to H).

  // Initialize each row of the DP table with W columns, all set to 0.
  for ( var i = 0 ; i <= H ; i++ )
  {
    dp[ i ] = Array( W ) . fill ( 0 ) ;
  }

  // Base case: At height 0, there is 1 way to be at column 0.
  // (Assuming we start at column 0).
  dp[ 0 ][ 0 ] = 1 ;


  // --- Fill the DP table using the valid Amida configurations ---
  // Iterate through each height level from 1 to H.
  for ( var i = 1 ; i <= H ; i++ )
  {
    // For each height, consider every valid Amida configuration.
    validAmidaList . forEach ( function ( elem )
    {
      // For the current configuration 'elem', calculate paths for each column.
      for ( var j = 0 ; j < W ; j++ )
      {
        // Determine the movement based on the current column 'j' and the Amida configuration 'elem'.
        // elem[j] represents a potential bar to the left of current vertical line 'j'.
        // elem[j+1] represents a potential bar to the right of current vertical line 'j'.
        ( {
          "10": ( a ) => dp[ i ][ j ] += dp[ i - 1 ][ j - 1 ] , // Move from left (j-1) to current (j).
          "01": ( a ) => dp[ i ][ j ] += dp[ i - 1 ][ j + 1 ] , // Move from right (j+1) to current (j).
          "00": ( a ) => dp[ i ][ j ] += dp[ i - 1 ][ j ]     // Stay in current column (j).
        } ) [ elem[ j ] + elem[ j + 1 ] ] ( ) ; // Dynamically call the appropriate function based on 'elem' bits.

        // Apply modulo operation to keep the result within bounds.
        dp[ i ][ j ] %= mod ;
      } // End of inner loop (columns j).
    } ) ; // End of forEach loop (validAmidaList).
  } // End of outer loop (height i).


  // The final result is the number of ways to reach column K-1 at height H.
  return dp[ H ][ K - 1 ] ;

} // End of Main function.


// This block handles execution when the script is run in a Node.js environment.
// It reads input from standard input, processes it with the Main function,
// and prints the result to standard output.
if ( typeof require !== 'undefined' )
{
  console . log ( Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ) ;
}