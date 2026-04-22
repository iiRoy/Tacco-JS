/*
 * This is a Type I clone generated to demonstrate
 * extensive whitespace and comment variations.
 * All identifiers and logic remain absolutely identical
 * to the original source code.
 */
// Start of the Immediately Invoked Function Expression (IIFE)
(
  ( input ) =>
  {
    // Begin processing the input data provided to the IIFE.
    // This input is expected to be a string containing multiple lines.


    // First, split the entire input string by newline characters
    // to get an array of individual lines.
    const data = input  .  split ( '\n' ) ;


    // Extract the first line of the data array.
    // This line contains the parameters N and D, separated by a space.
    const line1 = data [ 0 ] . split ( ' ' ) ;


    // Parse N (number of coordinate sets) from the first element of line1.
    // The unary plus operator converts the string to a number.
    const N     =   +line1 [ 0 ] ;


    // Parse D (dimension of the coordinate space) from the second element of line1.
    // Again, using the unary plus for type conversion.
    const D     =   +line1 [ 1 ] ;


    // A blank line for visual separation before processing coordinates.


    // Now, process the remaining lines to get the coordinate arrays.
    // We slice the data from the second line (index 1) up to N lines after that (N + 1).
    // Each line represents a set of coordinates.
    const coords = data . slice ( 1, N + 1 ) . map (
      ( line ) =>
      {
        // Inside the map function, for each coordinate line:
        // 1. Replace any occurrences of multiple spaces with a single space
        //    to normalize the input (e.g., "1  2   3" becomes "1 2 3").
        // 2. Split the normalized line by space to get an array of string numbers.
        // 3. Filter out any empty strings that might result from splitting
        //    (e.g., if there were leading/trailing spaces or multiple spaces between numbers).
        //    The `Boolean` function is used as a truthy check.
        // 4. Convert all resulting string numbers to actual numbers using the `Number` constructor.
        return line . replace ( /\s\s/g, ' ' )
                     . split ( ' ' )
                     . filter ( Boolean )
                     . map ( Number ) ;
      }
    ) ; // End of coords assignment and map operation


    // The main logic: calculate the total number of pairs of coordinates
    // whose Euclidean distance is an integer.
    // The result is printed to the console.
    console . log (
      coords . reduce (
        ( total , coord1 , i ) =>
        (
          // For each coordinate 'coord1' at index 'i',
          // we iterate through the subsequent coordinates 'coord2'
          // to form unique pairs.
          total + coords . slice ( i + 1 ) . reduce (
            ( count , coord2 ) =>
            (
              // Check if the distance between coord1 and coord2 is an integer.
              // The `distance` helper function calculates the Euclidean distance.
              // `Number.isInteger` returns true if the number is an integer.
              Number . isInteger ( distance ( coord1 , coord2 , D ) )
                ? count + 1 // If it's an integer, increment the count for this inner reduction.
                : count       // Otherwise, keep the count as is.
            ) ,
            0 // Initial value for the inner reduce (count of integer distances for current coord1).
          )
        ) ,
        0 // Initial value for the outer reduce (total count across all coord1).
      )
    ) ; // End of console.log statement
// End of the main IIFE block
  }
)
(
  // The argument passed to the Immediately Invoked Function Expression:
  // This line reads the input from standard input synchronously.
  // `require("fs")` imports the Node.js file system module.
  // `readFileSync("/dev/stdin", "utf8")` reads the content of /dev/stdin
  // (standard input) as a UTF-8 encoded string.
  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ; // End of the IIFE invocation and statement.


// A blank line to separate the main logic from the helper function definition.


/**
 * Calculates the Euclidean distance between two points in D-dimensional space.
 * This is a helper function used by the main logic.
 *
 * @param {Array<number>} coords1 - The first coordinate array (e.g., [x1, y1, z1]).
 * @param {Array<number>} coords2 - The second coordinate array (e.g., [x2, y2, z2]).
 * @param {number} D - The dimension of the coordinate space (e.g., 2 for 2D, 3 for 3D).
 * @returns {number} The Euclidean distance between the two points.
 */
function distance ( coords1 , coords2 , D )
{
  // The Math.hypot function calculates the square root of the sum of squares
  // of its arguments. It's perfect for Euclidean distance.
  // We use `apply` to pass an array of differences as individual arguments.
  return Math . hypot . apply (
    null , // The 'this' context for Math.hypot (not important here, so null is fine).
    Array ( D ) . fill ( null ) . map (
      ( _ , i ) =>
      (
        // For each dimension 'i', calculate the difference between the
        // corresponding coordinates of coords1 and coords2.
        coords1 [ i ] - coords2 [ i ]
      )
    )
  ) ; // End of return statement for the distance function
} // End of distance function definition