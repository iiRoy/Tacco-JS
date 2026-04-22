/*
 * This is a JavaScript program designed to read input,
 * process it, and then print a specific result.
 *
 * It's a simple utility function.
 */
function   Main
  (
    input   // The raw input string provided to the function
  )
{ /* Function body starts here */

  // Declare a variable 'arr' to store processed input lines.
  // First, trim any leading/trailing whitespace from the input string.
  // Then, split the string into an array of lines using the newline character.
  var   arr   =   input . trim ( ) . split ( "\n" ) ;

  // Remove the first element from the array.
  // This is often done to discard a header or a count line that is not needed.
  arr . shift ( ) ;

  /*
   * Sort the remaining elements of the array alphabetically (lexicographically).
   * After sorting, access the first element of the sorted array (which will be the smallest).
   * Finally, print this smallest element to the console's standard output.
   */
  console . log ( arr . sort ( ) [ 0 ] ) ;

} // End of Main function definition

// This line calls the 'Main' function to execute the program logic.
// It reads the entire content of standard input (/dev/stdin) as a UTF-8 encoded string,
// and then passes this string as the 'input' argument to the Main function.
Main  ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;