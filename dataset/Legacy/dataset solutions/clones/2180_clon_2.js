"use strict";

function processData(inputLines) {
  // Extract the segment size from the first line
  let segmentSize = inputLines[0].split(" ")[1];
  // Parse the second line into an array of number strings
  let numericStrings = inputLines[1].split(" ");

  // Pre-calculate expected values for each number
  // This involves adding 1 to each number and dividing by 2 (average of 1 and the number)
  let expectedAverages = [];
  for (let index = 0; index < numericStrings.length; index++) {
    expectedAverages[index] = (2 + parseInt(numericStrings[index], 10)) / 2;
  }

  // Compute prefix sums (cumulative sums) of the expected averages
  // This allows for efficient calculation of sums over ranges
  let prefixSums = [0];
  for (let index = 0; index < numericStrings.length; index++) {
    prefixSums[index + 1] = prefixSums[index] + expectedAverages[index];
  }

  // Determine the maximum sum of expected averages within any adjacent 'segmentSize' elements
  let maximumSum = 0;
  for (let index = segmentSize - 1; index < numericStrings.length; index++) {
    // Calculate the sum for the current window of 'segmentSize' elements
    let currentWindowSum = prefixSums[index + 1] - prefixSums[index - segmentSize + 1];
    // Update the overall maximum sum if the current window's sum is greater
    maximumSum = (maximumSum < currentWindowSum) ? currentWindowSum : maximumSum;
  }

  // Output the final maximum sum to the console
  console.log(maximumSum);
}

// Read input from standard input, process it, and pass to the main function
processData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
