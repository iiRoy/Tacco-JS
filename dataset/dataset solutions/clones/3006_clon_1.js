/*
 * This is a Type I clone of a JavaScript program.
 * It processes input data to calculate a specific benefit based on given values.
 * The core logic and all identifiers remain precisely as in the original.
 */

// Define the main function that processes the input string.
function main ( /* The raw input string */ input )
{
  // Split the input string into an array of lines.
  // Each line is expected to contain distinct data.
  var args = input . split ( '\n' ) ;

  /*
   * The first element of the 'args' array (args[0])
   * represents the total number of items, 'n'.
   * It is parsed as an integer.
   */
  var n = parseInt ( args [ 0 ] ) ;

  // The second element (args[1]) contains space-separated 'v' values.
  // These are split into an array `vi`.
  var vi = args [ 1 ] . split ( ' ' ) ;

  // The third element (args[2]) contains space-separated 'c' values.
  // These are split into an array `ci`.
  var ci = args [ 2 ] . split ( ' ' ) ;

  // Initialize a variable to accumulate the total benefit.
  var benefit = 0 ;

  // Iterate through each item from index 0 up to (but not including) 'n'.
  for ( var i = 0 ;   i < n ;   i ++ )
  {
    // Parse the current 'v' value from the `vi` array.
    v = parseInt( vi[i] ); // 'v' implicitly becomes a global variable.

    // Parse the current 'c' value from the `ci` array.
    c = parseInt( ci[i] ); // 'c' implicitly becomes a global variable.

    // Check if the current 'v' value is strictly greater than the current 'c' value.
    if ( v > c )
    {
      // If 'v' is greater, calculate the positive difference and add it to the total benefit.
      benefit += ( v - c ) ; // This accumulates the profit.
    } // End of the 'if' conditional block
  } // End of the 'for' loop for processing items

  // After iterating through all items, print the final calculated benefit to the console.
  console . log ( benefit ) ;
} // End of the 'main' function definition

// This part of the script reads input from standard input and passes it to the main function.
/*
 * The 'require' function loads the Node.js 'fs' (file system) module.
 * 'readFileSync' synchronously reads the content of '/dev/stdin' (standard input).
 * The 'utf8' encoding is specified for the input data.
 * The entire content is then passed as a string to the 'main' function for processing.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;