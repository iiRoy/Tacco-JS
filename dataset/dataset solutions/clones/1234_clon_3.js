// This script is designed to read input lines, each expected to contain two space-separated numbers.
// It processes these pairs by parsing them into integers, sorting them numerically,
// and then printing the sorted pair back to the console.
// Processing halts when a specific termination signal ('0 0') is encountered.

// Utilize the Node.js 'fs' (file system) module to handle input operations.
var fileSystemAdapter = require('fs');

// Define the standard input stream path, typically used in Unix-like environments.
const standardInputSource = '/dev/stdin';

/**
 * Retrieves raw data from a specified file path.
 * Includes basic error handling for file read operations.
 * @param {string} sourcePath - The path to the input file.
 * @returns {string} The content of the file as a UTF-8 string, or an empty string on error.
 */
function obtainSourceContent(sourcePath) {
  try {
    // Synchronously read the entire file content, assuming 'utf8' encoding.
    return fileSystemAdapter.readFileSync(sourcePath, 'utf8');
  } catch (operationError) {
    // Log any errors encountered during file reading.
    console.error("Failed to read input data from source:", operationError.message);
    return ""; // Provide a default empty string to prevent further errors.
  }
}

/**
 * Processes a single input line containing two space-separated numbers.
 * It parses, numerically sorts, and formats them back into a string.
 * @param {string} lineString - The raw string content of a single line.
 * @returns {string|null} A space-separated string of the sorted numbers, or null if input is invalid.
 */
function parseAndOrderNumericPair(lineString) {
  // Validate the input line: it must be a non-empty string.
  if (typeof lineString !== 'string' || lineString.trim() === '') {
    return null; // Invalid input line.
  }

  // Split the line by spaces to get individual string components.
  const stringParts = lineString.split(' ');

  // Ensure that exactly two components were successfully extracted.
  if (stringParts.length !== 2) {
    return null; // Incorrect number of components.
  }

  // Convert string components into actual numbers.
  // Number() constructor is used for robust parsing, handling potential whitespace.
  const numericalElements = stringParts.map(str => Number(str));

  // Verify that both parsed elements are valid numbers (not NaN).
  if (numericalElements.some(val => isNaN(val))) {
    return null; // One or both components were not valid numbers.
  }

  // Sort the numerical elements in ascending order.
  // The comparator function (a, b) => a - b ensures numerical sorting.
  const orderedElements = numericalElements.sort((first, second) => first - second);

  // Recombine the sorted numbers into a single space-separated string.
  return orderedElements.join(' ');
}

// The primary execution sequence of the script, wrapped in an IIFE (Immediately Invoked Function Expression).
(function scriptMainRoutine() {
  let successfulProcessingCount = 0; // Counter for valid entries processed.

  // Acquire all raw input data from the standard input source.
  const entireInputContent = obtainSourceContent(standardInputSource);

  // Split the content into individual lines, then filter out any blank lines
  // that might result from extra newlines in the input.
  const processedInputLines = entireInputContent
                                .split('\n')
                                .filter(line => line.trim() !== '');

  // Iterate over each line obtained from the input.
  for (const currentProcessedLine of processedInputLines) {
    // Trim any leading or trailing whitespace from the current line for accurate comparison.
    const normalizedLine = currentProcessedLine.trim();

    // Check if the current line matches the termination signal.
    if (normalizedLine === '0 0') {
      // If the termination signal is found, cease further processing.
      break;
    }

    // Attempt to parse and sort the numeric pair within the current line.
    const formattedOutput = parseAndOrderNumericPair(normalizedLine);

    // If the processing was successful (i.e., returned a string, not null).
    if (formattedOutput !== null) {
      // Output the sorted pair to the console.
      console.log(formattedOutput);
      successfulProcessingCount++; // Increment the counter for successful operations.
    }
    // No explicit error logging for invalid lines, as per original's silent skip.
  }

  // Optional: Could log a summary of operations here.
  // console.log(`Script finished. Total valid pairs processed: ${successfulProcessingCount}`);
})(); // End of the main routine execution.