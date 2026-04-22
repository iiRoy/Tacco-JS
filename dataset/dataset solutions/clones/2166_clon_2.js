'use strict';

/**
 * Main processing function for the application.
 * @param {string} rawInputData - The entire input string received.
 */
function ProcessInput(rawInputData) {

  // Clean and split the incoming data into an array of lines.
  let cleanLines = rawInputData.trim().split('\n');

  // Parse the first line to extract two string identifiers.
  const [initialIdentifier, secondaryIdentifier] = cleanLines[0].split(' ');

  // Process the second line, converting space-separated numbers to an array of integers.
  const numericValues = cleanLines[1].split(' ').map(strRepresentation => Number.parseInt(strRepresentation, 10));

  // Initialize two mutable numeric variables from the parsed values.
  let firstCounter = numericValues[0];
  let secondCounter = numericValues[1];

  // Retrieve the third string for comparison.
  const comparisonKey = cleanLines[2];

  /*
   * Conditional logic to decrement one of the counters based on
   * whether the comparison key matches the initial identifier.
   */
  if (comparisonKey === initialIdentifier) {
    firstCounter--; // Decrement the first counter.
  } else {
    secondCounter--; // Otherwise, decrement the second counter.
  }

  // Output the final state of the two counters, space-separated.
  console.log(`${firstCounter} ${secondCounter}`);
}

// Invoke the primary function, reading input from standard input.
ProcessInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));