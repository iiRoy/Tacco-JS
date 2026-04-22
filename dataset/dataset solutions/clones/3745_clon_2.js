'use strict'; // Activates strict parsing and error handling for the script.

/**
 * Orchestrates the processing of incoming text data.
 * This routine parses the input, extracts specific numeric components,
 * and then applies a conditional check to determine the final output.
 *
 * @param {string} rawDataInflow - The complete string of input data
 *                                 received from the source.
 */
const orchestrateProcessing = rawDataInflow => {
  // First, segment the entire raw data string into individual lines
  // by splitting at each newline character.
  // Then, for every resultant line, further split it by spaces,
  // creating an array of string tokens for each line.
  // The outcome is a nested array structure, representing parsed data.
  const segmentedInputLines = rawDataInflow
    .split('\n')
    .map(currentLineSnippet => currentLineSnippet.split(' '));

  // Extract the very first numerical component from the initial line's
  // first segment. Ensure it's parsed as an integer with base 10.
  const numericItemOne = parseInt(segmentedInputLines[0][0], 10);

  // Similarly, extract the second numerical component from the initial line's
  // second segment, also parsing it as a base 10 integer.
  const numericItemTwo = parseInt(segmentedInputLines[0][1], 10);

  // Evaluate the extracted numeric values against a predefined threshold.
  // If either of the items exceeds the value of 8, a specific message is logged.
  if ( (numericItemOne > 8) || (numericItemTwo > 8) )
  {
    console.log(':('); // Signifies an unfavorable outcome.
  }
  // Otherwise, if both items are within or below the threshold,
  // a different, positive message is displayed.
  else
  {
    console.log('Yay!'); // Signifies a favorable outcome.
  }
}; // Concludes the definition of the orchestrateProcessing function.


// Initiates the data processing workflow.
// Reads the content of the standard input stream (`/dev/stdin`)
// using Node.js's file system module, ensuring UTF-8 encoding,
// and passes the resulting string to the primary processing function.
orchestrateProcessing(
  require('fs')
    .readFileSync(
      '/dev/stdin',
      'utf8'
    )
);