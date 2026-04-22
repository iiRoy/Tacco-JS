'use strict';

/*
 * This script processes a list of numerical values to determine the smallest possible
 * range (difference between maximum and minimum) within any contiguous sub-array
 * of a predefined length.
 */

const processData = (rawDataInput) => {
  // Parse the incoming raw string data by splitting it into individual lines.
  let linesArray = rawDataInput.split('\n');

  // The second element (index 1) of the first line specifies the desired group size.
  // Convert this string value to a number.
  const groupSize = Number(linesArray[0].split(' ')[1]);

  // Remove the first line from the array as its information has been extracted.
  linesArray.shift();

  // Sort the remaining lines numerically and convert each string entry into an actual number.
  let parsedNumbers = linesArray.sort((valA, valB) => valA - valB).map(numStr => Number(numStr));

  // Initialize the variable to store the minimum difference found.
  // A large initial value ensures any calculated difference will be smaller.
  let minDifference = 9999;

  // Iterate through the sorted array to evaluate all possible sub-arrays
  // of the 'groupSize'. The loop continues as long as a full group can be formed.
  for (let idx = 0; idx <= parsedNumbers.length - groupSize; idx++) {
    // Identify the smallest number within the current window (sub-array).
    let currentMin = Number(parsedNumbers[idx]);

    // Identify the largest number within the current window.
    // This is located at 'idx + groupSize - 1' due to zero-based indexing.
    let currentMax = Number(parsedNumbers[idx + groupSize - 1]);

    // Calculate the difference between the maximum and minimum values in this group.
    let tempDiff = currentMax - currentMin;

    // If the newly calculated difference is smaller than the previously recorded
    // minimum difference, update the minimum difference.
    if (minDifference > tempDiff) {
      minDifference = tempDiff;
    }
  }

  // Print the final, smallest difference found across all groups to the console.
  console.log(minDifference);
}; // End of the data processing function.

// Execute the main processing function by reading input from standard input.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));