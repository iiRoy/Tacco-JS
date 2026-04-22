'use strict';

// This function serves as the primary entry point for processing the input data.
// It analyzes numeric conditions based on provided raw string content.
const analyzeNumericCondition = (inputPayload) => {
  // Defensive check: Ensure the input is a non-empty string before proceeding.
  // This guards against potential errors from malformed or absent input.
  if (typeof inputPayload !== 'string' || inputPayload.trim().length === 0) {
    console.error('Operation aborted: Input payload is either empty or not a valid string type.');
    return; // Terminate execution if input is invalid.
  }

  // Extract the very first line from the entire input payload.
  // Using .trim() ensures any leading/trailing whitespace around the line itself is removed.
  const initialDataRow = inputPayload.trim().split('\n')[0];

  // Validate the extracted line, ensuring it's not empty after trimming.
  if (initialDataRow.length === 0) {
    console.error('Operation aborted: First line of input is empty after trimming.');
    return;
  }

  // Split the primary data row into individual string components (tokens) using space as a delimiter.
  const numericTokens = initialDataRow.split(' ');

  // Verify that at least two numeric tokens were successfully extracted.
  // Our logic requires two distinct numerical values for processing.
  if (numericTokens.length < 2) {
    console.error('Operation aborted: Insufficient numerical parameters found on the first line.');
    return;
  }

  // Parse the first token into an integer, representing the upper boundary for calculation.
  // Explicitly using radix 10 for safe integer conversion.
  const upperBoundaryValue = parseInt(numericTokens[0], 10);

  // Parse the second token into an integer, representing the threshold for comparison.
  const comparisonThresholdValue = parseInt(numericTokens[1], 10);

  // Validate that both parsed values are indeed finite numbers.
  // NaN (Not a Number) indicates a failed parsing operation.
  if (isNaN(upperBoundaryValue) || isNaN(comparisonThresholdValue)) {
    console.error('Operation aborted: One or more input parameters are not valid numerical values.');
    return;
  }

  // Apply additional business-level validation: ensure both values are positive integers.
  // This is common for many problem types where 0 or negative values are not meaningful.
  if (upperBoundaryValue < 1 || comparisonThresholdValue < 1) {
    console.error('Operation aborted: Input values must be positive integers greater than zero.');
    return;
  }

  // --- Core Logic Transformation: Counting Odd Numbers (Significant Type III Change) ---
  // The original code used a loop to iteratively count odd numbers up to N.
  // This has been replaced by a more efficient mathematical formula:
  // The count of odd numbers from 1 up to any positive integer 'X' is equivalent to Math.ceil(X / 2).
  // Example: For X=5 (1,3,5), count is 3. Math.ceil(5/2) = Math.ceil(2.5) = 3.
  // Example: For X=4 (1,3), count is 2. Math.ceil(4/2) = Math.ceil(2) = 2.
  const calculatedOddInstances = Math.ceil(upperBoundaryValue / 2);

  // --- Conditional Output Generation (Type II/III Change) ---
  // Instead of a traditional if-else block, a ternary operator is utilized for a more
  // concise expression of the final decision based on the comparison.
  const evaluationResult = (calculatedOddInstances > comparisonThresholdValue) ? 'YES' : 'NO';

  // Display the determined outcome to the standard output.
  console.log(evaluationResult);
};

// This Immediately Invoked Function Expression (IIFE) manages the overall program execution flow.
// It handles input acquisition and error handling for the top-level operation.
(() => {
  let rawSystemInput = ''; // Initialize a variable to hold the raw input string.
  try {
    // Attempt to synchronously read all content from the standard input stream.
    // '/dev/stdin' is the conventional path for standard input on Unix-like systems.
    rawSystemInput = require('fs').readFileSync('/dev/stdin', 'utf8');
  } catch (error) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`Fatal error encountered while reading from standard input: ${error.message}`);
    return; // Exit the program gracefully if input cannot be read.
  }

  // Pass the successfully acquired input content to our main analysis function.
  analyzeNumericCondition(rawSystemInput);
})();