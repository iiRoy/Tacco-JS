"use strict" // This line enforces strict mode for better error handling.

// Define the primary function responsible for processing the given input.
const main = ( input ) => {

  // Split the input string by spaces to separate the numeric values.
  const _input = input.split( " " );

  // Parse the first part of the input as an integer, using base 10.
  const A = parseInt( _input[0], 10 );
  // Parse the second part of the input as an integer, also using base 10.
  const B = parseInt( _input[1], 10 );

  // Calculate the absolute difference between A and B. This value determines the loop limit.
  const C = Math.abs( A - B ) ;

  let K; // Declare a variable 'K' to be used as a counter in the upcoming loop.
  
  // Begin a loop that iterates from K = 0 up to, but not including, C.
  for ( K = 0 ; K < C ; K++ ) {
    // Inside the loop, check if the absolute difference between A and K
    // is exactly equal to the absolute difference between B and K.
    if ( Math.abs( A - K ) == Math.abs( B - K ) ) {
      // If the condition is met, print the current value of K to the console.
      console.log( K );
      // Since a solution has been found, exit the loop immediately.
      break;
    }
  }

  // After the loop has finished, check if K's final value is equal to C.
  // This indicates that the loop completed without finding a suitable K (i.e., no 'break' occurred).
  if ( K == C ) {
    // If no such K was found within the range, print "IMPOSSIBLE" to the console.
    console.log( "IMPOSSIBLE" );
  }
}

// Invoke the main function, providing it with content read from standard input.
// The 'fs' module is used to read the file synchronously, and it's decoded as UTF-8.
main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;