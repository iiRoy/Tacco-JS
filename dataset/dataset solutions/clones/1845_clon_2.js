'use strict';
// This utility function helps in displaying messages to the console.
const printer = ( textMessage ) => {
    console.log( textMessage );
};

/**
 * Core logic function to analyze an input sequence.
 * @param {Array<string>} dataLines - An array where the first element contains the sequence to be processed.
 */
function analyzeSequence( dataLines ) {
  // Extract the first line of input and convert it into an array of individual characters.
  let charSequence = dataLines[0].trim().split( "" );

  // Retrieve the very last character from the sequence. This character is expected to be a digit.
  let finalDigit = charSequence.pop();

  // Evaluate the extracted digit to determine the appropriate output.
  if ( finalDigit === '3' ) { // Using strict equality for comparison.
    printer( 'bon' ); // Output for digit '3'.
  }
  else if ( finalDigit === '0' || finalDigit === '1' || finalDigit === '6' || finalDigit === '8' ) {
    printer( 'pon' ); // Output for specific digits '0', '1', '6', '8'.
  }
  else {
    printer( 'hon' ); // Default output for any other digit.
  }
}

// Initiate the processing by reading input from standard input,
// cleaning it, and splitting it into lines before passing to the main analysis function.
analyzeSequence(
  require( 'fs' )
    .readFileSync( '/dev/stdin', 'utf8' )
    .trim()
    .split( "\n" )
);