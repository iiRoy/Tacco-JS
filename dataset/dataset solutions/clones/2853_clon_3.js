"use strict";

// Utility module for handling file system operations.
const fileSystemModule = require("fs");

/**
 * Transforms a given data source (string or array of strings) into an array of valid numbers.
 * It handles whitespace trimming and filters out any non-numeric results.
 *
 * @param {string | string[]} sourceInput - The input data, either a space-separated string or an array of string numbers.
 * @returns {number[]} An array containing only valid numeric values parsed from the input.
 */
function convertInputToNumericArray(sourceInput) {
  // Defensive check for null or undefined input to prevent runtime errors.
  if (sourceInput == null) {
    console.warn("Input for numeric conversion was null or undefined, returning empty array.");
    return [];
  }

  let preliminaryStrings;
  // Branch based on the type of the input source.
  const isArrayFormat = Array.isArray(sourceInput);

  if (isArrayFormat) {
    // If it's already an array, use it directly.
    preliminaryStrings = sourceInput;
  } else if (typeof sourceInput === 'string') {
    // If it's a string, trim leading/trailing whitespace and split by one or more spaces.
    preliminaryStrings = sourceInput.trim().split(/\s+/);
  } else {
    // Log an error for unexpected input types and return an empty array.
    console.error(`Invalid input type for numeric conversion: ${typeof sourceInput}. Expected string or array.`);
    return [];
  }

  // Map each string part to its numeric equivalent and filter out any resulting NaN values.
  const numericalSequence = preliminaryStrings
    .map(function (strValue) {
      // Number() constructor is used for type conversion; it's robust for various number formats.
      return Number(strValue);
    })
    .filter(function (numValue) {
      // Ensure that only actual numbers (not NaN) are retained in the final array.
      return !isNaN(numValue);
    });

  return numericalSequence;
}

// The core application logic is encapsulated within an immediately invoked function expression (IIFE)
// to avoid polluting the global scope and ensure all necessary setup is done before execution.
(function executeMainLogic() {
  let rawTextContent = '';
  const standardInputPath = "/dev/stdin"; // Standard path for input in Unix-like systems.

  // Attempt to read the input file, handling potential errors.
  try {
    rawTextContent = fileSystemModule.readFileSync(standardInputPath, "utf8");
  } catch (fileReadError) {
    // Log a critical error if input cannot be read and terminate the script.
    console.error(`Fatal error: Could not read from ${standardInputPath}. Details: ${fileReadError.message}`);
    process.exit(1); // Exit with a non-zero code to indicate an error.
  }

  // Split the entire input content into individual lines.
  const contentLines = rawTextContent.split("\n");

  // Validate that there is at least one line of meaningful input.
  if (contentLines.length === 0 || contentLines[0].trim().length === 0) {
    console.error("Input contains no valid data lines to process.");
    process.exit(1);
  }

  // Process the first line of the input to extract numerical parameters.
  // We expect three space-separated integers on this line.
  const extractedNumbers = convertInputToNumericArray(contentLines[0]);

  // Define the expected count of numerical parameters.
  const requiredParameterCount = 3;

  // Verify that the correct number of parameters was successfully parsed.
  if (extractedNumbers.length !== requiredParameterCount) {
    console.error(`Data error: Expected ${requiredParameterCount} numbers on the first line, but found ${extractedNumbers.length}.`);
    process.exit(1);
  }

  // Assign the extracted numbers to distinctly named variables for clarity.
  // This avoids the use of helper functions for array destructuring.
  const primaryValue = extractedNumbers[0];
  const secondaryValue = extractedNumbers[1];
  const tertiaryValue = extractedNumbers[2];

  // Calculate the sum of each unique pair of values.
  const sumOfFirstTwo = primaryValue + secondaryValue;
  const sumOfLastTwo = secondaryValue + tertiaryValue;
  const sumOfFirstAndLast = tertiaryValue + primaryValue;

  // Determine the smallest among these three calculated sums.
  const overallMinimumSum = Math.min(sumOfFirstTwo, sumOfLastTwo, sumOfFirstAndLast);

  // Output the final computed result to standard output.
  console.log(`The calculated minimum pairwise sum is: ${overallMinimumSum}`);
})();