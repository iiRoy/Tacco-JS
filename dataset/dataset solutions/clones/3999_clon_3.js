"use strict";

// This module provides a utility for evaluating specific numeric constraints
// related to sequence characteristics, often encountered in algorithmic problems.

/**
 * A boolean flag to control the input source.
 * When true, a hardcoded string is used; otherwise, input is read from stdin.
 */
const IS_DEVELOPMENT_ENVIRONMENT = false;

/**
 * Fetches the initial data string required for processing.
 * Depending on the `IS_DEVELOPMENT_ENVIRONMENT` flag, it either returns
 * a predefined test string or reads content from the standard input.
 *
 * @returns {string} The raw, unprocessed input string.
 */
const obtainPrimaryDataString = () => {
  if (IS_DEVELOPMENT_ENVIRONMENT) {
    // In a development context, a fixed string is used for predictability.
    return "30000 30000 30000";
  } else {
    // For production or testing against actual inputs, read from the system's stdin.
    // The 'fs' module is utilized for synchronous file operations.
    const fileSystemModule = require("fs");
    return fileSystemModule.readFileSync("/dev/stdin", "utf8").trim();
  }
};

/**
 * Analyzes the provided input string, parsing numerical parameters
 * and applying a specific logical check. It determines if a condition
 * related to the sum of two parameters relative to a third is met.
 *
 * @param {string} inputDataPayload The raw string containing space-separated numerical values.
 * @returns {string} Returns "-1" if the condition (sum of A and B <= N) is true,
 *                   otherwise returns an empty string. Includes error logging for invalid inputs.
 */
const performParameterAnalysis = (inputDataPayload) => {
  // Define the character used to separate distinct parameters within the input string.
  const INPUT_FIELD_DELIMITER = " ";

  // Split the input string into an array of substrings based on the delimiter.
  const stringSegments = inputDataPayload.split(INPUT_FIELD_DELIMITER);

  // Basic structural validation: Ensure the expected number of parameters is present.
  if (stringSegments.length !== 3) {
    console.error(`ERROR: Expected three numeric parameters, but found ${stringSegments.length}.`);
    return ""; // Return an empty string on structural input error.
  }

  // Convert the string segments into their numerical integer representations.
  // Number() is used for explicit type conversion, ensuring arithmetic operations are correct.
  const totalSequenceCapacity = Number(stringSegments[0]); // Corresponds to 'N' in original context.
  const requiredIncreasingItems = Number(stringSegments[1]); // Corresponds to 'A'.
  const requiredDecreasingItems = Number(stringSegments[2]); // Corresponds to 'B'.

  // Data type validation: Confirm that all parsed values are valid numbers.
  if (
    isNaN(totalSequenceCapacity) ||
    isNaN(requiredIncreasingItems) ||
    isNaN(requiredDecreasingItems)
  ) {
    console.error("ERROR: One or more input parameters could not be successfully parsed as numbers.");
    return ""; // Return an empty string on numerical parsing error.
  }

  // Calculate the combined total of the two specific item counts.
  // This intermediate variable improves readability of the subsequent conditional check.
  const combinedItemCount = requiredIncreasingItems + requiredDecreasingItems;

  let outcomeIndicator = ""; // Initialize the output string.

  // Apply the core logical condition: Is the combined item count less than or equal
  // to the total sequence capacity?
  if (combinedItemCount <= totalSequenceCapacity) {
    // If the condition holds true, signify a specific state (e.g., 'not possible' or 'invalid')
    // by returning the string "-1".
    outcomeIndicator = "-1";
  } else {
    // Otherwise, if the condition is false, return an empty string,
    // indicating a different state (e.g., 'possible' or 'valid' based on this check).
    outcomeIndicator = "";
  }

  return outcomeIndicator;
};

// --- Primary Execution Block ---
// 1. Retrieve the initial data string from the configured source.
const incomingDataSource = obtainPrimaryDataString();

// 2. Perform the analytical processing on the obtained data.
const finalEvaluationResult = performParameterAnalysis(incomingDataSource);

// 3. Output the determined result to the standard console.
console.log(finalEvaluationResult);