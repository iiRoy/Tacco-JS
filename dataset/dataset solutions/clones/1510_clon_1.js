// This file enforces strict mode for better code quality.
'use strict';

/*
 *  Main function definition.
 *  It takes a single 'input' argument, which is expected to be a string.
 */
function   Main ( input )
{

  // Parse the input string into an integer after trimming whitespace.
  input = parseInt ( input.trim ( ) ) ;


  // Initialize a variable 'b' to 1.
  // Note: This 'b' is shadowed by the inner loop's 'b'.
  let   b   =   1 ;

  // Initialize a counter variable.
  let   count   =   0   ;


  // Outer loop: iterates with variable 'a' from 1 up to (but not including) 'input'.
  for ( let   a   =   1   ;   a   <   input   ;   a ++ )
  {
    // Inner loop: iterates with variable 'b' from 1 up to (but not including) 'input'.
    for ( let   b   =   1   ;   b   <   input   ;   b   ++ )
    {

      // Check if the product of 'a' and 'b' exceeds the 'input' value.
      // If it does, there's no need to continue with this 'a' for larger 'b' values.
      if ( a   *   b   >   input )
      {
        break ; // Exit the inner loop.
      }

      // Check if the difference between 'input' and the product 'a * b' is not zero.
      // This is equivalent to checking if 'input' is not perfectly divisible by 'a * b',
      // or more precisely, if input - (a*b) is not 0, which means input != a*b.
      if ( input   -   a   *   b   !==   0 )
      {
        // Increment the counter if the condition is met.
        count ++ ;
      }
    }
  }

  // After all iterations, print the final count to the console.
  console.log ( count ) ;
}


// --- DO NOT MODIFY THE FOLLOWING SECTION ---
// This part handles reading input from standard input and calling the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;