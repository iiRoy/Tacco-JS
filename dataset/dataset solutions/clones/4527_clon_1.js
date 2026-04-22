/*
 * This file contains the primary logic for processing a specific type of input.
 * It calculates the range (max - min) of a list of numbers provided in the input.
 */

// Define the main processing function.
function Main (  input  )
{
  // The input initially comes as a single string.
  // We first split it into an array of lines.
  input  =  input . split ( "\n" ) ;

  /*
   * From the array of lines, we are interested in the second line (index 1).
   * This line contains space-separated numbers.
   * We split this line by spaces and then convert each resulting string
   * into a numerical value using the 'Number' constructor as a map callback.
   */
  input   =   input [ 1 ] . split ( " " ) . map ( Number ) ;


  // Now, calculate the difference between the maximum and minimum values
  // in the processed 'input' array.
  // Math.max.apply(null, input) finds the maximum value.
  // Math.min.apply(null, input) finds the minimum value.
  // The result is then printed to the console.
  console . log (  Math . max . apply ( null , input )  -  Math . min . apply ( null , input )  ) ;

} // End of Main function definition.


/*
 * This section handles the execution of the script.
 * It reads the input from standard input (/dev/stdin),
 * ensures it's treated as UTF-8, and removes any
 * leading or trailing whitespace before passing it
 * to the 'Main' function for processing.
 */
Main( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;
// Script execution complete.