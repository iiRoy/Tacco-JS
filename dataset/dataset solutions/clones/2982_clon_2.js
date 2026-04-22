'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Executes a comprehensive analysis on provided string data to count specific patterns.
 * @param {string} sourceContent - The raw textual input to be processed.
 */
function ProcessInputData(sourceContent) {
  // Trim whitespace from the input and split it into an array of individual string tokens.
  // Using a regular expression to split by one or more whitespace characters.
  const stringTokens = sourceContent.trim().split(/\s+/);

  // The first token is expected to be a number, which we extract and convert.
  // This value might represent the total number of items or a similar initial metric.
  let initialItemCount = Number(stringTokens.shift());

  // Calculate the number of tokens that end with the character 'A'.
  const suffixA_Tally = stringTokens.reduce((currentTotal, currentSegment) => {
    // Check if the last character of the current segment is 'A'.
    return currentTotal + (currentSegment[currentSegment.length - 1] === 'A' ? 1 : 0);
  }, 0); // Initialize the accumulator to zero.

  // Determine the count of tokens that begin with the character 'B'.
  const prefixB_Tally = stringTokens.reduce((currentTotal, currentSegment) => {
    // Check if the first character of the current segment is 'B'.
    return currentTotal + (currentSegment[0] === 'B' ? 1 : 0);
  }, 0);

  // Compute the count of tokens that both start with 'B' AND end with 'A'.
  const b_and_a_Segments = stringTokens.reduce((currentTotal, currentSegment) => {
    // Apply a combined condition for the first and last characters.
    return currentTotal + ((currentSegment[0] === 'B' && currentSegment[currentSegment.length - 1] === 'A') ? 1 : 0);
  }, 0);

  // Count the total occurrences of the "AB" substring within all tokens.
  const embeddedAB_Instances = stringTokens.reduce((currentTotal, currentSegment) => {
    // Splitting by "AB" and subtracting one from the length gives the count of "AB" occurrences.
    return currentTotal + currentSegment.split('AB').length - 1;
  }, 0);

  // Calculate the minimum number of potential connections between 'B'-starting and 'A'-ending segments.
  let connectorPotential = Math.min(suffixA_Tally, prefixB_Tally);

  // Adjust the connector potential if a specific edge case is met:
  // where all 'A'-ending segments are also 'B'-starting, and vice-versa.
  if (b_and_a_Segments === suffixA_Tally && suffixA_Tally === prefixB_Tally) {
    connectorPotential--; // Decrement the potential by one.
  }

  // Output the final computed result, which is a sum of embedded 'AB' instances and the adjusted connector potential.
  console.log(embeddedAB_Instances + connectorPotential);
}

// Invoke the main processing function with data read from standard input.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));