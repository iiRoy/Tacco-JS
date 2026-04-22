/*
 * This JavaScript file processes input to determine a specific condition.
 * It reads two numbers, N and K, from the standard input.
 * The core logic checks if a mathematical relationship between N and K holds true.
 */

// Enforce strict parsing and error handling for the entire script.
'use strict' // Standard directive for strict mode.

// Define the primary function responsible for the application logic.
const main = ( INPUT ) => { // The main function accepts a single argument, INPUT, which is expected to be a string.

  // Extract the first numerical value, N, from the input string.
  // The input is assumed to be a single line containing two space-separated numbers.
  const N = Number( INPUT .split( '\n' )[ 0 ] .split( ' ' )[ 0 ] ) ; // Parse N from the first line, first element.

  // Extract the second numerical value, K, from the same input string.
  // This follows the same parsing logic as N, but retrieves the second element.
  const K = Number( INPUT .split( '\n' )[ 0 ] .split( ' ' )[ 1 ] ) ; // Parse K from the first line, second element.

  // Evaluate the condition: Is ((N + 1) / 2) greater than or equal to K?
  // This is the central decision-making part of the program.
  if ( ( N + 1 ) / 2 >= K ) {
    console.log( 'YES' ) ; // If the condition is met, print 'YES' to standard output.
  } // End of if block.
  else { // If the condition is not met (i.e., ((N + 1) / 2) is less than K).
    console.log( 'NO' ) ; // Print 'NO' to standard output.
  } // End of else block.

} ; // Concludes the definition of the main function.

// Execute the main function, providing it with input read from the system's standard input.
// This uses the Node.js 'fs' module to synchronously read the content of /dev/stdin.
main( require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' ) ) ;

/*
 * Script execution completes after the main function has processed the input
 * and printed its determination.
 */