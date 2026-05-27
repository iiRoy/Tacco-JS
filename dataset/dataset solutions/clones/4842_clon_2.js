"use strict";

// This function processes the input string to calculate adjustments.
const processInputData = (rawInputString) => {
  // Split the raw input into lines and trim any leading/trailing whitespace.
  let processedLines = rawInputString.trim().split("\n");

  // Parse the first line to get the number of elements and the maximum allowed sum.
  const firstLineParts = processedLines[0].split(" ");
  const elementCount = parseInt(firstLineParts[0], 10); // Total number of items
  const maximumAllowedSum = parseInt(firstLineParts[1], 10); // The upper limit for sum

  // Parse the second line to get the array of numeric values.
  const numericValues = processedLines[1].split(" ").map((parsedNumber) => parseInt(parsedNumber, 10));

  // Initialize a counter for the total modifications made.
  let totalModifications = 0;

  // Iterate through the array, checking pairs of adjacent elements.
  // The loop runs up to N-1 because we access A[i+1].
  for (let currentIndex = 0; currentIndex < elementCount - 1; currentIndex++) {
    // Calculate the sum of the current pair of adjacent elements.
    let currentSumOfPair = numericValues[currentIndex] + numericValues[currentIndex + 1];

    // If the sum exceeds the maximum allowed sum, adjustments are needed.
    if (currentSumOfPair > maximumAllowedSum) {
      // Calculate the excess amount.
      const excessAmount = currentSumOfPair - maximumAllowedSum;

      // Reduce the second element of the pair by the excess amount.
      numericValues[currentIndex + 1] -= excessAmount;

      // Add the excess amount to the total modifications counter.
      totalModifications += excessAmount;
    }
  }

  // Output the final count of total modifications.
  console.log(totalModifications);
};

// Read input from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
