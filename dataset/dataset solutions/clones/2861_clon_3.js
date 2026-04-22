/**
 * This module provides utility functions for parsing input data and solving a specific
 * combinatorial problem using dynamic programming. The problem involves counting
 * the number of ways to reach a target step `N` by taking steps of size 1 or 2,
 * while avoiding certain "forbidden" steps.
 */

/**
 * Transforms a raw, multi-line string into a structured array of arrays.
 * Each line is first split by a newline, then each resulting string segment
 * is further split by a space character. Optionally, the elements can be
 * converted to integers.
 *
 * @param {string} rawTextContent - The complete string input, typically read from a file or standard input.
 * @param {boolean} [shouldParseAsIntegers=false] - A flag indicating whether individual elements
 *                                                 should be converted to base-10 integers.
 * @returns {Array<Array<string|number>>} A 2D array where each inner array represents a processed line
 *                                        of the original input. Returns an empty array if input is invalid.
 */
function organizeInputIntoMatrix(rawTextContent, shouldParseAsIntegers = false) {
  // Constants for delimiters enhance clarity and make future modifications easier.
  const LINE_BREAK_DELIMITER = '\n';
  const FIELD_DELIMITER = ' ';

  // Pre-condition check: Ensure the input is a valid string and not empty.
  if (typeof rawTextContent !== 'string' || rawTextContent.trim().length === 0) {
    console.error("Input data is either not a string or is empty. Returning an empty matrix.");
    return [];
  }

  // Split the entire input string into an array of individual lines.
  const individualTextLines = rawTextContent.split(LINE_BREAK_DELIMITER);

  // Map each text line to an array of elements, applying transformations as needed.
  const processedDataMatrix = individualTextLines.map(currentLineText => {
    const trimmedCurrentLine = currentLineText.trim();

    // Skip processing for lines that are empty after trimming, to avoid artifacts.
    if (trimmedCurrentLine.length === 0) {
      return []; // Returns an empty array for this line, which will be filtered out.
    }

    // Split the trimmed line into its constituent fields (elements).
    const lineFields = trimmedCurrentLine.split(FIELD_DELIMITER);

    // Apply integer parsing if the flag is set.
    if (shouldParseAsIntegers) {
      return lineFields
        .filter(field => field.length > 0) // Remove any empty strings resulting from multiple spaces.
        .map(stringValue => {
          const numericValue = parseInt(stringValue, 10);
          // Basic error handling for parsing failures.
          if (isNaN(numericValue)) {
            console.warn(`Could not convert "${stringValue}" to an integer. Defaulting to 0.`);
            return 0; // Or throw an error if strict parsing is required.
          }
          return numericValue;
        });
    } else {
      return lineFields;
    }
  }).filter(lineArray => lineArray.length > 0); // Remove any lines that became empty during processing.

  return processedDataMatrix;
}

/**
 * Creates and initializes an array with a specified length and a default value.
 * This is particularly useful for setting up dynamic programming tables.
 *
 * @param {number} desiredLength - The total number of elements the array should contain.
 * @param {*} defaultValue - The value to assign to each element in the new array.
 * @returns {Array<*>} A new array filled with `defaultValue`. Returns an empty array if `desiredLength` is invalid.
 */
const prepareFilledArray = (desiredLength, defaultValue) => {
  // Input validation for the array's desired length.
  if (!Number.isInteger(desiredLength) || desiredLength < 0) {
    console.error(`Invalid length for array creation: ${desiredLength}. Must be a non-negative integer.`);
    return [];
  }

  // Using Array.from for initialization provides a clear, functional approach.
  // It avoids potential issues with `Array(length).fill(object)` for non-primitive default values.
  return Array.from({ length: desiredLength }, () => defaultValue);
};

// The original `chmin` and `chmax` functions have been removed as they were
// not utilized anywhere in the main application logic and thus considered non-essential.

/**
 * The primary function that orchestrates the solution to the combinatorial problem.
 * It parses the input, sets up a dynamic programming table, computes the number
 * of ways to reach a target step, and prints the final result.
 *
 * The problem counts paths from step 0 to `targetStepCount`, where one can move
 * either 1 or 2 steps forward, and certain steps are blocked (forbidden).
 *
 * @param {string} rawApplicationInput - The raw string input containing problem parameters.
 */
