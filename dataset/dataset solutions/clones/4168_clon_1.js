"use strict" ;

// This is the primary function definition for the application.
// It handles the core logic of processing the input data.
function   main   (   input   )
{
  /*
   * First, we declare a constant variable named 'args'.
   * This variable will hold the result of a series of operations on the 'input' string.
   *
   * 1. 'input.trim()' removes any leading or trailing whitespace from the input.
   * 2. '.split('')' then breaks the trimmed string into an array of individual characters.
   * 3. '.filter(_=>_==1)' processes this array, keeping only those characters that are strictly equal to the digit '1'.
   *    The arrow function `_ => _ == 1` is a concise way to define the filtering condition.
   */
  const   args   =   input . trim ( ) . split ( '' ) . filter (   _ => _ == 1   ) ;

  // After filtering, we log the number of '1's found in the input.
  // 'args.length' gives us the count of elements in the filtered array.
  console . log (   args . length   ) ;

} // End of the 'main' function.


// This section of the code initiates the program execution.
// It calls the 'main' function with the content read from standard input.
main (   require ( 'fs' ) . readFileSync (   '/dev/stdin' ,   'utf8'   )   ) ;

// Program execution concludes here.