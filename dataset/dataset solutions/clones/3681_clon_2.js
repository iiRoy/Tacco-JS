"use strict"; // Ensures strict parsing and error handling for the entire script.

/**
 * Handles the main processing of an input string to filter characters.
 * @param {string} inputData - The complete input string, expected to be multi-line.
 */
const performExtraction = ( inputData ) => {

  // First step: prepare the input string.
  // Remove any leading/trailing whitespace and then split into individual lines.
  let parsedLines = inputData . trim() . split( "\n" );

  // The very first line of the input is treated as the source character sequence.
  // We break it down into an array of individual characters.
  const characterSequence = parsedLines [ 0 ] . split( "" );

  // The second line provides the numeric interval for character selection.
  // We parse it as an integer, ensuring base 10 interpretation.
  const extractionInterval = parseInt( parsedLines [ 1 ], 10 );

  // Initialize an empty array to accumulate the characters that meet our criteria.
  let collectedElements = [];

  // Iterate through the indices (positions) of the character sequence.
  // 'for...in' is used here to get string indices, which are then coerced to numbers for arithmetic.
  for ( let currentPosition in characterSequence ) {

    // Check if the current character's position is perfectly divisible by the extraction interval.
    // This identifies characters that should be selected.
    if ( currentPosition % extractionInterval === 0 ) {

      // If the condition is met, add the character at this position to our result collection.
      collectedElements . push( characterSequence [ currentPosition ] );
    }
  }

  // After processing all characters, join the collected elements back into a single string.
  // Then, output this resulting string to the standard console.
  console . log( collectedElements . join( "" ) );
};

// The script's entry point: read data from standard input and pass it to the processing function.
// This uses Node.js's 'fs' module to synchronously read the entire file.
performExtraction( require('fs') . readFileSync( '/dev/stdin', 'utf8' ) );