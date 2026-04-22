"use strict";

(function () {
  /**
   * Parses a string or array of strings into an array of integers.
   * Handles whitespace separation for string inputs.
   * @param {string | string[]} sourceInput - The input string or array of string tokens.
   * @returns {number[]} An array of parsed integers.
   */
  const processNumericTokens = (sourceInput) => {
    // Validate input type to ensure it's either a string or an array.
    if (typeof sourceInput !== 'string' && !Array.isArray(sourceInput)) {
      console.warn("Invalid input type provided to processNumericTokens. Expected string or array.");
      return []; // Return empty array for invalid input
    }

    // Determine the array of string parts to process.
    // If it's already an array, use it directly; otherwise, split the string.
    const stringParts = Array.isArray(sourceInput) ? sourceInput : sourceInput.split(/\s+/);

    // Map each string part to an integer using parseInt with a radix for safety.
    const numericValues = stringParts.map((token) => {
      const parsed = parseInt(token, 10);
      return isNaN(parsed) ? 0 : parsed; // Default to 0 if parsing fails
    });

    return numericValues;
  };

  /**
   * Handles the final output to the console.
   * @param {number} value - The numeric value to be displayed.
   */
  const displayResult = (value) => {
    console.log(value);
  };

  // Main execution block: an immediately invoked function expression (IIFE).
  (function processInputData(rawData) {
    let computedResult = 0; // Initialize a variable to hold the final outcome.

    try {
      // Split the entire input content by newline characters.
      const sourceLines = rawData.split('\n');

      // Ensure there's at least one line to process.
      if (sourceLines.length === 0 || sourceLines[0].trim() === '') {
        console.error("Input data is empty or malformed.");
        displayResult(0); // Default output for empty input
        return;
      }

      // Process the very first line of the input to extract key numerical parameters.
      const [primaryThreshold, secondaryFactor] = processNumericTokens(sourceLines[0]);

      // Perform a series of conditional checks based on the primary threshold value.
      // This logic determines the final calculation.
      if (primaryThreshold <= 5) {
        // If the primary value is very low, the result is always zero.
        computedResult = 0;
      } else if (primaryThreshold <= 16) {
        // For a moderate primary value, the secondary factor is halved.
        const halfFactor = secondaryFactor / 2;
        computedResult = halfFactor;
      } else {
        // For higher primary values, the secondary factor is used as is.
        computedResult = secondaryFactor;
      }

      // Output the final calculated result.
      displayResult(computedResult);

    } catch (operationError) {
      // Catch and log any unexpected errors during processing.
      console.error("An error occurred during data processing:", operationError.message);
      // As a fallback, output a default value in case of errors.
      displayResult(-1);
    }

  })(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input synchronously from standard input.

})();