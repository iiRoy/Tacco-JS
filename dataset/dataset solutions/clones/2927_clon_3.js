"use strict";

// This immediately invoked function expression (IIFE) encapsulates the entire script
// to avoid polluting the global scope and manage dependencies.
(function () {

  /**
   * Processes an input string or array of strings, attempting to extract and convert
   * all valid numeric tokens into an array of integers. It handles various input formats
   * and provides robustness against non-numeric data.
   *
   * @param {string | string[]} sourceContent - The data to be parsed. Can be a single string
   *   with space-separated numbers, or an array of strings representing numbers.
   * @returns {number[]} An array containing only the successfully parsed integer values.
   */
  function retrieveNumericSequence(sourceContent) {
    let potentialTokens; // Intermediate variable to hold string parts

    // Determine the initial tokenization strategy based on the input type.
    if (Array.isArray(sourceContent)) {
      potentialTokens = sourceContent; // If already an array, use it directly.
    } else if (typeof sourceContent === 'string') {
      // If it's a string, trim whitespace and split by one or more spaces.
      // Filter out any empty strings that might result from multiple spaces.
      potentialTokens = sourceContent.trim().split(/\s+/).filter(segment => segment.length > 0);
    } else {
      // Log an error for unexpected input types and return an empty array.
      console.error("Input type for 'retrieveNumericSequence' is invalid. Expected string or array, got:", typeof sourceContent);
      return [];
    }

    // Convert each potential token to a number.
    // Use Number() for conversion and then filter out any results that are NaN (Not a Number).
    const numericResults = potentialTokens.map(tokenString => Number(tokenString)).filter(value => !isNaN(value));

    // Optional: Provide a warning if no valid numbers were extracted from non-empty input.
    if (numericResults.length === 0 && potentialTokens.length > 0) {
      console.warn("No valid numeric values could be extracted from the provided input:", sourceContent);
    }

    return numericResults;
  }

  // This inner IIFE serves as the main execution block for the application's logic.
  // It takes the raw data loaded from an external source.
  (function executeMainCalculation(rawInputBuffer) {
    // Perform initial validation on the raw input data.
    if (typeof rawInputBuffer !== 'string' || rawInputBuffer.trim().length === 0) {
      console.error("Fatal Error: The provided input data is either empty or not a valid string.");
      return; // Exit early if input is unusable.
    }

    // Split the raw buffer into individual lines and clean them up.
    // Filtering ensures we don't process empty lines (e.g., trailing newlines).
    const contentRows = rawInputBuffer.split("\n").filter(row => row.trim().length > 0);

    // Guard clause: Ensure there's at least one line of meaningful data.
    if (contentRows.length === 0) {
      console.log("No relevant data lines were found in the input stream.");
      return;
    }

    // Focus on the first line of the input for our primary values.
    const parsedValuesFromFirstLine = retrieveNumericSequence(contentRows[0]);

    // Validate that we have sufficient numeric data from the first line.
    const REQUIRED_VALUE_COUNT = 2;
    if (parsedValuesFromFirstLine.length < REQUIRED_VALUE_COUNT) {
      console.error(`Insufficient numeric values on the first line. Expected ${REQUIRED_VALUE_COUNT}, but found ${parsedValuesFromFirstLine.length}.`);
      // Depending on requirements, one might set defaults here or throw an error.
      return;
    }

    // Use array destructuring to assign the extracted values to descriptive variables.
    const [primaryComparisonValue, secondaryCalculationOperand] = parsedValuesFromFirstLine;

    let computedOutcome = 0; // Initialize the variable that will hold our final result.

    // Apply the core business logic based on the primary comparison value.
    if (primaryComparisonValue <= 5) {
      // Scenario 1: Primary value is very small.
      computedOutcome = 0;
    } else if (primaryComparisonValue <= 12) {
      // Scenario 2: Primary value is moderate.
      // Add an explicit check for the operand's validity before performing division.
      if (typeof secondaryCalculationOperand === 'number' && !isNaN(secondaryCalculationOperand)) {
        computedOutcome = secondaryCalculationOperand / 2;
      } else {
        console.warn("Warning: Secondary operand is not a valid number for division. Defaulting to 0.");
        computedOutcome = 0; // Fallback for invalid operand.
      }
    } else {
      // Scenario 3: Primary value is large.
      computedOutcome = secondaryCalculationOperand;
    }

    // Output the final calculated outcome to the standard output.
    console.log(computedOutcome);

  // The application reads its input from the standard input stream, typically "/dev/stdin"
  // in Unix-like environments, using Node.js's 'fs' module.
  })(require("fs").readFileSync("/dev/stdin", "utf8"));

})(); // End of the main application IIFE.