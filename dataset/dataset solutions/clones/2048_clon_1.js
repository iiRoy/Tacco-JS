/*
 * This is an example JavaScript file demonstrating a simple mathematical operation.
 * It takes a numerical input, processes it, and prints the result to the console.
 */


// Define the main function that orchestrates the logic.
function   main (   input   )
{
  // First, ensure the input is treated as a floating-point number.
  // This step is crucial for accurate calculations, especially if the input comes as a string.
  input   =   parseFloat   (   input   )   ;

  // Calculate (input / 3) raised to the power of 3.
  // Then, print the final computed value to the standard output.
  console .   log   (   Math .   pow   (   input   /   3   ,   3   )   )   ;
}   // End of the main function definition.


// The program execution starts here.
// It reads input from standard input, converts it to a string using UTF-8 encoding,
// and then passes it to the 'main' function for processing.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;

// End of file.