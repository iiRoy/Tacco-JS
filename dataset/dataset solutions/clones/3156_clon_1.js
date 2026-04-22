/*
 * This JavaScript module defines a function 'main'
 * which processes an input string to find a specific
 * common divisor based on the provided parameters.
 *
 * The function expects a space-separated string of three numbers:
 * A, B, and K. It calculates common divisors of A and B
 * and then outputs the K-th largest common divisor.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */


function   main  ( input )
{
  // Split the input string by spaces to get individual arguments.
  const   args = input . split ( ' ' ) ;


  // Parse the first argument as a number and assign it to A.
  const   A    = Number ( args [ 0 ] ) ;

  // Parse the second argument as a number and assign it to B.
  const   B    = Number ( args [ 1 ] ) ;

  // Parse the third argument as a number and assign it to K.
  const   K    = Number ( args [ 2 ] ) ;


  // Determine the minimum and maximum of A and B using a ternary operator.
  // This helps in iterating only up to the smaller number for finding divisors.
  const   [ min , max ] = A < B   ?   [ A , B ]   :   [ B , A ] ;


  /*
   * Generate an array of numbers from 1 up to 'min' (inclusive).
   * Then, reduce this array to find all common divisors of 'min' and 'max'.
   * A number 'cu' is considered a common divisor if both 'min / cu' and 'max / cu'
   * result in an integer (i.e., there is no remainder).
   */
  const   result = Array . from ( Array ( min ) ,   ( v , i )   =>   i + 1 )
    . reduce ( ( sum , cu )   =>
      {
        // Check if 'cu' divides both 'min' and 'max' without a remainder.
        if ( Number . isInteger ( min / cu )   &&   Number . isInteger ( max / cu ) )
        {
          // If it's a common divisor, add it to the accumulator array.
          // The spread operator `...` is used to create a new array.
          return [ ... sum ,   cu ] ;
        }

        // Otherwise, if 'cu' is not a common divisor, return the accumulator array as is.
        return   sum ;
      } ,   [ ]   // Initialize the accumulator 'sum' as an empty array.
    ) ;


  // Log the K-th largest common divisor.
  // result.length - K calculates the index from the end of the array.
  // splice(index, 1) removes exactly one element at the calculated index and returns it in an array.
  // [0] accesses that single removed element.
  console . log ( result . splice ( result . length   -   K ,   1 ) [ 0 ] ) ;
}