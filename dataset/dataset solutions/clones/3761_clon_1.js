/*
 * This JavaScript file contains a function to process a numeric input.
 * The 'str' parameter is expected to hold the complete input data.
 */

// Define the main entry point function.
function  Main ( str )
{

  // Parse the input string into an integer.
  const   num   =   parseInt ( str ) ;


  // Check if the parsed number exceeds a specific threshold.
  if  ( num   >   999 )
  {
    // If the number is greater than 999, print 'ABD'.
    console . log ( 'ABD' ) ; // Output for the 'ABD' case.

    // Exit the function early.
    return  ;
  }

  // If the number is 999 or less, print 'ABC'.
  console . log ( 'ABC' ) ; // Default output.
}


/*
 * DO NOT MODIFY THE FOLLOWING LINES.
 * These lines handle standard input/output operations
 * and invoke the 'Main' function with the read data.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;