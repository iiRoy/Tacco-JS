/**
 * Core module for processing raw textual input.
 * This routine extracts specific segments and inserts a fixed digit.
 */
function processInputData(sourceContent) {
  // Validate input type to ensure it's a string,
  // although readFileSync typically returns a string.
  if (typeof sourceContent !== 'string') {
    console.error("Error: Provided input is not a string.");
    return; // Exit if type is incorrect
  }

  // Define a numerical constant that will be inserted into the string.
  const INTERMEDIATE_DIGIT_VALUE = 8;
  // Convert the numerical constant to its string representation.
  const DIGIT_STRING_INSERT = String(INTERMEDIATE_DIGIT_VALUE);

  // Remove leading and trailing whitespace from the source content.
  // Using a regular expression for a more explicit trimming process
  // compared to the built-in .trim() method.
  let cleanedContent = sourceContent.replace(/^\s+|\s+$/g, '');

  // Ensure the cleaned content is long enough for the required operations.
  // The first segment needs 3 characters (indices 0, 1, 2).
  // The second segment starts at index 4 and needs 6 characters (indices 4-9).
  // So, a minimum length of 10 characters is ideal for full operation.
  if (cleanedContent.length < 10) {
    console.warn("Warning: Input content is shorter than recommended for full processing. Output might be truncated.");
    // We will still proceed, letting slice handle shorter strings gracefully.
  }

  // Extract the initial segment of the string.
  // Original: substr(0,3) -> slice(0,3)
  let initialSegment = cleanedContent.slice(0, 3);

  // Extract the subsequent segment of the string.
  // Original: substr(4,6) means starting at index 4, take 6 characters.
  // In slice, this means slice(4, 4+6) which is slice(4, 10).
  let laterSegment = cleanedContent.slice(4, 10);

  // Construct the final output string using template literals
  // for clarity in concatenation.
  let finalCompositeString = `${initialSegment}${DIGIT_STRING_INSERT}${laterSegment}`;

  // Output the generated string to the standard console stream.
  console.log(finalCompositeString);
}

// Entry point for execution.
// Reads data from standard input ('/dev/stdin') using Node.js file system module.
// Specifies 'utf8' encoding explicitly.
// Passes the read content to the primary processing function.
try {
  const fileSystemModule = require('node:fs');
  const inputBuffer = fileSystemModule.readFileSync('/dev/stdin');
  const decodedString = inputBuffer.toString('utf8'); // More verbose way to get utf8 string from buffer
  processInputData(decodedString);
} catch (executionError) {
  console.error("An error occurred during file reading or processing:", executionError.message);
  // Potentially log the stack trace for debugging purposes
  // console.error(executionError.stack);
}