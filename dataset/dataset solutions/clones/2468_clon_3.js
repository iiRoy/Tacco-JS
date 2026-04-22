// Function to handle the primary data processing logic for a given input string.
function processInputData(initialDataString) {
  // Pre-check: Ensure the input string is not null, undefined, or empty after trimming.
  // If the input is invalid from the start, output the default error value and exit.
  if (!initialDataString || initialDataString.trim().length === 0) {
    console.log(-1);
    return;
  }

  // Step 1: Divide the raw input string into an array of individual lines.
  // The .trim() call here ensures that any leading or trailing whitespace from the entire input block
  // (e.g., an extra newline at the end of a file) is removed before splitting.
  const allInputLines = initialDataString.trim().split('\n');

  // Step 2: Validate the existence and content of the first line.
  // The program expects numerical data on the very first line.
  if (allInputLines.length === 0 || allInputLines[0].trim().length === 0) {
    console.log(-1); // No valid first line found or it's empty.
    return;
  }

  // Step 3: Extract numeric string tokens from the first line.
  // Using a regex `/\s+/` to split by one or more whitespace characters,
  // then `filter(Boolean)` to remove any empty strings that might result from multiple spaces.
  const numericStringTokens = allInputLines[0].split(/\s+/).filter(Boolean);

  // Define a constant for the upper bound of a "single-digit" number (inclusive).
  const MAX_SINGLE_DIGIT_VALUE = 9;

  /**
   * Helper function: Determines if a given value represents a valid single-digit number.
   * A valid single-digit number is defined as an integer between 0 and MAX_SINGLE_DIGIT_VALUE.
   * It also implicitly handles cases where parsing results in NaN or non-numeric types.
   *
   * @param {*} value - The value to be checked (expected to be a number after parsing).
   * @returns {boolean} - True if the value meets the single-digit criteria, false otherwise.
   */
  const isWithinSingleDigitRange = (value) => {
    // First, ensure the value is actually a number and not NaN (which can result from Number() on invalid strings).
    // Then, check if it's non-negative and within the specified maximum.
    return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= MAX_SINGLE_DIGIT_VALUE;
  };

  // Step 4: Ensure that we have at least two distinct numeric tokens for the operation.
  if (numericStringTokens.length < 2) {
    console.log(-1); // Insufficient operands were provided in the input.
    return;
  }

  // Step 5: Parse the string tokens into actual numeric values.
  // Using the global `Number()` function for parsing, which is robust and returns NaN for non-numeric inputs.
  const firstNumericOperand = Number(numericStringTokens[0]);
  const secondNumericOperand = Number(numericStringTokens[1]);

  let finalCalculationResult; // Declare a variable to hold the outcome of the calculation.

  // Step 6: Apply the core business logic.
  // Check if both parsed operands conform to the single-digit requirement using our helper function.
  if (isWithinSingleDigitRange(firstNumericOperand) && isWithinSingleDigitRange(secondNumericOperand)) {
    // If both operands are valid single-digit numbers, perform the multiplication.
    finalCalculationResult = firstNumericOperand * secondNumericOperand;
  } else {
    // Otherwise, assign the designated error value indicating invalid input numbers.
    finalCalculationResult = -1;
  }

  // Step 7: Output the final computed result or error value to the console.
  console.log(finalCalculationResult);
}

// --- Program Execution Entry Point ---
// Define the standard input file path, common in competitive programming environments.
const standardInputFilePath = "/dev/stdin";

try {
  // Attempt to synchronously read the entire content of the standard input file.
  // The 'utf8' encoding ensures correct interpretation of characters.
  const fileContentString = require("fs").readFileSync(standardInputFilePath, "utf8");

  // Invoke our main data processing function with the content read from the file.
  processInputData(fileContentString);
} catch (fileReadError) {
  // Catch and handle any errors that occur during the file reading process.
  // This could be due to the file not existing, permission issues, etc.
  console.error("An error occurred while attempting to read the input file:", fileReadError.message);
  // Output the designated error value to maintain consistent program behavior even on I/O errors.
  console.log(-1);
}