// This JavaScript file implements a solution for a graph distance problem.
// It calculates and counts the occurrences of shortest path distances between all pairs of nodes.
// The problem involves two special nodes (x, y) that offer an alternative path.

"use strict" ; // Activate strict mode for the entire script, enforcing cleaner syntax and error handling.


/**
 *   The primary function responsible for processing the input,
 *   performing calculations, and outputting the results.
 *
 *   @param   {string[]}   input   -   An array where the first element
 *                                       contains space-separated integers:
 *                                       [n, x, y].
 *   @returns {void}
 */
function   main ( input )
{
  // Parse the first line of input.
  // It takes the first string, removes leading/trailing whitespace,
  // splits it by spaces, and then converts each part to an integer.
  const   inputs   =   input[ 0 ] . trim ( ) . split ( " " ) . map (   i   =>   parseInt( i )   ) ;

  // Destructure the parsed input into named constants for clarity.
  const   n   =   inputs[ 0 ] ; // Total number of nodes in the graph.
  const   x   =   inputs[ 1 ] ; // The first special node (1-indexed).
  const   y   =   inputs[ 2 ] ; // The second special node (1-indexed).


  let   distances   =   [ ] ; // Declare an array to store the frequency of each distance value.

  // Initialize the 'distances' array.
  // The maximum possible distance between two nodes is n-1.
  // We need to store counts for distances from 1 up to n-1.
  for ( let   i = 0 ;   i < n - 1 ;   i ++ )
  {
    distances[ i ]   =   0 ; // Set initial count for each distance to zero.
  }


  // Iterate through all unique pairs of nodes (i, j) where i < j.
  // Nodes are 1-indexed as per problem statement.
  for ( let   i = 1 ;   i <= n ;   i ++ )
  {
    for ( let   j = i + 1 ;   j <= n ;   j ++ )
    {
      // Calculate the direct distance between node i and node j.
      // This is simply the absolute difference: |j - i|.
      const   directDistance   =   Math . abs ( j - i ) ;

      // Calculate the alternative distance using the special nodes x and y.
      // This path goes from i to x, then from x to y, then from y to j.
      // The distance is |x-i| + 1 (for the edge x-y) + |y-j|.
      const   alternativeDistance   =   Math . abs ( x - i ) + Math . abs ( y - j ) + 1 ;

      // The actual shortest distance is the minimum of the direct and alternative paths.
      let   distance   =   Math . min ( directDistance ,   alternativeDistance ) ;

      // Increment the counter for this specific distance.
      // Note: The 'distances' array is 0-indexed, so we use 'distance - 1'.
      distances[ distance - 1 ] ++ ;
    }
  }

  // After calculating all pairwise distances, print the frequency of each distance.
  // We print counts for distances from 1 up to n-1.
  for ( let   i = 0 ;   i < n - 1 ;   i ++ )
  {
    console . log ( distances[ i ] ) ; // Output the count for the distance (i+1).
  }
}


// --- Main Program Execution ---
// This block reads input from standard input, processes it, and invokes the 'main' function.
// It assumes the input is read as a UTF-8 string, trimmed of whitespace, and split by newlines.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim ( ) . split ( "\n" ) ) ;