'use strict';

/**
 * Processes a raw string input to extract two numerical values,
 * then computes a score based on their comparison.
 * @param {string} rawInputString The complete input data, expected to contain
 *                                the two numbers on the first line.
 */
function ProcessNumericalInput(rawInputString) {
  // Extract the primary line from the input string.
  // This step handles multi-line inputs by focusing only on the first.
  const initialLine = rawInputString.split('\n')[0];

  // Perform a basic sanity check for non-empty input.
  if (!initialLine || initialLine.trim().length === 0) {
    console.error("Input processing error: No valid data line found.");
    return; // Exit early if input is invalid
  }

  // Split the line into individual string tokens.
  const stringTokens = initialLine.trim().split(' ');

  // Validate that we have at least two tokens for numerical conversion.
  if (stringTokens.length < 2) {
    console.error("Input parsing error: Expected at least two numbers, but received fewer.");
    return;
  }

  // Convert string tokens to integers using a dedicated parsing function.
  // Using parseInt with radix for explicit base 10 conversion.
  const firstValue = parseInt(stringTokens[0], 10);
  const secondValue = parseInt(stringTokens[1], 10);

  // Validate that both parsed values are indeed numbers.
  if (isNaN(firstValue) || isNaN(secondValue)) {
    console.error("Data conversion error: One or both input tokens are not valid integers.");
    return;
  }

  let calculatedResult; // Declare the result variable

  // Determine the larger of the two values.
  const largerOfTwo = Math.max(firstValue, secondValue);

  // The core scoring logic is rewritten for clarity and conciseness.
  // If values are identical, sum them directly.
  // Otherwise, take twice the larger value and subtract one.
  if (firstValue === secondValue) {
    calculatedResult = firstValue + secondValue; // e.g., 5, 5 -> 10
  } else {
    calculatedResult = (largerOfTwo * 2) - 1; // e.g., 5, 7 -> (7 * 2) - 1 = 13
  }

  // Output the final computed score.
  console.log(calculatedResult);
}

// --- Main execution block for reading from standard input ---

// Obtain the file system module for reading input.
const fileReaderUtility = require('fs');

// Specify the standard input device path.
const stdinDevicePath = '/dev/stdin';

try {
  // Attempt to read the entire content of standard input as a UTF-8 string.
  const fileContentString = fileReaderUtility.readFileSync(stdinDevicePath, 'utf8');

  // Invoke the primary processing function with the obtained content.
  ProcessNumericalInput(fileContentString);
} catch (readingError) {
  // Handle any errors that occur during file reading.
  console.error(`Failed to retrieve input from ${stdinDevicePath}: ${readingError.message}`);
  // Optionally, indicate a failure exit code.
  // process.exit(1);
}