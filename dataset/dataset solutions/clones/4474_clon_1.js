/*
 * This is a JavaScript source file that implements a specific algorithm.
 * It processes numerical input to find the sum of the largest K elements.
 * This script is designed for environments that support Node.js file system operations.
 */

'use strict' // Activate strict mode to catch common coding errors and "unsafe" actions.


// Define the primary function that encapsulates the application's core logic.
const    main =  ( input  )   =>   {

  // The raw input string is split into an array of strings, with each element representing a line.
  input   =   input .  split ( '\n' )

  // From the first line of input, extract the first number, which represents N.
  const   N   =   parseInt ( input [ 0 ] . split ( ' ' ) [ 0 ] )
  // Also from the first line, extract the second number, which represents K.
  const   K   =   parseInt ( input [ 0 ] . split ( ' ' ) [ 1 ] )


  /*
   * Process the second line of the input data:
   * 1. Split the string by spaces to get individual number strings.
   * 2. Use the 'map' function to convert each string element into its integer equivalent.
   * 3. Sort the resulting array of integers in descending order (largest to smallest).
   *    The comparison function (a, b) => b - a achieves this.
   */
  const   ls   =   input [ 1 ] . split ( ' ' ) . map ( v   =>   parseInt ( v ) ) . sort ( ( a ,   b )   =>   b   -   a )


  let   sum   =   0 // Initialize a variable named 'sum' to store the total, starting at zero.

  // Begin a loop that iterates 'K' times to sum the largest elements.
  for ( let   i   =   0 ;   i   <   K ;   i ++ ) {

    sum   +=   ls [ i ] // Add the i-th element (which is one of the K largest) to the running sum.
  }


  // Output the final calculated sum to the standard console.
  console . log ( sum )

} // End of the 'main' function definition.


/*
 * This section of the code serves as the execution entry point.
 * It reads the entire content of the standard input stream ('/dev/stdin').
 * The content is then decoded using 'utf-8' encoding.
 * Finally, the decoded input string is passed to the 'main' function for processing.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf-8' ) )