"use strict";

/**
 * This module processes raw input data to compute a specific numerical result.
 * It's designed to read structured data, extract key parameters,
 * perform an iterative calculation based on those parameters,
 * and then output a final scaled value.
 */

/**
 * Processes the entire block of raw input text to derive a final computed value.
 * This function orchestrates parsing, data extraction, core computation, and result presentation.
 *
 * @param {string} rawInputContent The complete string content read from the input source.
 */
function calculateWeightedDistanceSum(rawInputContent) {
  // Define a constant for the final scaling operation, enhancing readability.
  const FINAL_SCALING_FACTOR = 2;

  /**
   * Helper function to parse a single line of space-separated numeric strings into an array of integers.
   * Includes basic validation for the input string.
   * @param {string} lineSegment A string representing a line of space-separated numbers.
   * @returns {number[]} An array of parsed integer values. Returns an empty array if input is invalid.
   */
  const parseNumericLine = (lineSegment) => {
    // Ensure the input is a non-empty string before attempting to split and parse.
    if (typeof lineSegment !== 'string' || lineSegment.trim() === '') {
      return [];
    }
    // Split the line by spaces and convert each segment to an integer.
    // Using parseInt with radix 10 for explicit base conversion.
    return lineSegment.split(" ").map(strVal => parseInt(strVal, 10));
  };

  // Step 1: Normalize and split the raw input content into individual lines.
  // Using `trim()` to remove leading/trailing whitespace and `/\r?\n/` to handle both
  // Windows (`\r\n`) and Unix (`\n`) style newlines robustly.
  const contentLines = rawInputContent.trim().split(/\r?\n/);

  // Step 2: Implement a guard clause to ensure the minimum expected number of lines is present.
  // The problem expects at least three lines for configuration and data.
  const MINIMUM_EXPECTED_LINES = 3;
  if (contentLines.length < MINIMUM_EXPECTED_LINES) {
    console.error(`Error: Insufficient input data. Expected at least ${MINIMUM_EXPECTED_LINES} lines, but received ${contentLines.length}.`);
    // In a real application, one might throw an error or exit here.
    return;
  }

  // Step 3: Extract and parse the key parameters from the first two lines.
  // The first line typically contains the total number of items to process.
  const firstDataLine = parseNumericLine(contentLines[0]);
  const totalProcessedItems = firstDataLine[0]; // Corresponds to 'N' in the original problem.

  // The second line contains a critical threshold value for comparisons.
  const secondDataLine = parseNumericLine(contentLines[1]);
  const comparisonValueThreshold = secondDataLine[0]; // Corresponds to 'K' in the original problem.

  // Step 4: Parse the main array of data points from the third line.
  const observedItemValues = parseNumericLine(contentLines[2]); // Corresponds to 'balls' in the original problem.

  // Optional Validation: Check for consistency between the declared item count and the actual data array length.
  // This is a common practice in data processing to catch potential input errors.
  if (totalProcessedItems !== observedItemValues.length) {
    console.warn(`Warning: Declared item count (${totalProcessedItems}) from line 1 differs from actual data point count (${observedItemValues.length}) on line 3. Proceeding with the declared count for loop iteration.`);
    // The original problem implies using N as the loop limit, so we adhere to that.
  }

  // Step 5: Initialize an accumulator variable for the sum of calculated contributions.
  let currentAccumulatedSum = 0; // Corresponds to 'ans' in the original problem.

  // Step 6: Iterate through the observed item values to perform the core calculation.
  // The loop runs 'totalProcessedItems' times, based on the value extracted from the first line.
  for (let itemIndex = 0; itemIndex < totalProcessedItems; itemIndex++) {
    const currentObservation = observedItemValues[itemIndex];

    // Calculate the absolute difference between the current observation and the threshold.
    // This represents one form of "distance".
    const absoluteDifferenceFromThreshold = Math.abs(currentObservation - comparisonValueThreshold);

    // Determine the minimum of two values: the observation itself, or its absolute difference
    // from the comparison threshold. This logic is crucial for the problem's solution.
    let itemContribution;
    if (currentObservation < absoluteDifferenceFromThreshold) {
      itemContribution = currentObservation;
    } else {
      itemContribution = absoluteDifferenceFromThreshold;
    }

    // Add the calculated contribution for the current item to the running total.
    currentAccumulatedSum += itemContribution;
  }

  // Step 7: Apply the final scaling factor to the accumulated sum to get the ultimate result.
  const finalCalculatedOutcome = currentAccumulatedSum * FINAL_SCALING_FACTOR;

  // Step 8: Output the final computed result to the standard console.
  console.log(finalCalculatedOutcome);
}

// Main execution block: Reads input from standard input and initiates the processing.
// This part handles the external dependency of reading from the file system.
const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin"; // Standard path for input on Unix-like systems.

try {
  // Read the entire file content synchronously using UTF-8 encoding.
  const inputFileContents = fileSystemModule.readFileSync(standardInputFilePath, "utf8");
  // Pass the read content to our primary processing function.
  calculateWeightedDistanceSum(inputFileContents);
} catch (ioError) {
  // Catch and report any errors encountered during file reading, e.g., file not found.
  console.error(`Failed to read input from '${standardInputFilePath}': ${ioError.message}`);
  // Optionally, exit the process with a non-zero status to indicate an error.
  // process.exit(1);
}