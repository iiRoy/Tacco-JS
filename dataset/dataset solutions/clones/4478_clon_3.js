"use strict";

// Module responsible for processing raw input data to solve the minimum difference problem.
const processInputData = (rawDataString) => {
  // Input validation: Ensure the provided data is a non-empty string.
  // This adds robustness compared to the original code.
  if (typeof rawDataString !== 'string' || rawDataString.length === 0) {
    console.error("Error: Input data must be a non-empty string.");
    return -1; // Indicate a failure or invalid input
  }

  // Step 1: Prepare the input by cleaning and splitting into distinct lines.
  // This involves trimming whitespace and separating by newline characters.
  const parsedLines = rawDataString.trim().split("\n");

  // Ensure we have at least two lines: one for the element count (N) and one for the sequence.
  if (parsedLines.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least two lines.");
    return -1;
  }

  // The first line typically contains the count of elements. While not directly used for loop bounds
  // in the core logic, it's good practice to parse it for potential validations or future extensions.
  const elementQuantity = Number(parsedLines[0]);

  // Step 2: Extract and convert the numeric sequence from the second line.
  // Each string segment is converted to a number, and any non-numeric results are filtered out.
  const numericalSeries = parsedLines[1]
    .split(" ")
    .map(valueStr => Number(valueStr))
    .filter(numVal => !isNaN(numVal));

  // Validate the numerical series to ensure it contains enough elements for a meaningful partition.
  // If there are fewer than two elements, no valid split into two non-empty parts is possible.
  if (numericalSeries.length < 2) {
    // If the problem context guarantees N >= 2, this block might not be strictly necessary.
    // However, it's a good guard against unexpected input.
    console.error("Error: Numerical series must contain at least two elements for partitioning.");
    // In this specific problem, if N=1, the loop for splits won't run, and minimumDifference
    // will remain MAX_SAFE_INTEGER, which is effectively an "no split possible" indicator.
    // Returning -1 here indicates an explicit error for invalid input structure.
    return -1;
  }

  // Step 3: Calculate the total sum of all elements in the numerical series.
  // An explicit loop is used here instead of a `reduce` method for variety in implementation.
  let overallSequenceTotal = 0;
  for (let k = 0; k < numericalSeries.length; ++k) {
    overallSequenceTotal += numericalSeries[k];
  }

  // Step 4: Initialize variables for tracking the sums of the left and right partitions.
  // The first partition considers the very first element as the initial 'left' sum.
  let currentLeftPartitionSum = numericalSeries[0];
  let currentRightPartitionSum = overallSequenceTotal - currentLeftPartitionSum;

  // Step 5: Initialize a variable to store the smallest absolute difference found between partition sums.
  // We use Number.MAX_SAFE_INTEGER as an initial very large value.
  let smallestAbsoluteDifference = Number.MAX_SAFE_INTEGER;

  // Step 6: Iterate through all possible split points in the numerical series.
  // There are `N-1` possible split points for a series of `N` elements.
  // The loop runs from `splitPoint = 0` (split after the first element)
  // up to `numericalSeries.length - 2` (split after the second-to-last element).
  // This ensures `numericalSeries[splitPoint + 1]` is always a valid index.
  for (let splitPoint = 0; splitPoint < numericalSeries.length - 1; ++splitPoint) {
    // Calculate the absolute difference between the current left and right partition sums.
    // An explicit conditional check replaces `Math.abs()` for structural variation.
    let currentDifferenceMagnitude;
    if (currentLeftPartitionSum > currentRightPartitionSum) {
      currentDifferenceMagnitude = currentLeftPartitionSum - currentRightPartitionSum;
    } else {
      currentDifferenceMagnitude = currentRightPartitionSum - currentLeftPartitionSum;
    }

    // Update the smallest absolute difference if the current one is smaller.
    // An explicit conditional check replaces `Math.min()` for structural variation.
    if (currentDifferenceMagnitude < smallestAbsoluteDifference) {
      smallestAbsoluteDifference = currentDifferenceMagnitude;
    }

    // Prepare for the next iteration: move the next element from the right partition to the left.
    // This effectively shifts the split point one position to the right.
    // The element to be moved is always at `splitPoint + 1`.
    const nextElementToShift = numericalSeries[splitPoint + 1];
    currentLeftPartitionSum += nextElementToShift;
    currentRightPartitionSum -= nextElementToShift;
  }

  // Step 7: Output the final result to the console.
  console.log(smallestAbsoluteDifference);

  // Return the calculated value for potential unit testing or further processing.
  return smallestAbsoluteDifference;
};

// Self-executing anonymous function to handle reading input from stdin and invoking the main logic.
// This structure enhances modularity and error handling for the execution environment.
(function executeSolution() {
  try {
    // Dynamically require the 'fs' (file system) module for input operations.
    const fileSystemOperations = require("fs");
    // Read the entire content of standard input synchronously, decoding as UTF-8.
    const rawInputContent = fileSystemOperations.readFileSync("/dev/stdin", "utf8");
    // Pass the raw content to our primary processing function.
    processInputData(rawInputContent);
  } catch (executionError) {
    // Log any errors encountered during file reading or data processing.
    console.error("An error occurred during input processing:", executionError.message);
    // Exit the process with a non-zero code to signal an error condition.
    process.exit(1);
  }
})();