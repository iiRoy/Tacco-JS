'use strict';

(function(inputData) {
  // Process the raw input string: remove leading/trailing whitespace,
  // split into an array of strings by any whitespace, then convert each to a number.
  inputData = inputData.trim().split(/\s+/).map(currentVal => currentVal - 0);

  // Extract the first numerical value, which represents the total count of items.
  const totalItems = inputData.shift();

  // The remaining numbers in the array form our primary sequence.
  const itemSequence = inputData;

  // Set a special boundary condition for the sequence at an "invalid" index.
  itemSequence[-1] = 0;

  // Initialize a 2D array for dynamic programming.
  // `dpTable[length][startIndex]` will store the optimal difference for a sub-sequence.
  const dpTable = new Array(totalItems + 1)
    .fill(0)
    .map((_, index) => new Array(totalItems + 1 - index).fill(0));

  // The final answer will be stored in `dpTable[totalItems][0]`.

  // Iterate through possible sub-sequence lengths, from 1 up to the total number of items.
  for (let currentLength = 1; currentLength <= totalItems; currentLength++) {
    // Iterate through all possible starting indices for the current sub-sequence length.
    for (let startIndex = 0; startIndex <= totalItems - currentLength; startIndex++) {
      // Calculate the optimal value for the current sub-sequence.
      // This involves choosing between taking the first element or the last element
      // and subtracting the opponent's optimal score for the remaining sub-sequence.
      dpTable[currentLength][startIndex] = Math.max(
        itemSequence[currentLength + startIndex - 1] - dpTable[currentLength - 1][startIndex], // Take last element
        itemSequence[startIndex] - dpTable[currentLength - 1][startIndex + 1] // Take first element
      );
    }
  }

  // Retrieve the final computed result, which is the optimal value for the entire sequence.
  const finalOutcome = dpTable[totalItems][0];

  // console.log(dpTable); // This line is for debugging and is typically commented out.
  console.log(finalOutcome); // Output the final calculated result to the console.

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
