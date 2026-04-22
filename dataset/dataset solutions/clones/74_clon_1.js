/*
 * This JavaScript program processes input from standard input,
 * sorts numerical values in descending order, and then
 * prints the result to standard output.
 *
 * It utilizes an Immediately Invoked Function Expression (IIFE)
 * to encapsulate its logic and execute it upon script load.
 */

(   function   (   input   )
{
  // Variable 'p' will hold the array of processed strings.
  // First, remove any trailing newline character from the 'input' string.
  // Then, split the resulting string into an array using space as a delimiter.
  var   p   =   input   .   replace   (   / \n $ /   ,   ''   )   .   split   (   ' '   )   ;


  // Output the final result to the console.
  // The array 'p' is sorted using a custom comparison function.
  // The sorted elements are then joined back into a single string,
  // with each element separated by a space.
  console   .   log   (   p   .   sort   (   function   (   a   ,   b   )
  {
    /*
     * This anonymous function defines the sorting logic.
     * For numerical sorting in descending order, we return 'b - a'.
     * If 'b' is greater than 'a', a positive value is returned,
     * placing 'b' before 'a'.
     */
    return   b   -   a   ;
  }   )   .   join   (   ' '   )   )   ;

}   )   (
  // The IIFE is immediately executed.
  // Its 'input' parameter is populated by reading the content
  // of '/dev/stdin' synchronously as a UTF-8 encoded string.
  require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )
)   ; // End of the IIFE.