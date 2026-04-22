// This file demonstrates a simple JavaScript program.
// The primary function, `Main`, processes input data.
function  Main ( input )
{
  // The input string is initially split by newlines.
  // We then take the first line and split it by spaces.
  // This effectively parses the first line of space-separated values.
  input   =   input . split ( "\n" ) [ 0 ] . split ( " " ) ;


  // Calculate the maximum of two absolute differences:
  // 1. The absolute difference between the first and second parsed values.
  // 2. The absolute difference between the first and third parsed values.
  // The result is then printed to the console.
  console . log ( Math . max ( Math . abs ( input [ 0 ]   -   input [ 1 ] ) ,   Math . abs ( input [ 0 ]   -   input [ 2 ] ) ) ) ;

} // End of Main function definition.


// --- DO NOT MODIFY THE FOLLOWING LINES ---
// This section is responsible for reading standard input
// and invoking the `Main` function with the collected data.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ; // Call the main processing function.