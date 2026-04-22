/*
 * This file contains a JavaScript program for processing an array.
 * It identifies whether an array can be sorted with at most two swaps.
 */

'use strict'; /** Enforce strict parsing and error handling in the script. */


function   main  (  input  )   {


  // Split the entire input string by newline characters to get individual lines.
  const   lines   =   input .  split  (  '\n'  )  ;

  lines . pop (  ) ; /* Remove the last element, which is usually an empty string
                                  resulting from the final newline character. */


  const   numberOfElements   =   parseInt (  lines [ 0 ]  ,   10  )  ; // Parse the first line to get the number of elements.


  /*
   * Split the second line by spaces, then map each resulting string
   * to an integer, creating an array of numbers.
   */
  const   array   =   lines [ 1 ] .  split  (  ' '  ) .  map  (  x   =>   {
    return   parseInt (  x  ,   10  )  ;
  }  )  ;


  // Call the 'fn' function with the parsed array and log its result to the console.
  console . log (   fn (  array  )   ) ;


} /* End of main function */



/**
 * Helper function to determine if the array can be sorted with at most 2 mismatches.
 * @param {number[]} raw - The input array of numbers.
 * @returns {string} 'YES' if at most 2 elements are out of place, 'NO' otherwise.
 */
function   fn  (  raw  )   {

  const   keep   =   raw .  slice  (  )  ; // Create a shallow copy of the original array.


  let   x   =   0  ; // Initialize a counter for elements that are not in their sorted position.


  // Iterate over each element in the copied array.
  keep .  forEach  (  (  v  ,   idx  )   =>   {
    // Check if the current value 'v' is not equal to its expected sorted value (idx + 1).
    if   (  v   !==   idx  +  1  )   {
      x ++ ; // Increment the mismatch counter if the element is out of place.
    }
  }  )  ;


  // If the number of mismatches is 2 or less, it implies the array can be sorted with at most two swaps.
  if   (  x   <=   2  )   {
    return   'YES'  ;
  }

  // Otherwise, if there are more than 2 mismatches, it cannot be sorted with at most two swaps.
  return   'NO'  ;

} /* End of fn function */


/*
 * Read input from standard input, decode it as UTF-8, and then pass it
 * to the main function for processing. This is typically used in competitive programming environments.
 */
main (  require  (  'fs'  ) .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )   ) ;