/*
 * This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition of a Type I clone,
 * meaning only whitespace and comments have been altered.
 * All identifiers, operators, and expressions remain identical.
 */

// Enforce strict mode for better error handling and cleaner code.
'use strict';


// Define the main function that processes the input.
function   Main (  input   )   {

  // Parse the first number from the input string.
  const   A   =   Number(  input  .  split(' ')  [  0  ]  )  ;

  // Parse the second number from the input string.
  const   B   =   Number(  input  .  split(' ')  [  1  ]  )  ;

  // Check if both numbers are less than or equal to 8.
  if   (   A   <=   8   &&   B   <=   8   )
  {
    // If the condition is met, print a positive message.
    console . log ( 'Yay!' ) ;
  }
  else
  {
    // Otherwise, print a negative message.
    console . log ( ':(' ) ;
  }

} // End of Main function definition.


// Read input from standard input, trim whitespace, and pass it to the Main function.
Main  (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( )  )  ;

// EOF