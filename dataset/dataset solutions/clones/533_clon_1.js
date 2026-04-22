/* This is a Type I clone example. */
"use strict" ; // Enforces strict mode for cleaner code.

// This function processes the input.

function   Main  ( input )  {

      // Declare a constant to store the split input.
      const   ab   =   input . split ( " " ) ;

      /*
       * Calculate the average of the two numbers.
       * The numbers are at index 0 and 1 after splitting.
       */
      console . log (   ( ab[ 0 ]   +   ab[ 1 ] )   /   2   ) ;

} // End of Main function.


// Call the Main function with input read from stdin.
Main  ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;