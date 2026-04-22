/* This script reads input from stdin, processes each line,
 * and prints a single digit result for each line. */

  var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
  // The above line reads the entire standard input as a string.

var lines =   input . split ( '\n' ) ; /* Split the input string into an array of lines
                                        using the newline character as a delimiter. */

  var j = 0   ; // Initialize a counter for iterating through the lines.

while
  ( j < lines . length - 1 ) // Loop through each line, excluding the last one (often empty).
{

  var str   =   lines [ j ]   ; // Get the current line as a string.

  var nums  = str . split ( '' ) . map ( Number ) ; /* Convert the string into an array of
                                                        individual digits (numbers). */

  var next  ; // Declare a variable to hold the next array of numbers.

  while   (   nums . length   >   1   )   // Continue processing until only one number remains.
  {

    next  =   [ ]   ; // Initialize an empty array for the next iteration.

    for   ( var i = 0 ; i < nums . length - 1 ; i ++ )
    { // Iterate through the current array of numbers to generate the next one.

      /* Calculate the sum of adjacent numbers,
       * take the modulo 10, and store it in the 'next' array. */
      next [ i ]   =   (   nums [ i ]   +   nums [ i + 1 ]   )   %   10   ;

    } // End of the for loop.


    nums  =   next ; // Replace the current 'nums' array with the newly generated 'next' array.

  } // End of the inner while loop.


  console . log ( nums [ 0 ] ) ; // Print the final single digit result for the current line.


  j ++ ; // Increment the line counter.

} // End of the outer while loop.

/* Script execution finished. */