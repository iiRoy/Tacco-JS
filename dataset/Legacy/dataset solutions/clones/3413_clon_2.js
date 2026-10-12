'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes raw input data to find the minimum difference
 * between the largest and smallest elements within any
 * contiguous sub-array of a specified size.
 * @param {string} rawData - The complete input string, typically from stdin.
 */
const processData = (rawData) => {
  // Split the entire input string into individual lines.
  let dataLines = rawData.split('\n');

  // Parse the second value from the first line to determine the window size.
  // The first value on the first line is ignored as per the problem's typical structure.
  const windowSize = Number(dataLines[0].split(' ')[1]);

  // Remove the header line as it's no longer needed.
  dataLines.shift();

  // Sort the remaining lines numerically and convert them to numbers.
  // The comparison function (valA - valB) ensures ascending order.
  let numericValues = dataLines.sort((valA, valB) => valA - valB).map(numStr => Number(numStr));

  // Initialize the variable to store the smallest difference found so far
  // with a sufficiently large initial value.
  let minimumDifference = 9999;

  // Iterate through the sorted array to find all possible sub-arrays of 'windowSize'.
  // The loop runs until the starting index 'idx' allows for a full window.
  for (let idx = 0; idx <= numericValues.length - windowSize; idx++) {
    // Get the smallest element in the current window.
    let currentMin = Number(numericValues[idx]);
    // Get the largest element in the current window.
    // The index for the largest element is 'idx + windowSize - 1'.
    let currentMax = Number(numericValues[idx + windowSize - 1]);

    // Calculate the difference for the current window.
    let diffCandidate = currentMax - currentMin;

    // If this difference is smaller than the previously recorded minimum, update it.
    if (minimumDifference > diffCandidate) {
      minimumDifference = diffCandidate;
    }
  }

  // Output the final calculated minimum difference to the console.
  console.log(minimumDifference);
};

// Read the entire content of standard input synchronously and pass it to the processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
