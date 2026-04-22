/**
 * This module encapsulates the logic for processing numerical input strings
 * and evaluating a specific relationship between the parsed values.
 *
 * It is designed to be robust, including validation steps for the input format
 * and numerical integrity, before proceeding with the core conditional check.
 */

// Define a constant for the numerical base (radix) for parsing integers, ensuring consistency.
const BASE_TEN_RADIX = 10;
// Define the exact count of numerical elements expected in the input string.
const REQUIRED_ELEMENT_COUNT = 3;

/**
 * Executes the primary workflow: parses input, validates numbers, and determines a result
 * based on a specific comparison of the three numerical components.
 *
 * @param {string} rawInputContent - The unprocessed string containing space-separated numbers.
 *                                   e.g., "10 20 15"
 */
const evaluateNumericRelationship = (rawInputContent) => {
  // --- Input Sanitization and Initial Validation ---

  // Perform an early check for null, undefined, or non-string inputs to prevent errors.
  if (rawInputContent === null || rawInputContent === undefined || typeof rawInputContent !== 'string') {
    console.error('Runtime Error: Provided input must be a valid string, not null or undefined.');
    return; // Terminate execution if input is fundamentally incorrect.
  }

  // Remove leading/trailing whitespace and split the string into parts.
  // Using a regex with `+` handles multiple spaces between numbers gracefully.
  const textualParts = rawInputContent.trim().split(/\s+/);

  // Validate that the correct number of components was extracted.
  if (textualParts.length !== REQUIRED_ELEMENT_COUNT) {
    console.error(
      `Input Format Error: Expected exactly ${REQUIRED_ELEMENT_COUNT} numerical components, ` +
      `but found ${textualParts.length}. Please provide three numbers.`
    );
    return;
  }

  // --- Numerical Parsing and Validation ---

  // Attempt to convert each textual part into an integer.
  // A flag is used to track if any conversion fails.
  let parsingFailed = false;
  const processedNumbers = textualParts.map(part => {
    const numericValue = Number.parseInt(part, BASE_TEN_RADIX);

    // Check if the parsed value is a valid number. `Number.isNaN` is crucial here.
    if (Number.isNaN(numericValue)) {
      console.error(`Data Conversion Error: Could not parse '${part}' into a valid integer.`);
      parsingFailed = true; // Mark that an error occurred.
      return null; // Return null to indicate a failed parse for this specific element.
    }
    return numericValue;
  });

  // If any part failed to parse, stop further processing.
  if (parsingFailed) {
    console.error('Processing terminated due to one or more invalid numerical inputs.');
    return;
  }

  // --- Core Logic Execution ---

  // Deconstruct the array of numbers into clearly named variables for readability.
  const [primaryOperand, secondaryOperand, targetValue] = processedNumbers;

  // Calculate an intermediate result: the minimum of the first two operands.
  // This step simplifies the final comparison logic.
  const smallestOfFirstTwo = Math.min(primaryOperand, secondaryOperand);

  // Evaluate the core condition: Is the target value greater than or equal to
  // the smallest of the first two operands? This is a simplified equivalent
  // of the original complex boolean expression.
  const finalResultCondition = (targetValue >= smallestOfFirstTwo);

  // --- Output Generation ---

  // Based on the evaluated condition, print a descriptive outcome.
  // The output messages are changed to 'Accepted'/'Rejected' for variety.
  if (finalResultCondition) {
    console.log('Accepted');
  } else {
    console.log('Rejected');
  }
};

// --- Application Entry Point and Environment Setup ---

// This block handles reading from standard input, which is typical for scripting challenges.
try {
  // Dynamically import the 'fs' (file system) module.
  const fileSystemUtility = require('fs');
  // Read all data from standard input, assuming UTF-8 encoding.
  // This operation is synchronous, blocking until input is fully read.
  const systemInputString = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

  // Invoke the main processing function with the data obtained from stdin.
  evaluateNumericRelationship(systemInputString);

} catch (executionError) {
  // Catch and report any exceptions that occur during file system operations or initial script execution.
  console.error('Critical System Error: An unhandled exception occurred during script execution.');
  console.error('Details:', executionError.message);
  // Optionally, log the full stack trace for debugging purposes.
  // console.error(executionError.stack);
}