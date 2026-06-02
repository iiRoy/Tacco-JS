'use strict'; // Enforce strict mode for cleaner code

/**
 * Processes the given input to find the minimum sum of squared differences.
 * @param {string} rawData The raw input string, typically from stdin.
 */
function ProcessInput(rawData) {
  // Trim whitespace and split the input into lines
  let processedLines = rawData.trim().split('\n');

  // Parse the number of elements from the first line
  const countOfElements = parseInt(processedLines[0], 10);

  // Parse the array of numbers from the second line
  // Convert string elements to integers
  let numericValues = processedLines[1].split(' ').map(strVal => parseInt(strVal, 10));

  // Sort the array of numbers in ascending order
  numericValues.sort((a, b) => a - b); // Ensure numerical sort

  // Define the maximum possible value for iteration
  const upperBound = 100;

  // Create a map to quickly check for the presence of numbers
  // Initialize all possible values up to upperBound as not present
  const presenceMap = {};
  for (let idx = 0; idx <= upperBound; ++idx) {
    presenceMap[idx] = false; // Mark as not found initially
    // Iterate through the input numbers to mark their presence
    for (let arrIdx = 0; arrIdx < countOfElements; ++arrIdx) {
      if (idx === numericValues[arrIdx]) {
        presenceMap[idx] = true; // Mark as found
      }
    }
  }

  // Initialize the minimum squared sum to a very large value
  let minSquaredSum = Infinity;

  // Iterate through all possible target values from 1 to upperBound
  for (let targetVal = 1; targetVal <= upperBound; ++targetVal) {
    // If the current target value is NOT present in the input numbers
    if (!presenceMap[targetVal]) {
      let currentSumOfSquares = 0; // Accumulator for the current targetVal
      // Calculate the sum of squared differences for this targetVal
      for (let dataIdx = 0; dataIdx < countOfElements; ++dataIdx) {
        const difference = numericValues[dataIdx] - targetVal;
        currentSumOfSquares += difference * difference; // Add the square of the difference
      }

      // Update the overall minimum if the current sum is smaller
      minSquaredSum = Math.min(minSquaredSum, currentSumOfSquares);
    }
  }

  // Output the final minimum sum of squared differences
  console.log(minSquaredSum);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
