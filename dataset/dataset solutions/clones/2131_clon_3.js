/**
 * This module is designed to process incoming raw data streams,
 * extract meaningful numerical parameters, and perform a specific computation.
 * It emphasizes robust input handling and clear separation of concerns.
 */

// Define constants for input processing, enhancing readability and maintainability.
const LINE_DELIMITER_CHAR = '\n';
const TOKEN_DELIMITER_CHAR = ' ';
const STANDARD_INPUT_SOURCE_PATH = '/dev/stdin';
const NUMERIC_RADIX = 10; // Base for integer parsing.

/**
 * Deconstructs a multi-line text buffer into a flat array of individual string tokens.
 * It handles potential empty lines and multiple spaces gracefully.
 *
 * @param {string} rawTextBuffer - The entire raw string content, potentially spanning multiple lines.
 * @returns {Array<string>} A consolidated list of all non-empty string tokens found.
 */
function decomposeInputString(rawTextBuffer) {
  // Perform basic type validation as a guard clause.
  if (typeof rawTextBuffer !== 'string') {
    console.error("Input Error: Expected a string buffer for decomposition.");
    return []; // Return an empty array if input is invalid.
  }

  // Split the buffer into individual line segments.
  const textLines = rawTextBuffer.split(LINE_DELIMITER_CHAR);

  // Utilize a functional approach (flatMap) to process lines and aggregate tokens.
  // This is a structural change from nested forEach loops.
  const processedTokens = textLines.flatMap(currentLine => {
    // Clean up each line by trimming leading/trailing whitespace.
    const trimmedLine = currentLine.trim();

    // Skip any lines that become empty after trimming.
    if (trimmedLine.length === 0) {
      return []; // Return an empty array for flatMap to ignore.
    }

    // Split the trimmed line into tokens based on the defined delimiter.
    const lineTokens = trimmedLine.split(TOKEN_DELIMITER_CHAR);

    // Filter out any empty strings that might result from consecutive delimiters.
    return lineTokens.filter(token => token.length > 0);
  });

  return processedTokens;
}

/**
 * Retrieves raw data from the standard input file path, then orchestrates its initial parsing.
 * This function encapsulates the I/O operations and error handling for data acquisition.
 *
 * @returns {Array<string>} An array of parsed string components ready for numerical conversion.
 */
function acquireAndSegmentData() {
  // Dynamically load the 'fs' (file system) module.
  const fileSystemUtility = require('fs');
  let loadedContent = '';

  try {
    // Attempt to synchronously read the file content, specifying UTF-8 encoding.
    loadedContent = fileSystemUtility.readFileSync(STANDARD_INPUT_SOURCE_PATH, 'utf8');
  } catch (ioError) {
    // Implement robust error reporting for file access issues.
    console.error(`Data Acquisition Error: Could not read from ${STANDARD_INPUT_SOURCE_PATH}. Details: ${ioError.message}`);
    // In a production scenario, application might exit here or return a specific error object.
    return [];
  }

  // Pass the raw string content to the dedicated decomposition function.
  const segmentedArguments = decomposeInputString(loadedContent);

  return segmentedArguments;
}

// The primary execution block of the application, encapsulated within an IIFE.
// This design pattern helps prevent global scope pollution and ensures immediate execution.
(function executeMainProgram() {
  // Step 1: Obtain and segment the input arguments from the specified source.
  const programArguments = acquireAndSegmentData();

  // Step 2: Validate the number of arguments received.
  // A guard clause to ensure we have enough parameters for our calculation.
  if (programArguments.length < 2) {
    console.error("Validation Error: Expected at least two numeric arguments, but received fewer.");
    return; // Halt execution if critical input is missing.
  }

  // Step 3: Parse the required numerical parameters, with explicit radix.
  // Using parseInt with radix 10 for explicit base conversion, safer than unary plus.
  const firstNumericParameter = parseInt(programArguments[0], NUMERIC_RADIX);
  const secondNumericParameter = parseInt(programArguments[1], NUMERIC_RADIX);

  // Step 4: Validate that the parsed values are indeed numbers.
  // Another crucial guard clause to check for NaN results from parsing.
  if (isNaN(firstNumericParameter) || isNaN(secondNumericParameter)) {
    console.error("Validation Error: One or both primary input parameters are not valid numbers.");
    return; // Exit if numerical conversion failed.
  }

  // Step 5: Perform the core calculation, breaking it down into intermediate steps
  // for clarity and potential debugging.
  // Original calculation: R + 100 * (10 - N)
  // Renamed: baseValueY + multiplierConstant * (referenceValue - configParameterX)

  const fixedReferenceValue = 10; // A constant representing the '10' in the original formula.
  const differenceComponent = fixedReferenceValue - firstNumericParameter; // (10 - N)
  const scaleFactor = 100; // The multiplier '100'.
  const scaledTerm = scaleFactor * differenceComponent; // 100 * (10 - N)

  // Final aggregation of terms.
  const finalComputedOutcome = secondNumericParameter + scaledTerm; // R + (100 * (10 - N))

  // Step 6: Output the final result.
  console.log(finalComputedOutcome);

  // Additional non-essential logging statement (example of an added fragment).
  // console.info("Program execution successfully concluded.");

})();