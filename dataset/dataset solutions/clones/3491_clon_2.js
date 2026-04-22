'use strict';

/**
 *  This program processes a list of items, each with a cost and a time requirement,
 *  to find the minimum cost among items that satisfy a given time limit.
 *  It expects input from stdin.
 *
 *  @param {string} rawInputContent - The complete input data as a single string.
 */
function ProcessInputData(rawInputContent) {
  // Divide the entire input string into an array of separate lines.
  const inputLinesCollection = rawInputContent.split('\n');

  // Extract the maximum allowed time threshold from the first line of the input.
  // The threshold is assumed to be the second numerical value on this initial line.
  const maximumAllowedTime = parseInt(inputLinesCollection[0].split(' ')[1], 10);

  // Remove the header line, as its information has been extracted.
  inputLinesCollection.shift();

  // Initialize a variable to track the smallest cost encountered so far.
  // Starting with positive infinity ensures that any valid cost will correctly replace it.
  let minimumObservedCost = Infinity;

  // Iterate through each subsequent line in the input collection.
  for (let currentLineIndex = 0; currentLineIndex < inputLinesCollection.length; currentLineIndex++) {
    // Parse the current line, converting its space-separated values into an array of numbers.
    // The first number is typically the cost, and the second is the time.
    const numericPair = inputLinesCollection[currentLineIndex].split(' ').map(valueString => parseInt(valueString, 10));

    // Check if the time component of the current pair is within the allowed threshold
    // AND if its cost component is less than the currently recorded minimum cost.
    if (numericPair[1] <= maximumAllowedTime && numericPair[0] < minimumObservedCost) {
      // If both conditions are met, update the minimum observed cost with the current item's cost.
      minimumObservedCost = numericPair[0];
    }
  }

  // Output the final result: either the lowest cost found, or a specific message
  // if no item met the criteria (i.e., the minimum cost remains Infinity).
  console.log(minimumObservedCost === Infinity ? 'TimeLimitExceeded' : minimumObservedCost);
}

// Execute the main processing function by reading input from the standard input stream.
// The 'node:fs' module is used for file system operations, and '/dev/stdin' is the conventional
// path for standard input on Unix-like systems, read as UTF-8 encoded text.
ProcessInputData(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));