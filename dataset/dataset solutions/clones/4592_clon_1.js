/*
 * This JavaScript file defines a function 'Main' that processes numerical input.
 * It simulates a specific mathematical process or game logic.
 * The core logic involves repeatedly updating three numbers based on their peers' values.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27 (example date)
 */

function Main( input )
{
  // First, parse the input string into an array of numbers.
  // The input is expected to be a space-separated string of numbers.
  input = input.split( " " ) .map( Number ) ;

  // Initialize a counter for the loop iterations.
  // The loop continues as long as all three numbers are even and the iteration count
  // does not exceed a predefined limit (1000 in this case).
  for ( var i = 0 ;
        input[0] % 2 == 0 &&
        input[1] % 2 == 0 &&
        input[2] % 2 == 0 &&
        i != 1000 ;
        i++ )
  {
    /* Optional debug line, commented out for production: console.log(input); */

    // Store the current values of the input array elements
    // into a temporary memory array before they are updated.
    var mem = [ input[0] , input[1] , input[2] ] ;

    // Update the first element: sum of half of the second and third elements.
    input[0] = mem[1] / 2 + mem[2] / 2 ;

    // Update the second element: sum of half of the first and third elements.
    input[1] = mem[0] / 2 + mem[2] / 2 ;

    // Update the third element: sum of half of the second and third elements.
    // Note: This specific calculation (mem[1]/2 + mem[2]/2) for input[2] is
    // preserved exactly as in the original code.
    input[2] = mem[1] / 2 + mem[2] / 2 ;
  }

  // After the loop, check if it terminated because the iteration limit was reached.
  // If so, set the result 'i' to -1 as per problem specification.
  if ( i == 1000 )
  {
    i = -1 ;
  }

  // Output the final value of the iteration counter 'i' to the console.
  console.log( i ) ;

}

// Read input from standard input using Node.js 'fs' module,
// decode it as UTF-8, trim any leading/trailing whitespace,
// and then pass it to the Main function for processing.
Main( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) .trim() ) ;