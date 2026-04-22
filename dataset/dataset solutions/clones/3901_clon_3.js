"use strict";

/**
 * @file This script processes a list of numbers to find a specific pair of values.
 * It also includes utility functions for combinatorics (permutations and combinations),
 * though these are not directly utilized in the main processing logic for the given problem.
 */

/**
 * Computes the number of ordered selections (permutations) of 'itemsToPick' items
 * from a total set of 'totalItems'.
 * This is equivalent to P(n, k) = n! / (n-k)!
 *
 * @param {number} totalItems - The total number of available elements (n).
 * @param {number} itemsToPick - The number of elements to choose (k).
 * @returns {number} The count of distinct ordered arrangements. Returns 0 for invalid inputs.
 */
const computeOrderedSelections = (totalItems, itemsToPick) => {
  // Defensive programming: check for invalid input parameters
  if (itemsToPick < 0 || totalItems < 0) {
    // A negative count of items is not meaningful in combinatorics
    console.warn("Warning: Negative values provided for combinatorics calculation. Returning 0.");
    return 0;
  }
  if (itemsToPick > totalItems) {
    // Cannot pick more items than are available
    return 0;
  }
  if (itemsToPick === 0) {
      // There's one way to pick zero items (the empty set)
      return 1;
  }

  let runningProduct = 1; // Accumulator for the product sequence
  let iterationIndex = 0; // Loop counter

  // The process involves multiplying 'totalItems' by (totalItems - 1), and so on,
  // 'itemsToPick' times.
  while (iterationIndex < itemsToPick) {
    const currentFactor = totalItems - iterationIndex;
    runningProduct *= currentFactor;
    iterationIndex++;
  }

  return runningProduct;
};

/**
 * Determines the number of unordered selections (combinations) of 'subsetSize' items
 * from a larger set of 'overallSetSize'.
 * This is equivalent to C(n, k) = P(n, k) / k! = n! / (k! * (n-k)!)
 *
 * @param {number} overallSetSize - The total number of elements in the set (n).
 * @param {number} subsetSize - The number of elements to choose for the subset (k).
 * @returns {number} The count of distinct unordered subsets. Returns 0 for invalid inputs.
 */
const determineCombinationCount = (overallSetSize, subsetSize) => {
  // Validate input to prevent erroneous calculations or infinite loops.
  if (subsetSize < 0 || overallSetSize < 0) {
    console.warn("Warning: Negative values provided for combination calculation. Returning 0.");
    return 0;
  }
  if (subsetSize > overallSetSize) {
    // It's impossible to choose more items than available
    return 0;
  }
  if (subsetSize === 0 || subsetSize === overallSetSize) {
    // There's only one way to choose zero items (the empty set) or all items (the set itself)
    return 1;
  }

  // Calculate the numerator: P(n, k)
  const numeratorTerm = computeOrderedSelections(overallSetSize, subsetSize);
  // Calculate the denominator: P(k, k) which is k!
  const denominatorTerm = computeOrderedSelections(subsetSize, subsetSize);

  // Guard against division by zero, although computeOrderedSelections should handle this
  // and return 1 for 0!
  if (denominatorTerm === 0) {
    // This case should ideally not be reached for non-negative subsetSize
    console.error("Error: Denominator for combination calculation resulted in zero.");
    return 0;
  }

  return numeratorTerm / denominatorTerm;
};

/**
 * The primary function that orchestrates reading input, processing numerical data,
 * and producing the required output based on specific criteria.
 *
 * @param {string} inputStringContent - The raw string content received from input.
 */
const executeCoreLogic = (inputStringContent) => {
  // Initial validation of the input payload.
  if (typeof inputStringContent !== 'string' || inputStringContent.trim().length === 0) {
    console.error("Execution aborted: Input content is either missing or not a valid string.");
    return; // Terminate execution if input is invalid
  }

  // Pre-process the input string: trim whitespace and split into individual lines.
  const inputLines = inputStringContent.trim().split("\n");

  // Ensure that we have at least two lines of data as expected by the problem.
  if (inputLines.length < 2) {
    console.error("Execution aborted: Insufficient input lines. Expected at least two lines of data.");
    return;
  }

  // The first line often contains a total count or similar metadata.
  // In this specific problem, it's parsed but not directly used in the final output calculation,
  // demonstrating a deletion of its functional dependency.
  const initialCountValue = parseInt(inputLines[0].trim(), 10);
  if (isNaN(initialCountValue)) {
    console.warn("Note: The first line could not be parsed as a number. Proceeding with other data.");
  }
  // The value of 'initialCountValue' is not further referenced, effectively deleted from logic.

  // Process the second line: split by spaces, convert to numbers, and filter out invalid entries.
  const rawNumberStrings = inputLines[1].split(" ");
  const processedNumbers = rawNumberStrings
    .map(str => parseInt(str.trim(), 10)) // Convert each string part to an integer
    .filter(num => !isNaN(num)); // Remove any results that are Not-a-Number

  // If no valid numbers are left after parsing, there's nothing to process.
  if (processedNumbers.length === 0) {
    console.error("Execution aborted: No valid numerical data found in the second input line.");
    return;
  }

  // Sort the numerical data in descending order.
  // A two-step approach: sort ascending, then reverse.
  processedNumbers.sort((valA, valB) => valA - valB); // Sorts from smallest to largest
  processedNumbers.reverse(); // Reverses the order to largest to smallest

  // Identify the largest element from the sorted collection.
  const maximalElement = processedNumbers[0];
  // Calculate the target value, which is half of the maximal element.
  const targetHalfPoint = maximalElement / 2.0; // Use floating point division explicitly

  // Variables to track the element in the array that is closest to the target half-point.
  let currentMinDifference = Number.MAX_VALUE; // Initialize with a very large number
  let closestFoundValue = null; // Initialize to null, will hold the closest number

  // Iterate through the sorted numerical collection to find the number
  // whose absolute difference from 'targetHalfPoint' is the smallest.
  // Using a traditional 'for' loop for variety.
  for (let idx = 0; idx < processedNumbers.length; idx++) {
    const currentNumberFromList = processedNumbers[idx];
    const absoluteDeviation = Math.abs(targetHalfPoint - currentNumberFromList);

    // If a new minimum difference is found, update tracking variables.
    if (absoluteDeviation < currentMinDifference) {
      currentMinDifference = absoluteDeviation;
      closestFoundValue = currentNumberFromList;
    }
  }

  // Construct the final output string using template literals for clarity.
  const resultDisplayString = `${maximalElement} ${closestFoundValue}`;
  console.log(resultDisplayString);
};

// Application entry point: Handles reading from standard input and invoking the core logic.
try {
  // Dynamically require the 'fs' module for file system operations.
  const fileSystemUtility = require('fs');
  // Read the entire content of standard input as a UTF-8 string.
  const standardInputData = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
  // Pass the obtained input data to the main processing function.
  executeCoreLogic(standardInputData);
} catch (errorDetails) {
  // Catch and report any errors encountered during file reading (e.g., file not found, permissions).
  console.error(`An I/O error occurred while reading from /dev/stdin: ${errorDetails.message}`);
  // As a Type III addition, one might provide a fallback or default behavior here,
  // but for this problem, simply logging the error is sufficient.
}