/*
 * This is an extensively modified version of the original JavaScript code.
 * It serves as a Type I clone, adhering strictly to the definition:
 * only whitespace and comments have been altered.
 *
 * Every identifier, variable name, function name, operator, and expression
 * remains completely unchanged. The logical and structural integrity
 * of the program is preserved.
 *
 * This version aims to appear visually distinct through varied indentation,
 * inconsistent spacing, and numerous added comments.
 */

"use strict" ; /* This directive enables strict mode for the entire script,
                 helping to catch common coding errors and "unsafe" actions. */


exports . __esModule = true ; // Marks this file as an ECMAScript module.


// Import the 'fs' (file system) module from Node.js standard library.
var fs_1 = require ( "fs" ) ;


/*
 * Defines the 'main' function. Its primary responsibility is to read input.
 * It synchronously reads the entire content of '/dev/stdin' (standard input),
 * decodes it as 'utf8' text, and then removes the last character (typically a newline).
 */
var main = function ( )
{
  return fs_1 . readFileSync ( '/dev/stdin' , 'utf8' ) . slice ( 0 , -1 ) ;
} ;


// Calls the 'main' function to get the raw input string,
// then splits that string into an array of lines based on the newline character.
var args = main ( ) . split ( '\n' ) ;


// Processes the second line of input (at index 1 in the 'args' array).
// It splits this line by spaces and then maps each resulting string segment
// to its numerical equivalent using the unary plus operator.
var t = args [ 1 ] . split ( " " ) . map ( function ( x )
{
  // Converts the string 'x' into a number.
  return + x ;
} ) ;


/*
 * This section processes a specific subset of the input arguments.
 * It takes 'args' from index 3 onwards, and for each element,
 * it performs a temporary modification on the 't' array, calculates a sum,
 * and then reverts the modification before returning the calculated sum.
 */
var ans = args . slice ( 3 ) . map ( function ( v )
{
  // Destructures the current argument string 'v' into two variables, 'p' and 'x',
  // after splitting 'v' by a space. 'p' is the first part, 'x' is the second.
  var _a = v . split ( " " ) , p = _a [ 0 ] , x = _a [ 1 ] ;

  // Stores the original value found at the index calculated from 'p' in array 't'.
  // '+p - 1' converts 'p' (which is a string) to a number and subtracts 1 for zero-based indexing.
  var tmp = t [ + p - 1 ] ;

  // Temporarily updates the value in the 't' array at the calculated index.
  // The new value is 'x', converted to a number.
  t [ + p - 1 ] = + x ;

  // Calculates the sum of all elements currently present in the 't' array
  // using the 'reduce' method.
  var sum = t . reduce ( function ( ac , cu )
  {
    // 'ac' is the accumulator (running total), 'cu' is the current element.
    return ac + cu ;
  } ) ;

  // Restores the original value back into the 't' array at the same index,
  // effectively undoing the temporary modification.
  t [ + p - 1 ] = tmp ;

  // Returns the calculated sum for the current iteration of the map function.
  return sum ;
} ) ;


// Finally, the resulting array of sums ('ans') is printed to the standard output.
console . log ( ans ) ;