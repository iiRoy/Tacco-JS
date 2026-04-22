/*
 * This file contains the solution for a specific mathematical problem.
 * It calculates two integers A and B such that A^5 - B^5 = X, given X.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

function Main ( input )
{
  // Trim any leading/trailing whitespace from the input string.
  input = input.trim();

  /*
   * The following lines are commented out as they represent alternative
   * input processing strategies not used in this particular problem instance.
   * input = input.split("\n"); // Example: splitting input into lines
   * input = input.map( e => e.split(" ").map( f => parseInt( f ) ) ); // Example: parsing multiple integers
   */

  // Parse the input string into an integer X, which is the target value.
  X = parseInt( input );

  // Initialize variable A, which will store the first integer in the solution.
  var A = 0;
  // Initialize variable B2, which will store the second integer in the solution.
  var B2 = 0;

  // Start a loop to iterate through possible values of B.
  // The range for B is chosen to cover potential solutions efficiently.
  for ( var B = -100 ; B < 100000000 ; B++ )
  {
    // Calculate A using the formula A = (X + B^5)^(1/5).
    // This is derived from A^5 - B^5 = X => A^5 = X + B^5 => A = (X + B^5)^(1/5).
    A = Math.pow( X + Math.pow( B , 5 ) , 1 / 5 );

    // Check if A is an integer.
    // An integer A will have no fractional part, so A - floor(A) will be 0.
    if ( A - Math.floor( A ) == 0 )
    {
      // If A is an integer, we have found a valid pair (A, B).
      B2 = B; // Store the current value of B in B2.
      break;  // Exit the loop as the first solution is found.
    }
  }

  // Output the found integer values for A and B2, separated by a space.
  console.log( A + " " + B2 );

} // End of the Main function.

// Read the input from standard input (/dev/stdin) and execute the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) );