/*
 * This is a JavaScript file that processes input and prints a result based on simple
 * conditional logic. It's designed to read three space-separated values from standard
 * input and apply specific comparison rules.
 */


'use strict' ; // Enforces stricter parsing and error handling in the code.


// Define the main function responsible for handling the program's logic.
function   Main ( INPUT )
{
  // --- Input Processing Section ---

  /*
   * The input is expected to be a string.
   * First, split the INPUT string by newline character ('\n') to get an array of lines.
   * We only care about the first line, so we access it using index [0].
   * Then, split this first line by space character (' ') to get an array of individual string values.
   * This array will contain the three values needed for comparison.
   */
  const   input   =   INPUT . split ( "\n" ) [ 0 ] . split ( " " ) ;

  // --- Conditional Logic Section ---

  // Check if the first value is strictly equal to the second value.
  if   (   input [ 0 ]   ==   input [ 1 ]   )
  {
    // If input[0] and input[1] are identical, then print the third value.
    console . log ( input [ 2 ] ) ;
  }
  else
  {
    /*
     * If input[0] and input[1] are not identical, proceed to an alternative condition.
     * Use a ternary operator for a concise comparison:
     * - If input[0] is equal to input[2], then print input[1].
     * - Otherwise (if input[0] is not equal to input[2]), print input[0].
     */
    console . log (   input [ 0 ]   ==   input [ 2 ]   ?   input [ 1 ]   :   input [ 0 ]   ) ;
  }
} // End of the Main function definition.


// --- Program Entry Point ---

// This line executes the Main function.
// It reads the content of '/dev/stdin' (standard input) as UTF-8 encoded text.
// The 'fs' (file system) module is required to perform this file read operation.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;

// --- End of Script ---