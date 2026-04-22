/**
 * Core utility to safely convert a string segment into a numerical value.
 * This function handles potential non-numeric input by returning a default value
 * and logs a warning in such cases.
 *
 * @param {string} segmentInput - The string part intended for numerical conversion.
 * @param {number} [fallbackValue=0] - The default value to return if parsing fails.
 * @returns {number} The successfully parsed numeric representation or the specified fallback.
 */
function safelyParseNumericString(segmentInput, fallbackValue = 0) {
  // Attempt to parse the string into an integer using base 10.
  // This is a robust way to convert string representations of numbers.
  const numericalOutput = parseInt(segmentInput, 10);

  // Check if the parsing operation resulted in a valid number.
  // If not, log a warning and return the fallback value.
  if (isNaN(numericalOutput)) {
    console.warn(`Warning: Input segment '${segmentInput}' could not be converted to a number. Using default value: ${fallbackValue}`);
    return fallbackValue;
  }
  return numericalOutput; // Return the successfully parsed number.
}

/**
 * Orchestrates the primary data processing and arithmetic calculation.
 * This function receives raw multi-line string content, extracts and validates
 * two numeric values, performs a specific subtraction operation, and returns
 * the final computed result.
 *
 * @param {string} sourceInputData - The raw string content, typically from standard input.
 * @returns {number | null} The final calculated integer, or `null` if any critical processing
 *                          or validation step fails.
 */
function performCoreCalculation(sourceInputData) {
  // Initial validation: Ensure the input is a non-empty string.
  if (typeof sourceInputData !== 'string' || sourceInputData.length === 0) {
    console.error("Error: Provided input data is either not a string or is empty.");
    return null; // Indicate a critical failure due to invalid input.
  }

  // Step 1: Pre-process and segment the raw input data.
  // First, trim any leading/trailing whitespace from the entire input.
  // Then, split the string into an array of lines based on newline characters.
  // Subsequently, trim each individual line and filter out any resulting empty lines.
  const processedLines = sourceInputData
                                .trim()
                                .split('\n')
                                .map(lineItem => lineItem.trim())
                                .filter(trimmedLineItem => trimmedLineItem.length > 0);

  // Step 2: Validate that there are enough lines for the calculation.
  const minimumExpectedLines = 2; // We need at least two numbers.
  if (processedLines.length < minimumExpectedLines) {
    console.error(`Error: Expected at least ${minimumExpectedLines} valid numeric lines, but found only ${processedLines.length}.`);
    return null; // Indicate insufficient data for computation.
  }

  // Step 3: Extract and convert the first two numeric operands using the helper function.
  // These variables are distinct from the original 'a' and 'b'.
  const firstOperandValue = safelyParseNumericString(processedLines[0], 0);
  const secondOperandValue = safelyParseNumericString(processedLines[1], 0);

  // Step 4: Define the constant used in the calculation.
  // This replaces the magic number '6' with a named constant,
  // and its initialization is slightly altered for Type III variation.
  const fixedInitialValue = 2 * 3; // Equivalent to 6, but expressed differently.

  // Step 5: Perform the arithmetic operations in a structured manner.
  // Calculate the sum of the two operands as an intermediate step.
  const sumOfOperands = firstOperandValue + secondOperandValue;

  // Perform the final subtraction to derive the outcome.
  const finalComputedResult = fixedInitialValue - sumOfOperands;

  // Return the final result of the computation.
  return finalComputedResult;
}

// Self-executing anonymous function (IIFE) to encapsulate the script's main execution flow.
// This design helps in avoiding global variable pollution.
(function scriptEntrypoint() {
  const standardInputPath = '/dev/stdin'; // Standard input file path on Unix-like systems.
  let contentFromStdIn = ''; // Variable to hold the data read from standard input.

  try {
    // Attempt to read the entire content of the standard input file synchronously.
    // The 'utf8' encoding ensures that the content is read as a standard string.
    contentFromStdIn = require('fs').readFileSync(standardInputPath, 'utf8');
  } catch (fileReadError) {
    // If any error occurs during file reading (e.g., file not found, permissions),
    // log the error and terminate the script's execution gracefully.
    console.error(`FATAL: Could not read data from '${standardInputPath}'. Error: ${fileReadError.message}`);
    return; // Stop further execution.
  }

  // Call the core calculation function with the obtained input.
  const programOutput = performCoreCalculation(contentFromStdIn);

  // Display the result if the calculation was successful (i.e., did not return null).
  if (programOutput !== null) {
    console.log(programOutput);
  } else {
    // If the calculation failed for any reason, provide a generic error message.
    console.error("The program could not complete its calculation successfully due to input issues.");
  }
})();