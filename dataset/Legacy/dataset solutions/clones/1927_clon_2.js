'use strict';

// A utility function for logging output to the console.
const logOutput = (messageContent) => {
  console.log(messageContent);
};

/*
 * This function processes the entire input data provided.
 * The input is expected to be an array of strings, where each element
 * represents a line from the standard input.
 */
function processInputData(rawData) {
  // The first line of input (rawData[0]) contains space-separated values.
  // We extract these values into distinct variables.
  let firstVal = rawData[0].split(" ")[0];
  let secondVal = rawData[0].split(" ")[1];
  let iterationLimit = rawData[0].split(" ")[2];

  // Initialize a variable to keep track of the maximum value found.
  let currentMaximum = 0;

  // Iterate from 1 up to and including the iterationLimit.
  for (let loopCounter = 1; loopCounter <= iterationLimit; loopCounter++) {
    // Perform a specific calculation based on the input values and the current loop counter.
    // This calculation involves floor division.
    let calculatedValue = Math.floor(firstVal * loopCounter / secondVal) - firstVal * Math.floor(loopCounter / secondVal);

    // If the newly calculated value is greater than the current maximum,
    // update the current maximum.
    if (calculatedValue > currentMaximum) {
      currentMaximum = calculatedValue;
    }
  }

  // Output the final maximum value found during the iterations.
  logOutput(currentMaximum);
}

// Do not modify the code below this line. It handles reading from standard input
// and invoking the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
