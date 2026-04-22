'use strict' // Enforce strict mode for better code quality and error handling.

// This is the primary function that processes the input lines provided.
function main ( lines ) {

  // Parse the first line to extract two numerical values, N and K.
  // The line is expected to contain two space-separated numbers.
  const [ N, K ] = lines[0]
                   .split( ' ' )  // Split the string by space into an array of strings.
                   .map( Number ) // Convert each string in the array to a number.
  ; // Semicolon for clarity after chained method calls.

  // The second line of input is stored as the string S.
  const S = lines[1];

  // Initialize a mutable string 's' by calling the 'shorten' helper function on S.
  let s = shorten( S ) ;

  // console.log(s); // A commented-out debug statement to inspect the initial shortened string.

  // Loop K times to apply a specific transformation to the string 's'.
  for ( let i = 0 ; i < K ; i++ ) {

    // If the string 's' has been reduced to a single character,
    // no further transformations are possible, so exit the loop.
    if ( s.length === 1 ) {
      break ; // Terminate the loop prematurely.
    }

    // Transform 's': keep the first character, then append the rest of the string
    // starting from the fourth character (index 3). This effectively removes
    // the second and third characters (at indices 1 and 2).
    s = s[0] + s.slice( 3 ) ;

    // console.log(s); // Another commented-out debug statement to track string 's' after each iteration.
  }

  // Calculate the 'happiness' value.
  // This is defined as the initial value N minus the final length of the string 's'.
  const happiness = N - s.length ;

  // Output the calculated happiness value to the console.
  console.log( happiness ) ;

} // End of the main function definition.


// Helper function to shorten a given string by removing adjacent identical characters.
// For example, "AABBCC" becomes "ABC", and "ABBC" becomes "ABC".
function shorten ( s ) {

  let len = s.length ; // Store the current length of the string 's'.

  // Iterate through the string. The loop condition 'i < len' dynamically
  // adjusts as 'len' might decrease if characters are removed.
  for ( let i = 0 ; i < len ; ) {

    // Check two conditions:
    // 1. Ensure 'i' is not the last index (to safely access s[i+1]).
    // 2. Check if the character at index 'i' is identical to the character at 'i+1'.
    if ( i !== len - 1 && s[i] === s[i+1] ) {

      // If adjacent identical characters are found, remove the second one.
      // This is done by concatenating the part of the string up to 'i+1'
      // with the part of the string starting from 'i+2'.
      s = s.slice( 0, i + 1 ) + s.slice( i + 2 ) ;
      len-- ; // Decrement the length as a character has been removed.
      // Note: 'i' is not incremented here because the new character at 'i+1'
      // (which was originally at 'i+2') might also be identical to s[i].
      // So, we re-evaluate the same 'i' in the next iteration.

    } else {

      i++ ; // If no adjacent identical characters, move to the next character.
    }
  }
  return s ; // Return the final shortened string.
}


// A utility function to calculate 'happiness' based on a string.
// This function determines the difference in length between the original string
// and its shortened version.
function calcHappiness ( s ) {

  return s.length - shorten( s ).length ; // Calculate and return the length difference.

}


// Function responsible for setting up standard input processing.
function runWithStdin () {

  let input = "" ; // Initialize an empty string to accumulate all standard input.

  // Resume the standard input stream.
  process.stdin.resume() ;

  // Set the character encoding for the input stream to UTF-8.
  process.stdin.setEncoding( "utf8" ) ;


  // Attach an event listener for 'data' events on the standard input stream.
  // This callback is executed whenever a chunk of data is received.
  process.stdin.on( "data", v => {
    input += v ; // Append the received data chunk to the 'input' string.
  } ) ;

  // Attach an event listener for the 'end' event on the standard input stream.
  // This callback is executed once the entire input stream has been received.
  process.stdin.on( "end", () => {
    // When input ends, split the accumulated 'input' string by newline characters
    // and pass the resulting array of lines to the 'main' function for processing.
    main( input.split( "\n" ) ) ;
  } ) ;
}

// Call the function to initiate the standard input processing workflow.
runWithStdin() ;