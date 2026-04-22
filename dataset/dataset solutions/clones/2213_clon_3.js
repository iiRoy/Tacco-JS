'use strict';

/**
 * A utility function designed to securely fetch textual data from a specified file path.
 * This abstracts away the direct file system access, enhancing modularity and error handling.
 * @param {string} filePath - The absolute or relative path to the file from which to read data.
 * @returns {string} The content of the file as a UTF-8 encoded string. Returns an empty string on error.
 */
function retrieveSystemInput(filePath) {
  // Utilizing Node.js's built-in 'fs' module for file operations.
  const fileSystemModule = require("fs");

  try {
    // Synchronously read the entire file content, specifying UTF-8 encoding.
    const fileContents = fileSystemModule.readFileSync(filePath, "utf8");
    return fileContents;
  } catch (readError) {
    // If an error occurs during file reading (e.g., file not found, permissions),
    // log the error details and return an empty string to prevent further processing issues.
    console.error(`Error encountered while accessing input source at '${filePath}': ${readError.message}`);
    return '';
  }
}

/**
 * This is the primary processing routine that accepts raw string input,
 * extracts numeric values, performs a specific calculation based on the minimum value,
 * and then generates a repetitive string output.
 * @param {string} rawDataString - The unprocessed string input, potentially containing numbers separated by spaces.
 */
function processNumericalSequence(rawDataString) {
  // Input validation: Ensure the provided data is a non-empty string.
  if (typeof rawDataString !== 'string' || rawDataString.length === 0) {
    console.error("Processing halted: Input data must be a non-empty string.");
    return; // Exit if input is invalid.
  }

  // Normalize the input string:
  // 1. Replace any sequence of whitespace characters with a single space.
  // 2. Remove leading/trailing whitespace.
  // 3. Split the string into an array of tokens using a space as the delimiter.
  const dataTokens = rawDataString.replace(/\s+/g, ' ').trim().split(' ');

  // Validate the number of tokens. We expect at least two numeric tokens.
  if (dataTokens.length < 2) {
    console.error("Processing halted: Insufficient data tokens. Expected at least two numerical inputs.");
    return;
  }

  // Convert the first two tokens into base-10 integers.
  // `parseInt` is used with an explicit radix for robust conversion.
  const firstNumericValue = parseInt(dataTokens[0], 10);
  const secondNumericValue = parseInt(dataTokens[1], 10);

  // Validate that both parsed values are indeed valid numbers.
  if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
    console.error("Processing halted: One or more input tokens could not be converted to valid integers.");
    return;
  }

  // Determine the smaller of the two numeric values.
  // This value will serve as both the digit to be repeated and the basis for the loop count.
  const digitToRepeat = Math.min(firstNumericValue, secondNumericValue);

  // The loop iteration count is based on the *minimum* of the two numbers, plus one.
  // This behavior mirrors a specific characteristic of the original code's loop boundary calculation.
  const totalRepetitions = digitToRepeat + 1;

  // Initialize an array to store individual character segments.
  // This approach can be more memory-efficient than repeated string concatenation for large loops.
  let outputSegments = [];
  let currentSegmentIndex = 0; // Initialize a counter for the loop.

  // Loop to build the output string. A `while` loop is used as an alternative control flow.
  while (currentSegmentIndex < totalRepetitions) {
    // Convert the numeric digit to a string using a template literal.
    outputSegments.push(`${digitToRepeat}`);
    currentSegmentIndex++; // Increment the loop counter.
  }

  // Join all segments in the array to form the final output string.
  const finalOutputString = outputSegments.join('');

  // Output the result to the standard output stream.
  // `process.stdout.write` is used as an alternative to `console.log`,
  // providing direct control over the output stream and typically requiring a newline character.
  process.stdout.write(finalOutputString + '\n');
}

// Entry point for the application:
// First, retrieve the raw input string from standard input ("/dev/stdin" on Unix-like systems).
// Then, pass this raw string to the main processing function.
const receivedInputContent = retrieveSystemInput("/dev/stdin");
processNumericalSequence(receivedInputContent);