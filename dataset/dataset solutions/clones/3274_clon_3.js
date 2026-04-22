"use strict";

// This script processes numerical input from standard input to solve a specific problem.
// It determines the minimum number of operations required to make a cumulative sum non-negative.

// Ensure standard input stream is active and configured for UTF-8 encoding.
process.stdin.resume();
process.stdin.setEncoding("utf8");

// Buffer to store raw lines read from stdin.
let acquiredInputLines = [];

// Initialize the readline interface for handling streaming input.
const streamProcessor = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout // Output is not directly used for printing results in this setup, but useful for interactive prompts if needed.
});

// Event listener for each line received from standard input.
streamProcessor.on("line", (currentInputString) => {
  // Store the raw string line. Parsing will happen later when all input is collected.
  acquiredInputLines.push(currentInputString);
});

// Helper function to sum array elements.
const calculateSumOfNumbers = (numericArray) => {
    let currentTotal = 0;
    // Iterate through each number and add it to the running total.
    for (const num of numericArray) {
        currentTotal += num;
    }
    return currentTotal;
};

// Event listener for when the input stream has ended.
streamProcessor.on("close", () => {
  // --- Input Parsing and Validation ---

  // Retrieve the total number of elements from the first line.
  // The first line is expected to be a single integer.
  const totalElements = parseInt(acquiredInputLines.shift(), 10);

  // Parse the second line into an array of primary numerical values.
  // Split by one or more spaces and convert each part to a number.
  const primaryValues = acquiredInputLines.shift().split(/\s+/).map(Number);

  // Parse the third line into an array of secondary numerical values.
  const secondaryValues = acquiredInputLines.shift().split(/\s+/).map(Number);

  // Basic input validation: ensure parsed values match expectations.
  if (isNaN(totalElements) || primaryValues.length !== totalElements || secondaryValues.length !== totalElements) {
    console.error("Error: Malformed input data. Expected N, then N primary values, then N secondary values.");
    return; // Exit if input is invalid.
  }

  // --- Initial Summation Check ---

  // Calculate the sum of primary and secondary values.
  const primaryTotalSum = calculateSumOfNumbers(primaryValues);
  const secondaryTotalSum = calculateSumOfNumbers(secondaryValues);

  // If the total sum of primary values is less than secondary values,
  // it's impossible to achieve a non-negative overall difference, so output -1.
  if (primaryTotalSum < secondaryTotalSum) {
    console.log(-1);
    return; // Early exit.
  }

  // --- Difference Calculation and Categorization ---

  let negativeChangeOperations = 0; // Counts elements where primary[i] - secondary[i] <= 0
  let cumulativeLoss = 0;           // Accumulates negative differences
  let positiveGainDifferences = []; // Stores positive differences

  // Iterate through the elements to calculate differences.
  for (let idx = 0; idx < totalElements; ++idx) {
    const currentDifferential = primaryValues[idx] - secondaryValues[idx];

    if (currentDifferential > 0) {
      // If the difference is positive, add it to our list of gains.
      positiveGainDifferences.push(currentDifferential);
    } else {
      // If the difference is zero or negative, it contributes to loss
      // and requires an operation to be 'fixed' by a positive gain.
      negativeChangeOperations++;
      cumulativeLoss += currentDifferential; // cumulativeLoss will become more negative.
    }
  }

  // --- Greedy Selection of Positive Gains ---

  // Sort positive differences in descending order to prioritize larger gains.
  positiveGainDifferences.sort((valA, valB) => valB - valA);

  let currentAccumulatedGain = 0; // Sum of positive differences chosen so far.
  let gainsAppliedIndex = 0;      // Number of positive differences used.

  // While the combined sum of gains and losses is still negative,
  // and there are still positive gains available to apply:
  while (currentAccumulatedGain + cumulativeLoss < 0 && gainsAppliedIndex < positiveGainDifferences.length) {
    currentAccumulatedGain += positiveGainDifferences[gainsAppliedIndex];
    gainsAppliedIndex++;
  }

  // --- Final Result Output ---

  // The total number of operations is the sum of:
  // 1. Elements that initially had a non-positive difference (negativeChangeOperations).
  // 2. Elements whose positive differences were utilized to offset the cumulative loss (gainsAppliedIndex).
  console.log(negativeChangeOperations + gainsAppliedIndex);
});