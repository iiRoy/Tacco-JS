"use strict";

/*
 * Primary routine for processing raw input from a data stream.
 * This function is designed to extract specific numerical tokens from
 * the first three lines of provided text content and then concatenate
 * these tokens into a single output string.
 *
 * @param {string} sourceContent - The raw string input, typically from a file or stdin.
 * @returns {string} A composite string formed by specific extracted parts, or an empty string on error/insufficient data.
 */
const ProcessInputData = (sourceContent) => {
  // Validate the incoming data type. Input must be a string to proceed.
  if (typeof sourceContent !== 'string') {
    // Log an error if the input is not a string and exit early.
    console.error("Error: Input content provided was not a string type.");
    return ""; // Return an empty string as a safe default for invalid input.
  }

  // Pre-process the raw content: trim leading/trailing whitespace and split into lines.
  // Using /\r?\n/ for cross-platform newline handling.
  // Unlike the original, we keep empty lines in the array to maintain index consistency.
  const contentLines = sourceContent.trim().split(/\r?\n/);

  // Implement a guard clause: ensure there are at least three lines as expected.
  if (contentLines.length < 3) {
    console.error("Warning: Not enough input lines. Expected at least 3, but received " + contentLines.length + ".");
    // In this scenario, we'll return an empty string, or we could construct a partial string.
    // For a Type III clone, returning an empty string is a valid form of error handling/graceful degradation.
    return "";
  }

  /*
   * Helper function to robustly extract all sequences of digits from a given text line.
   * This uses a regular expression to find all numeric patterns.
   *
   * @param {string} textSegment - The line of text to parse for numeric tokens.
   * @returns {string[]} An array of strings, where each string is a sequence of digits. Returns an empty array if no digits are found.
   */
  const extractNumericSequences = (textSegment) => {
    // The match() method returns null if no matches are found, so we provide an empty array as a fallback.
    return (textSegment || "").match(/\d+/g) || [];
  };

  // Step 1: Extract all digit sequences from the first line.
  const firstLineExtractedParts = extractNumericSequences(contentLines[0]);
  // Step 2: Extract all digit sequences from the second line.
  const secondLineExtractedParts = extractNumericSequences(contentLines[1]);
  // Step 3: Extract all digit sequences from the third line.
  const thirdLineExtractedParts = extractNumericSequences(contentLines[2]);

  // Define intermediate variables for the specific components required.
  // Use a logical OR (|| '') to default to an empty string if the specific index is not found (e.g., undefined).
  const componentFromLineOne = firstLineExtractedParts[0] || '';
  const componentFromLineTwo = secondLineExtractedParts[1] || '';
  const componentFromLineThree = thirdLineExtractedParts[2] || '';

  // Concatenate the selected components into the final output string.
  // Using template literals for clear string interpolation.
  const finalOutputString = `${componentFromLineOne}${componentFromLineTwo}${componentFromLineThree}`;

  // Display the computed result to the standard output.
  console.log(finalOutputString);

  // Return the final string, allowing this function to be used in other contexts.
  return finalOutputString;
};

// --- Application Execution Block ---
// This section handles reading the input from the standard input stream
// and invoking the main processing function.
try {
  // Use Node.js 'fs' module to synchronously read the entire content of '/dev/stdin'.
  // '/dev/stdin' is a common Unix-like path for standard input.
  const streamContent = require('fs').readFileSync('/dev/stdin', 'utf8');

  // Call the main processing function with the read content.
  ProcessInputData(streamContent);
} catch (executionError) {
  // Catch and log any errors that occur during file reading or script execution.
  console.error(`Fatal Error during input processing: ${executionError.message}`);
  // For debugging, the full error stack could also be logged:
  // console.error(executionError.stack);
}