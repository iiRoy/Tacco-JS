/* This script processes a given input string to calculate a specific minimum value. */
'use strict';

/**
 * Executes the primary data processing routine.
 * @param {string} rawText The raw input string containing numerical data.
 */
function ProcessInputData(rawText)
{
  // First, clean and split the incoming text into an array of lines.
  let processedLines = rawText.trim().split('\n');

  // Extract the total number of elements from the first line.
  const elementCount = parseInt(processedLines[0], 10);

  // Parse the second line into an array of integers.
  let numericValues = processedLines[1].split(' ').map(strVal => parseInt(strVal, 10));

  // Sort the array of numbers in ascending order.
  numericValues = numericValues.sort((a, b) => a - b);


  // Define the upper limit for iteration.
  const upperBound = 0x64; // Equivalent to 100 in hexadecimal

  // Initialize a hash map to track the presence of numbers.
  const presenceFlags = {};
  for (let currentValue = 0; currentValue <= upperBound; ++currentValue) {
    presenceFlags[currentValue] = false; // Mark current value as not present by default.

    // Iterate through the input numbers to check for presence.
    for (let dataIdx = 0; dataIdx < elementCount; ++dataIdx) {
      if (currentValue === numericValues[dataIdx]) {
        presenceFlags[currentValue] = true; // If found, mark as present.
      }
    }
  }

  // Initialize the minimum squared sum to a very large number.
  let minSquaredSum = Number.POSITIVE_INFINITY;

  // Iterate from 1 up to the upper bound.
  for (let iterVal = 1; iterVal <= upperBound; ++iterVal) {
    // If the current iteration value is NOT present in the input data.
    if (!presenceFlags[iterVal]) {
      let currentSumOfSquares = 0; // Reset sum for this iteration.

      // Calculate the sum of squares of differences for each number.
      for (let dataIdx = 0; dataIdx < elementCount; ++dataIdx) {
        const difference = numericValues[dataIdx] - iterVal;
        currentSumOfSquares += difference * difference; // Accumulate squared difference.
      }

      // Update the minimum squared sum if the current one is smaller.
      minSquaredSum = Math.min(minSquaredSum, currentSumOfSquares);
    }
  }

  // Output the final calculated minimum sum to the console.
  console.log(minSquaredSum);
}

// Invoke the main processing function with data read from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));