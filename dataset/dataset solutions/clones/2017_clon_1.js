/*
 * This is a JavaScript code snippet that calculates
 * distances between points based on a specific formula.
 * It's designed to solve a graph-related problem.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27
 */

// Main anonymous function that takes 'input' as an argument.
function ( input )
{
  // --- Nested Helper Function Definition ---
  // This function calculates a special distance between two points 'a' and 'b'.
  // It considers two possible paths and returns the minimum of them.
  function   dist ( a ,   b )
  {
    // Path 1: Direct distance (b - a)
    // Path 2: Indirect distance involving 'x' and 'y'
    return   Math . min ( b - a ,   Math . abs ( x - a )   +   Math . abs ( y - b )   +   1 )   ;
  }


  // --- Input Parsing ---
  // Split the input string by spaces to get individual components.
  const   inp   =   input . split ( ' ' )   ;

  // Extract 'n', 'x', and 'y' from the parsed input array.
  // 'n' typically represents the total number of elements or nodes.
  const   n   =   inp [ 0 ]   ;
  // 'x' and 'y' are specific points used in the distance calculation.
  const   x   =   inp [ 1 ]   ;
  const   y   =   inp [ 2 ]   ;


  // --- Main Calculation Loop ---
  // Iterate from 1 up to (but not including) 'n'.
  // 'i' represents the target distance for which we are counting pairs.
  for ( let   i = 1 ;   i < n ;   i ++ )
  {
    // Initialize a counter for the current distance 'i'.
    // This counter will store how many pairs (a, b) have a distance of 'i'.
    let   cnt   =   0   ;

    // Nested loops to iterate through all possible pairs (a, b).
    // 'a' starts from 1 up to (but not including) 'n'.
    for ( let   a = 1 ;   a < n ;   a ++ )
    {
      // 'b' starts from 'a + 1' up to (and including) 'n'.
      // This ensures that 'a' is always less than 'b' and avoids duplicate pairs.
      for ( let   b = a + 1 ;   b <= n ; b ++ )
      {
        // Check if the calculated distance between 'a' and 'b' equals the current target distance 'i'.
        if   (   dist ( a , b )   ==   i   )
        {
          // If the distances match, increment the counter.
          cnt ++   ;
        }
      } // End of inner loop for 'b'
    }   // End of outer loop for 'a'

    // Output the count of pairs that have the target distance 'i'.
    console . log ( cnt )   ;
  } // End of main loop for 'i'

} // End of the main anonymous function

// --- Execution Trigger ---
// This line reads input from standard input, decodes it as UTF-8,
// and then passes it to the main anonymous function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;