/* This is a Type I clone example.
 * It demonstrates extensive modifications to whitespace and comments
 * without altering the core logic or structure of the JavaScript code.
 *
 * The purpose of this script is to perform a specific calculation
 * based on a numerical input provided via standard input.
 *
 * Key operations include:
 * - Parsing an integer from the input.
 * - Performing integer division and modulo operations.
 * - Applying mathematical functions like Math.floor and Math.ceil.
 * - Outputting the final result.
 */
"use strict" ; // Enforces strict mode for cleaner, safer JavaScript.


  const main   =   (  arg  )   =>    { // Defines the main function that processes the input.
      // The input argument `arg` is expected to be a string.
      // First, remove any leading/trailing whitespace from the input string.
      // Then, split the string into an array of lines based on the newline character.
      arg    =    arg . trim ( ) . split ( "\n" ) ;


      // Extract the first number from the first line of the processed input.
      // `arg[0]` gets the first line.
      // `.split(" ")` splits the first line by spaces.
      // `[0]` takes the first part (assuming the number is the first element).
      // `parseInt()` converts this string part into an integer.
      const N     =     parseInt (  arg [ 0 ] . split ( " " ) [ 0 ]  ) ;

      // Perform calculations based on the extracted number `N`.
      // `temp` stores the result of integer division of N by 11.
      let   temp     =     Math . floor (  N   /   11  ) ; // Calculates the quotient when N is divided by 11.
      // `rest` stores the remainder when N is divided by 11.
      let   rest     =     N   %   11 ; // Calculates the remainder of N divided by 11.


      // Finally, compute the result and print it to the console.
      // The formula is (temp * 2) + ceil(rest / 5).
      console . log (  (  temp   *   2  )   +   Math . ceil (  rest   /   5  )  ) ;
  } // End of the main function definition.

// This line reads data from standard input ('/dev/stdin'),
// decodes it as UTF-8, and then passes it to the `main` function for processing.
main (  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )  ) ;