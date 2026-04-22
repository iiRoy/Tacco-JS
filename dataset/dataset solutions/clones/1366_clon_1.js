/*
 * This is a JavaScript file containing a simple program.
 * The purpose is to demonstrate a basic loop structure and
 * console output functionality.
 *
 * This particular version includes extensive whitespace
 * and comments for illustrative purposes, while maintaining
 * the exact original functionality.
 */


// Define the primary function for this application.
// It is named 'Main' as per the original code's specification.
function  Main  ( )
{
  // Initialize a loop counter 'i' to 0.
  // The loop will iterate 10,000 times in total.
  for  ( var  i  =  0 ;  i  <  10000 ;  i ++ )
  {
    // On each iteration of the loop, print the string
    // "Hello World" to the standard output (console).
    console.log  ( "Hello World" ) ;
  }

} // End of the Main function definition.


// This section of the code executes the 'Main' function.
// It attempts to read input from '/dev/stdin' using Node.js's 'fs' module.
// Although the 'Main' function currently does not use this input,
// the call structure is preserved as per the original.
Main  ( require  ( 'fs' ) . readFileSync  ( '/dev/stdin' ,  'utf8' ) ) ;


// End of the JavaScript program.