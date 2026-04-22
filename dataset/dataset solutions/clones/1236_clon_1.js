/*
 * This script reads numerical data from standard input,
 * processes each entry, and prints valid numbers.
 *
 * It's designed to filter out a specific sentinel value.
 */

// Initialize a variable named 'input' to store processed data.
var input = require ( 'fs' ) // Utilize the built-in 'fs' module for file system operations.
	.readFileSync ( '/dev/stdin', 'utf8' ) // Synchronously read the content of '/dev/stdin' as UTF-8.
	.split ( "\n" ) // Divide the entire input string into an array of strings, using newline as the delimiter.
	.map ( Number ) // Transform each string element in the array into its numerical representation.
; // Concludes the declaration and assignment for 'input'.

// Begin iterating over each element present in the 'input' array.
input
  .map (
    // Define an anonymous function that will be executed for every element 'x' in the 'input' array.
    function ( x )
    {
      // Check if the current element 'x' is not equivalent to the string '0 0'.
      // This acts as a simple filter condition.
      if ( x != '0 0' )
      {
        // Declare a new local variable 'y' and assign the value of 'x' to it.
        var y = x ; // This assignment is a direct copy, maintaining the original value.

        // Print the value stored in 'y' to the standard output console.
        console.log ( y ) ;
      } /* End of the conditional block for 'if (x != '0 0')' */
    } // End of the anonymous function definition.
  ) // Concludes the call to the 'map' method on the 'input' array.
; // Semicolon terminating the statement involving the 'input.map' call.

// End of JavaScript code execution.