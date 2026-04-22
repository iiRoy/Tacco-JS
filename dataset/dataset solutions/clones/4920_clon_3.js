// This JavaScript module is designed to perform a specific textual analysis,
// calculating a derived metric based on the characteristics of an input string.

/**
 * Executes the primary analytical process on the provided textual data.
 * It determines a numerical metric by considering the total character count
 * and the frequency of a particular target character within the string.
 *
 * @param {string} sourceContent The string data that needs to be analyzed.
 *                               It is expected to be a valid non-empty string.
 * @returns {number | NaN} The computed metric, or NaN if the input is invalid.
 */
function deriveStringCharacteristicMetric(sourceContent) {
  // --- Stage 1: Input Validation and Initial Setup ---
  // Ensure the input is a string and not null or undefined to prevent runtime errors.
  if (typeof sourceContent !== 'string' || sourceContent === null || sourceContent === undefined) {
    console.error("Processing Error: Input for analysis must be a valid string. Received:", typeof sourceContent);
    return NaN; // Indicate an invalid computation result.
  }

  // Define the specific character whose occurrences we need to count.
  const designatedCharacter = 'p';
  // Initialize a counter for the total number of characters in the string.
  let fullCharacterCount = 0;

  // --- Stage 2: Character Counting Operations ---
  // A verbose method to determine the string's length,
  // instead of directly using the built-in '.length' property, for structural variation.
  let characterIndex = 0;
  while (characterIndex < sourceContent.length) {
    fullCharacterCount++;
    characterIndex++;
  }

  // Another method to count occurrences of the 'designatedCharacter'.
  // This uses array conversion and filtering, providing an alternative to regular expressions.
  const occurrencesOfDesignatedChar = Array.from(sourceContent)
                                         .filter(current_char => current_char === designatedCharacter)
                                         .length;

  // --- Stage 3: Metric Calculation ---
  // Calculate an intermediate value: half of the total character count,
  // ensuring it's an integer by rounding down.
  const halfTotalRoundedDown = Math.floor(fullCharacterCount / 2);

  // Perform the final calculation to get the desired metric.
  // This involves subtracting the count of the designated character from the intermediate value.
  const resultantMetricValue = halfTotalRoundedDown - occurrencesOfDesignatedChar;

  // --- Stage 4: Output and Return ---
  // Display the calculated metric to the standard output.
  // This matches the original functionality of logging the result.
  console.log(resultantMetricValue);

  // Return the metric for potential further use, although the original only logged it.
  return resultantMetricValue;
}

/**
 * Utility function to safely acquire input text from the standard input stream.
 * It includes error handling for file system operations.
 *
 * @returns {string} The trimmed content read from /dev/stdin, or an empty string on error.
 */
function obtainApplicationInputData() {
  // Reference to Node.js File System module.
  const filesystemHandler = require('fs');
  // Standard path for reading input in many Unix-like environments.
  const standardInputFile = '/dev/stdin';
  // Encoding format for reading the file content.
  const dataEncoding = 'utf8';

  try {
    // Synchronously read the entire content of the standard input file.
    const rawDataBuffer = filesystemHandler.readFileSync(standardInputFile, dataEncoding);
    // Remove any leading or trailing whitespace (e.g., newlines) from the content.
    const cleanInputText = rawDataBuffer.trim();
    return cleanInputText;
  } catch (ioOperationError) {
    // Log an error message if reading from standard input fails.
    console.error(`Data Acquisition Failure: Could not read from ${standardInputFile}. Details: ${ioOperationError.message}`);
    // Return an empty string to allow the main logic to proceed without crashing,
    // which will then be handled by the validation in 'deriveStringCharacteristicMetric'.
    return '';
  }
}

// --- Main Execution Flow ---
// 1. First, retrieve the necessary input data from the environment.
const primaryInputString = obtainApplicationInputData();

// 2. Then, invoke the core analysis function with the obtained input.
// The result is logged inside the function itself.
deriveStringCharacteristicMetric(primaryInputString);