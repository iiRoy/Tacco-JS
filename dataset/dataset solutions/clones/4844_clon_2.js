"use strict";

// This script processes a sequence of numbers to ensure no two adjacent numbers sum up to more than a given threshold.
// Adjustments are made to the second number in an offending pair.
const processInput = (inputData) => {
  // Trim leading/trailing whitespace and split the input into lines.
  inputData = inputData.trim().split("\n");

  // Parse the first line to get the count of items and the maximum allowed sum.
  const firstLineParts = inputData[0].split(" ");
  const itemCount = parseInt(firstLineParts[0], 10); // Total number of elements.
  const thresholdValue = parseInt(firstLineParts[1], 10); // Maximum allowed sum for adjacent elements.

  // Parse the second line to get the array of numbers.
  const numericArray = inputData[1].split(" ").map((currentNum) => parseInt(currentNum, 10));

  // Initialize a counter for the total adjustments made.
  let totalAdjustments = 0;

  // Iterate through the array, checking adjacent pairs.
  // The loop runs up to 'itemCount - 1' because we access 'idx' and 'idx + 1'.
  for (let idx = 0; idx < itemCount - 1; idx++) {
    // Calculate the sum of the current adjacent pair.
    let pairSum = numericArray[idx] + numericArray[idx + 1];

    // If the sum exceeds the allowed threshold, make an adjustment.
    if (pairSum > thresholdValue) {
      // Calculate the excess amount.
      const excessAmount = pairSum - thresholdValue;

      // Reduce the second number of the pair by the excess amount.
      // Ensure the number does not go below zero.
      numericArray[idx + 1] = Math.max(0, numericArray[idx + 1] - excessAmount);

      // Add the excess amount to the total adjustments counter.
      totalAdjustments += excessAmount;
    }
  }

  // Output the final total adjustments made.
  console.log(totalAdjustments);
};

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
