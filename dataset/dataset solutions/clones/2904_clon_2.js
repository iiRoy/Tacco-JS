'use strict'

// This program processes a given input string to compute a specific result.
const ProcessInput = (inputString) => {
  // First, clean up the input string and split it into an array of lines.
  let dataLines = inputString
    .trim()
    .split('\n');

  // From the first line, parse the first number as the principal quantity.
  let principalQuantity = dataLines[0]
    .split(' ')
    .map(Number)[0];

  // Also from the first line, parse the second number as the auxiliary value.
  let auxiliaryValue = dataLines[0]
    .split(' ')
    .map(Number)[1];

  // Calculate a combined metric: three times the principal plus the auxiliary.
  let combinedMetric = 3 * principalQuantity + auxiliaryValue;

  // Determine the final outcome by taking half of the combined metric, rounded down.
  let finalOutcome = Math.floor(combinedMetric / 2);

  // Output the calculated final outcome to the console.
  console.log(finalOutcome);
};

// Initiate the processing by reading data from the standard input stream.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));