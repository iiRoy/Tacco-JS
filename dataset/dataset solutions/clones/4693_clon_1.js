/*
 * This is a Type I clone of the original JavaScript code.
 * It calculates the factorial of a given number 'n' modulo (10^9 + 7).
 * The 'use strict' directive is maintained for consistent execution.
 */
'use strict'



const main = ( input ) => { // Main function definition
  // Parse the input string into an integer.
  const n = parseInt( input )


  let p = 1 // Initialize 'p' to 1, which will store the factorial.


  // Loop from 1 up to 'n' (inclusive) to calculate the factorial.
  for ( let i = 1; i <= n; i++ ) {
    p *= i // Multiply 'p' by the current loop variable 'i'.

    // Apply the modulo operation to prevent integer overflow.
    // The modulo value is 10^9 + 7, a common prime number in competitive programming.
    p %= Math.pow( 10, 9 ) + 7
  }


  // Output the final calculated factorial value.
  console.log( p )
}



// Read input from standard input and pass it to the main function.
// This part handles file system operations to get the input.
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf-8' ) )