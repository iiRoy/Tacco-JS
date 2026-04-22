/* This is a Type I code clone generated according to the official definition.
 * All syntactic and semantic elements (identifiers, operators, expressions,
 * keywords, literals) remain absolutely identical to the original source.
 *
 * The only modifications are:
 * - Extensive changes to whitespace (indentation, line breaks, spacing).
 * - Addition of numerous comments (both single-line and multi-line).
 *
 * The purpose is to demonstrate a visually distinct but functionally and
 * structurally equivalent piece of code, strictly adhering to the Type I
 * cloning criteria.
 */
'use strict' ; // Activating strict mode for the entire script to catch common coding errors.

// Define the primary function that processes the input data for the problem.
function  main  (  input  )
{
  // Start of a multi-step input processing chain.
  input
    =
    input
      .trim ( ) // First, remove any leading or trailing whitespace from the raw input string.
      .split ( ' ' ) // Next, divide the string into an array of substrings, using a space as the delimiter.
      .map (
        v   =>   // For each substring 'v' in the newly created array...
        Number ( v ) // ...convert it into its numerical representation.
      ) ; // This completes the transformation of the input string into an array of numbers.

  // Extract the first numerical value from the processed input array.
  // This value represents the upper bound 'k' for the variables.
  const   k   =   input [ 0 ] ;

  // Extract the second numerical value from the processed input array.
  // This value represents the target sum 's' that x + y + z must equal.
  const   s   =   input [ 1 ] ;

  // Initialize a counter variable. This will store the total number of valid combinations found.
  let   count   =   0 ;

  // Begin the outer loop: Iterate the first variable, 'xi', starting from 0.
  // 'xi' will increment by 1 in each step, up to and including 'k'.
  for   (   let   xi   =   0 ;   xi   <=   k ;   xi ++   )
  {
    // Begin the inner loop: Iterate the second variable, 'yi', also starting from 0.
    // 'yi' will increment by 1 in each step, up to and including 'k'.
    for   (   let   yi   =   0 ;   yi   <=   k ;   yi ++   )
    {
      // Calculate the potential value for the third variable.
      // If xi + yi + z = s, then z = s - (xi + yi). We name this 'tmp'.
      const   tmp   =   s   -   (   xi   +   yi   ) ;

      // Check if the calculated 'tmp' (representing the third variable) is valid.
      // A valid 'tmp' must be non-negative (>= 0) and not exceed 'k' (<= k).
      if   (   tmp   >=   0   &&   tmp   <=   k   )
      {
        count ++ ; // If 'tmp' is valid, increment our counter for valid combinations.
      }
    } // End of the inner loop (for 'yi').
  } // End of the outer loop (for 'xi').

  // After all combinations have been checked, output the final tally of valid combinations.
  console . log ( count ) ;
} // End of the main function definition.

// This line executes the 'main' function.
// It reads input from the standard input stream, typically used in competitive programming environments.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ; // The 'fs' module is used to read the file synchronously.