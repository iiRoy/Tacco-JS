/*
 * This is a Type I clone of a JavaScript program.
 * It processes input to count specific string patterns.
 *
 * Definition of Type I clone:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * Therefore, all identifiers, variable names, function names,
 * operators, and expressions remain precisely as they were
 * in the original source code.
 *
 * Only whitespace (indentation, spacing, blank lines)
 * and comments (additions, modifications, or removals)
 * have been altered to create visual distinction without
 * affecting the program's logical execution or structure.
 */

'use strict' ; // Enforce strict mode for cleaner code execution.

/**
 * Main function to process the input and compute the result.
 *
 * @param {string} input - The raw input string from stdin.
 */
function Main ( input ) {


  // Trim leading/trailing whitespace and split the input string by any sequence of whitespace characters.
  input = input . trim ( ) . split ( / \s+ / ) ;


  /*
   * The first element of the input array is N.
   * We shift it off and convert it to a number.
   * N is actually not used in the original calculation, but it's part of the input.
   */
  var N = input . shift ( ) - 0 ;


  // Calculate the count of strings ending with 'A'.
  var rightA = input . reduce ( ( acc , str ) => acc + ( str [ str . length - 1 ] === 'A' ? 1 : 0 ) , 0 ) ;


  // Calculate the count of strings starting with 'B'.
  var leftB = input . reduce ( ( acc , str ) => acc + ( str [ 0 ] === 'B' ? 1 : 0 ) , 0 ) ;


  // Calculate the count of strings that both start with 'B' AND end with 'A'.
  var both = input . reduce ( ( acc , str ) => acc + ( ( str [ 0 ] === 'B' && str [ str . length - 1 ] === 'A' ) ? 1 : 0 ) , 0 ) ;


  // Calculate the total number of 'AB' occurrences across all strings.
  // This is done by splitting each string by 'AB' and subtracting 1 from the length of the resulting array.
  var AB = input . reduce ( ( acc , str ) => acc + str . split ( 'AB' ) . length - 1 , 0 ) ;


  /*
   * Determine the minimum number of 'A's at the end and 'B's at the beginning.
   * This variable 'm' represents the maximum number of times we can form "BA" pairs
   * by combining words that start with 'B' and words that end with 'A'.
   */
  var m = Math . min ( rightA , leftB ) ;


  // Special case: If all strings that end with 'A' also start with 'B',
  // and all strings that start with 'B' also end with 'A' (i.e., all 'both' strings),
  // and these counts are equal, then we can form one less "BA" pair.
  // This handles scenarios like ["BA", "BA"], where 'both' is 2, 'rightA' is 2, 'leftB' is 2.
  // In such a case, we can only form one 'BA' pair if we consider connecting them.
  if ( both === rightA && rightA === leftB ) m -- ;


  // Output the final result: total 'AB' occurrences plus the calculated 'm' value.
  console . log ( AB + m ) ;

}

// This line reads the input from '/dev/stdin' and passes it to the Main function.
// The 'utf8' encoding is specified for proper character handling.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
// End of program execution.
/*
 * This concludes the Type I clone.
 * All logical components are identical to the original.
 */