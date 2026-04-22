"use strict" /* This directive enforces strict mode for the entire script. */ ;


  function   fx  ( x )   {  // Defines a recursive function named 'fx' that takes one argument 'x'.


    if  ( x  ==  1 )   {  // Base case: if 'x' is equal to 1.
      return   1  ; /* Return the value 1. */
    }


    /* Recursive step:
     * If 'x' is not 1, call 'fx' with 'x/2',
     * then multiply the result by 2 and add 1.
     */
    return   fx ( x  /  2 )  *  2  +  1  ;
  }



/*
 * The Main function serves as the entry point for processing input.
 * It reads from standard input, processes it, and prints the result.
 */
function   Main ( input )   {


  input   =   input . trim ( ) ;  // Remove leading and trailing whitespace from the input string.
  let   h   =   Number ( input ) ;  /* Convert the trimmed input string to a number. */


  let   ans   =   fx ( h ) ;  // Call the 'fx' function with the numeric input 'h' and store the result.


  console . log ( ans ) ;  /* Print the final answer to the console. */
}


// This line executes the Main function.
// It reads content from /dev/stdin using Node.js 'fs' module.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;