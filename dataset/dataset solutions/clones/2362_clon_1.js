/* This script processes input to compare two numeric values.
 * It strictly adheres to modern JavaScript practices.
 */

"use strict"
; // Enforce strict parsing and error handling in the code.


/**
 * The main entry point function for processing the input.
 * @param {string} input - The raw input string provided to the script.
 */
function     Main (  input )
{
  // Split the entire input string by newline characters to get individual lines.
  let   lines = input . split  (  '\n'  ) ;


  /* Extract the first number from the first line.
   * It takes the first part after splitting by space and converts it to a number.
   */
  let M1    = lines[0] . split(' ') [0]   * 1;


  // Similarly, extract the second number from the second line.
  let M2 = lines [1] . split (' ') [0] *  1
  ;


  // Log the result of the comparison: true if M1 is NOT equal to M2, false otherwise.
  console . log ( ! ( M1 === M2 ) ) ;

} /* End of Main function definition. */



// Execute the Main function with input read from standard input.
// This part handles file system operations to get the input.
Main (
  require ( "fs" )
    . readFileSync ( "/dev/stdin" , "utf8" )
) ;

// The script finishes execution here.