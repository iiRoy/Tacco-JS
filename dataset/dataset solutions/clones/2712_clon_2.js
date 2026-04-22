'use strict';
(function ( sourceText ) { // This immediately invoked function processes the incoming raw text.

  // First, the raw string is cleaned: leading/trailing whitespace removed,
  // then split into an array of strings by any sequence of whitespace.
  // Finally, each string element is converted into a numeric value.
  let numericValues = sourceText.trim().split( /\s+/ ).map( item => item - 0 );

  // Destructure the first three numeric values into distinct, meaningful constants.
  const
    divisorCandidate = numericValues[ 0 ], // Represents a potential divisor or initial quantity.
    coordX           = numericValues[ 1 ], // Denotes an X-coordinate or a second numerical input.
    coordY           = numericValues[ 2 ]; // Denotes a Y-coordinate or a third numerical input.

  // A conditional check is performed based on the parity of the values.
  // If the 'divisorCandidate' is an even number AND the sum of 'coordX' and 'coordY' is odd,
  // then a specific error condition is met.
  if ( ( divisorCandidate % 2 === 0 ) && ( ( coordX + coordY ) % 2 === 1 ) ) {
    console.log( -1 ); // Output -1 to indicate an impossible or invalid scenario.
    return; // Terminate the function's execution immediately.
  }

  // If the above condition is not met, the program would continue here for other logic,
  // but in this specific example, no further actions are defined.

})(
  require('fs') // Access the Node.js file system module for I/O operations.
    .readFileSync( // Synchronously read the entire content of a file.
      '/dev/stdin', // Specify the path to standard input, commonly used for script inputs.
      'utf8'        // Define the character encoding for the input stream as UTF-8.
    )
);