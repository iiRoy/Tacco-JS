/*
 * This file contains a JavaScript program designed to perform a specific calculation.
 * It is a Type I clone, meaning its logical structure and all identifiers,
 * operators, and expressions are identical to an original source.
 * Only whitespace and comments have been altered for visual differentiation.
 */

// The primary function that encapsulates the core logic.
function       Main ( input   )
{
  // Declare a variable 'a' to store the processed input.
  // The input string is split by a space character.
  var        a     =     input .  split ( ' ' )   ;


  // Perform the main calculation and print the result to the console.
  // The calculation involves:
  // 1. Raising 100 to the power of the first input number (a[0]),
  //    after converting it to an integer using the bitwise right shift operator (>> 0).
  // 2. Multiplying the result by the second input number (a[1]),
  //    also converted to an integer using (>> 0).
  console .  log ( Math .  pow ( 100 , a [ 0 ] >> 0 ) * ( a [ 1 ] >> 0 ) ) ;

} // End of the Main function definition.


// This section handles reading input from the standard input stream
// and then passing it to the Main function for processing.
// It uses Node.js's 'fs' module to read the file synchronously.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

/*
 * End of the JavaScript program.
 * All functionalities are preserved exactly as in the original.
 */