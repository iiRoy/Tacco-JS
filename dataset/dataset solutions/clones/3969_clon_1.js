/*
 * This JavaScript program processes a specific input format to find the maximum number
 * of non-overlapping pairs between two sets of points, referred to as 'red' and 'blue' points.
 * Each point has two coordinates (x, y).
 * A red point (rx, ry) can be paired with a blue point (bx, by) if rx < bx and ry < by.
 * The algorithm employs a greedy strategy after sorting both sets of points.
 *
 * Input format:
 * The first line contains an integer N, representing the number of red points and blue points.
 * The next N lines contain two space-separated integers (x, y) for each red point.
 * The following N lines contain two space-separated integers (x, y) for each blue point.
 *
 * Output:
 * A single integer, which is the maximum number of valid pairings found.
 */

// The entire logic is encapsulated within an Immediately Invoked Function Expression (IIFE).
// The result of this IIFE is then printed to the console.
console . log (
  (
    args => { // This anonymous arrow function takes the raw input string as its argument.

      // --- Input Parsing and Initial Setup ---

      // First, trim any leading/trailing whitespace from the input string.
      // Then, split the string into an array of lines based on newline characters.
      // Each line (row 'r') is further split by spaces, and its components ('v')
      // are converted to integers using the bitwise OR operator with 0 (v | 0).
      // The first element of the processed array (which is the first line's parsed values)
      // is destructured to extract N, and the rest goes into a temporary array 'tmp'.
      const [ [ N ] , ... tmp ] = args . trim ( ) . split ( '\n' ) . map (
        r => r . split ( ' ' ) . map ( v => v | 0 )
      ) ;

      // Divide the 'tmp' array into two distinct arrays: 'rp' for red points
      // and 'bp' for blue points. 'N' determines the size of each set.
      const rp = tmp . slice ( 0 , N ) , // Red points occupy the first N elements.
            bp = tmp . slice ( N , 2 * N ) ; // Blue points occupy the next N elements.

      // --- Sorting Points ---

      // Sort the red points array 'rp' in ascending order based on a specific criterion:
      // the minimum of a point's x-coordinate or y-coordinate. This sorting strategy
      // is crucial for the greedy approach to work correctly.
      rp . sort (
        ( a , b ) => Math . min ( a [ 0 ] , a [ 1 ] ) - Math . min ( b [ 0 ] , b [ 1 ] )
      ) ;

      // Similarly, sort the blue points array 'bp' using the exact same sorting criterion.
      // Consistent sorting across both sets is vital for the matching logic.
      bp . sort (
        ( a , b ) => Math . min ( a [ 0 ] , a [ 1 ] ) - Math . min ( b [ 0 ] , b [ 1 ] )
      ) ;

      // --- Pairing Logic ---

      // Initialize a counter for the number of successful pairings.
      let count = 0 ;

      // Initialize 'next', an index pointer for the blue points array.
      // This optimization ensures that a blue point, once considered (or skipped),
      // is not re-evaluated for preceding red points, improving efficiency.
      let next  = 0 ;

      // Iterate through each red point.
      for ( let i = 0 ; i < N ; i ++ ) {

        // For the current red point (rp[i]), iterate through the blue points
        // starting from the 'next' available blue point.
        for ( let j = next ; j < N ; j ++ ) {

          // Check if the current red point can be paired with the current blue point.
          // The pairing condition is that both x and y coordinates of the red point
          // must be strictly less than those of the blue point.
          if ( rp [ i ] [ 0 ] < bp [ j ] [ 0 ] && rp [ i ] [ 1 ] < bp [ j ] [ 1 ] ) {

            count ++ ; // If a valid pair is found, increment the counter.
            next = j + 1 ; // Update 'next' to point to the blue point immediately after the current one.
                           // This ensures that the current blue point is not reused and
                           // subsequent red points start searching from an appropriate position.
            break ;        // Break out of the inner loop because this red point has found its match.
          }
        }
      }

      // --- Result Output ---

      // Convert the final count of successful pairings to a string and return it.
      // This string will then be printed to the console by the `console.log` call.
      return `${ count }`;
    }
  ) (
    // This is the argument passed to the IIFE:
    // It reads the entire content of '/dev/stdin' (standard input) synchronously
    // using Node.js's 'fs' module, and decodes it as a UTF-8 string.
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
  )
) ;