function executePathCountingAlgorithm(rawApplicationInput) {
  // Define the modulo constant to keep results within integer limits and prevent overflow.
  const RESULT_MODULO = 1000000007;

  // Step 1: Parse the input string into numerical data.
  const numericalInputMatrix = organizeInputIntoMatrix(rawApplicationInput, true);

  // Critical validation: Ensure the parsed data is in an expected format.
  if (numericalInputMatrix.length === 0 || numericalInputMatrix[0].length === 0) {
    console.error("Failed to parse critical problem parameters from input. Exiting.");
    return;
  }

  // Extract the total number of steps to reach from the first element of the first line.
  const targetStepCount = numericalInputMatrix[0][0];

  // Guard clause for non-positive target step counts, which usually have 0 ways.
  if (targetStepCount <= 0) {
    console.log(0); // If N is 0 or negative, there are no ways to reach it.
    return;
  }

  // Step 2: Process and prepare the list of forbidden step indices.
  // These are given in subsequent lines of the input.
  // The original problem implies these are distinct and provided in sorted order.
  // We explicitly sort them here to ensure the `shift` logic functions correctly.
  let currentlyForbiddenSteps = numericalInputMatrix
    .slice(1) // Get all rows starting from the second row.
    .map(row => row[0]) // Extract the first element from each of these rows.
    .sort((a, b) => a - b); // Sort them numerically for sequential processing.

  // Step 3: Initialize the dynamic programming table.
  // `dpTable[i]` will store the number of ways to reach step `i`.
  // The table needs to accommodate indices up to `targetStepCount`.
  // Original code used `N+2`, which allows for 1-based indexing up to `N+1` or 0-based up to `N+1`.
  // Let's use `targetStepCount + 2` for consistency with the original size.
  const dpTable = prepareFilledArray(targetStepCount + 2, 0);

  // Base case for DP: There is 1 way to be at step 0 (the starting point).
  dpTable[0] = 1;

  // Step 4: Iterate through each possible step from 1 up to the target, filling the DP table.
  for (let currentPosition = 1; currentPosition <= targetStepCount; ++currentPosition) {
    // Check if the current position is a forbidden step.
    // If it is, no paths can lead to it, so `dpTable[currentPosition]` remains 0.
    if (currentlyForbiddenSteps.length > 0 && currentlyForbiddenSteps[0] === currentPosition) {
      currentlyForbiddenSteps.shift(); // Remove this forbidden step as it's been handled.
      continue; // Skip calculation for this step.
    }

    // Calculate contributions from the immediately preceding step (1-step jump).
    let waysFromOneStepBack = dpTable[currentPosition - 1];
    dpTable[currentPosition] = (dpTable[currentPosition] + waysFromOneStepBack) % RESULT_MODULO;

    // Calculate contributions from two steps back (2-step jump), if possible.
    if (currentPosition >= 2) {
      let waysFromTwoStepsBack = dpTable[currentPosition - 2];
      dpTable[currentPosition] = (dpTable[currentPosition] + waysFromTwoStepsBack) % RESULT_MODULO;
    }

    // Ensure the result is always non-negative after the modulo operation.
    // JavaScript's `%` can return negative for negative numbers, though not an issue here since values are always positive.
    if (dpTable[currentPosition] < 0) {
      dpTable[currentPosition] += RESULT_MODULO;
    }
  }

  // Step 5: Output the final computed result for the target step.
  const finalPathCount = dpTable[targetStepCount];
  console.log(finalPathCount);
}

// Entry point for script execution.
// It attempts to read input from standard input and then calls the main algorithm.
try {
  const fileSystemModule = require("fs");
  const stdInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
  executePathCountingAlgorithm(stdInputBuffer);
} catch (executionError) {
  // Catch and report any errors that occur during file reading or algorithm execution.
  console.error("An unexpected error occurred during program execution:", executionError.message);
  // Exit with a non-zero status code to indicate failure.
  process.exit(1);
}