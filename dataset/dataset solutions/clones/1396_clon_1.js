/*
 * This JavaScript file processes input from standard input.
 * It performs arithmetic operations and prints the results.
 * This is the primary function definition for the application.
 */
function  Main ( input )

{
  // Declare a local variable 'a'.
  // It will store an array of numbers derived from the input string.
  // The input string is split by spaces, and each part is converted to a number.
  var    a   =   input . split ( " " ) . map ( Number ) ;


  // Output the results to the console.
  // The format string "%d %d %f" expects two integers and one float.
  // The first value is the integer division of a[0] by a[1].
  // The second value is the remainder of a[0] divided by a[1].
  // The third value is the floating-point division of a[0] by a[1].
  console . log ( "%d %d %f" ,    a [ 0 ]   /   a [ 1 ] ,   a [ 0 ]   %   a [ 1 ] ,   a [ 0 ]   /   a [ 1 ] )

; // Concluding semicolon for the console.log statement
} /* End of Main function */


// The application entry point.
// It reads the entire content of the standard input file (/dev/stdin).
// The 'fs' module is used for file system operations, specifically 'readFileSync'.
// The acquired content is then passed to the 'Main' function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ) ) ;