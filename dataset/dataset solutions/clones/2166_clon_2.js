'use strict';

/*
 * This module processes a multi-line string input to perform
 * a specific conditional decrement operation on two numeric values.
 */
function ProcessInput(rawData) {
  // Trim leading/trailing whitespace and split the input into an array of lines.
  const processedLines = rawData.trim().split('\n');

  // Parse the first line to extract two string identifiers.
  const [firstString, secondString] = processedLines[0].split(' ');

  // Parse the second line to extract two integer values.
  // Each string element is converted to an integer.
  const numericValues = processedLines[1].split(' ').map(strVal => parseInt(strVal, 10));

  // Initialize two counters with the extracted numeric values.
  let countOne = numericValues[0];
  let countTwo = numericValues[1];

  // Extract the third string, which acts as a target for comparison.
  const targetString = processedLines[2];

  // Conditionally decrement one of the counters based on the comparison.
  if (targetString === firstString) {
    // If the target matches the first string, decrement the first counter.
    countOne -= 1;
  } else {
    // Otherwise, decrement the second counter.
    countTwo -= 1;
  }

  // Output the final values of the two counters, separated by a space.
  console.log(`${countOne} ${countTwo}`);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
