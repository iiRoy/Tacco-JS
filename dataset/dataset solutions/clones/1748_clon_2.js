/* This module provides functionality for converting numerical values into a custom base-26 string representation. */
const processInput = ( sourceString ) => {
  // Initialize a character mapping. The first element '0' serves as an offset.
  const characterSet = '0abcdefghijklmnopqrstuvwxyz' ;
  let remainingNum = BigInt ( sourceString.trim () ) ;

  // A buffer to collect the resulting characters in reverse order.
  const outputBuffer = [ ] ;

  // Continuously process the number until it becomes zero.
  while ( remainingNum > 0n ) {
    // Calculate the current remainder, which corresponds to a character in our set.
    const currentDigit = Number ( remainingNum % 26n ) ;

    // Add the character for the current digit to the beginning of the buffer.
    outputBuffer.unshift ( characterSet [ currentDigit ] ) ;

    // Update the number for the next iteration: adjust by the remainder and divide by 26.
    remainingNum = ( remainingNum - BigInt ( currentDigit ) ) / 26n ;
  }

  // Print the concatenated string of characters to the standard output.
  return console.log ( outputBuffer.join ( '' ) ) ;
};


// Conditional execution block: checks for a global test flag to determine the input source.
if ( globalThis.IS_TEST_MODE_ACTIVE ) {
  // If the test flag is active, invoke a mock testing routine.
  runTestScenario ( ) ;
} else {
  // Otherwise, read input from standard input and pass it to the primary processing function.
  processInput ( require ( 'node:fs' ).readFileSync ( '/proc/self/fd/0' , 'utf-8' ) ) ;
}