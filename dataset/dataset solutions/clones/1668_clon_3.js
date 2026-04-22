"use strict"; // Enforce strict parsing and error handling for robust code

/**
 * Helper function to meticulously parse a string containing space-separated numeric values.
 * It performs trimming, splitting, type conversion, and basic validation.
 * @param {string} sourceString The raw input string to be processed.
 * @returns {number[]} An array of parsed integer values, or an empty array if parsing fails or input format is incorrect.
 */
function obtainParsedNumbers(sourceString) {
  // Remove leading/trailing whitespace and split the string by one or more spaces.
  const rawComponents = sourceString.trim().split(/\s+/);

  // Validate the expected number of input components.
  // For this problem, we anticipate exactly three numerical inputs.
  if (rawComponents.length !== 3) {
    console.error("Input Parsing Error: Expected exactly three numeric arguments, but received " + rawComponents.length + ".");
    return []; // Return an empty array to signal failure.
  }

  // Convert each string component into an integer.
  // We use Number() for explicit type conversion and Math.floor() to ensure integer values.
  const numericalResults = rawComponents.map(singleComponent => {
    const convertedValue = Number(singleComponent);
    if (isNaN(convertedValue)) {
      console.error(`Input Parsing Error: '${singleComponent}' could not be converted to a valid number.`);
      return NaN; // Indicate a failure for this specific component.
    }
    return Math.floor(convertedValue); // Ensure we're working with integers.
  });

  // Perform a final check to ensure all components were successfully parsed.
  if (numericalResults.some(val => isNaN(val))) {
    console.error("Input Validation Error: One or more input values were not valid numbers after conversion.");
    return []; // Return empty if any part failed.
  }

  return numericalResults;
}

/**
 * The primary function that orchestrates the counting algorithm.
 * It reads an input string, parses it into numerical parameters,
 * and then determines the count of multiples within a specified range and upper limit.
 * @param {string} rawInputLine The full line of input read from a source (e.g., stdin).
 */
function executeCountingAlgorithm(rawInputLine) {
  // Step 1: Process the raw input string to extract numerical parameters.
  const numericalParameters = obtainParsedNumbers(rawInputLine);

  // Step 2: Implement a guard clause to exit if input parsing failed.
  if (numericalParameters.length !== 3) {
    // Error messages are already logged by obtainParsedNumbers.
    return;
  }

  // Step 3: Assign the parsed numerical parameters to clearly named constants.
  // This improves readability and ensures values aren't accidentally modified.
  const rangeLowerBoundary = numericalParameters[0];
  const rangeUpperBoundary = numericalParameters[1];
  const commonDivisorValue = numericalParameters[2];

  // Step 4: Validate the common divisor. It must be a positive integer.
  if (commonDivisorValue <= 0 || !Number.isInteger(commonDivisorValue)) {
    console.error("Algorithm Parameter Error: The divisor must be a positive integer.");
    return;
  }

  // Step 5: Initialize a counter for the multiples that satisfy all conditions.
  let validMultipleCounter = 0;

  // Step 6: Define the absolute maximum value to check, mirroring the original problem's implicit constraint.
  // The original problem's loop `i < 101` means it checks values up to and including 100.
  const absoluteMaximumCheckValue = 100;

  // Step 7: Begin the iteration from the first possible multiple of the common divisor.
  // This variable will represent the number currently being evaluated.
  let currentCandidateMultiple = commonDivisorValue;

  // Step 8: Use a while loop to iterate through potential multiples.
  // The loop continues as long as the current candidate does not exceed the absolute maximum.
  while (currentCandidateMultiple <= absoluteMaximumCheckValue) {

    // Step 9: Check if the current candidate multiple falls within the user-defined range.
    const isAboveLowerBound = currentCandidateMultiple >= rangeLowerBoundary;
    const isBelowUpperBound = currentCandidateMultiple <= rangeUpperBoundary;

    // Step 10: If both range conditions are met, increment our counter.
    if (isAboveLowerBound && isBelowUpperBound) {
      validMultipleCounter = validMultipleCounter + 1; // Explicit increment for clarity.
    }

    // Step 11: Advance to the next multiple of the common divisor.
    currentCandidateMultiple = currentCandidateMultiple + commonDivisorValue;
  }

  // Step 12: Output the final tally of multiples found.
  console.log(validMultipleCounter);
}

// Entry point for the application.
// Reads input from standard input (e.g., /dev/stdin in a Unix-like environment)
// and passes it to the main algorithm function.
executeCountingAlgorithm(require("fs").readFileSync("/dev/stdin", "utf-8"));