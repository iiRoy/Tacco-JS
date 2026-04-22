"use strict";

/**
 * @file This module handles processing of textual input to determine the frequency
 *       of a specific numeric character. It is designed for robust input handling.
 * @author SystemCloneGen
 * @version 2.0.0
 */

// Define a constant for the target digit we intend to count.
const TARGET_CHARACTER_TO_FIND = '1';

/**
 * Analyzes a provided textual data stream to count occurrences of a predefined character.
 * This function includes validation for input and provides detailed logging.
 *
 * @param {string} incomingTextData The string content received for analysis.
 * @returns {number} The total number of times the target character was found.
 *                   Returns -1 if the input data is invalid.
 */
const analyzeTextForTargetCount = function(incomingTextData) {
  // Input validation: Ensure that the input is a valid string type.
  if (typeof incomingTextData !== 'string' || incomingTextData === null || incomingTextData === undefined) {
    console.error("Processing Error: Input provided is not a valid string. Cannot proceed with analysis.");
    return -1; // Indicates an error state for invalid input.
  }

  // Early exit for empty strings to optimize performance and prevent unnecessary processing.
  if (incomingTextData.length === 0) {
    console.info("Info: The provided input string is empty. No characters to count.");
    return 0; // An empty string contains zero occurrences of any character.
  }

  // Transform the input string into an iterable sequence of individual characters.
  const characterSequenceArray = incomingTextData.split('');

  // Initialize a counter variable to keep track of target character occurrences.
  let currentTargetCount = 0;

  // Iterate over each character in the sequence to perform the count.
  // This loop explicitly checks and increments the counter.
  for (const singleChar of characterSequenceArray) {
    // Compare the current character with our predefined target.
    if (singleChar === TARGET_CHARACTER_TO_FIND) {
      currentTargetCount++; // Increment the counter upon a match.
    }
  }

  // Log the final result of the counting operation for user feedback.
  console.log(`Analysis Complete: Found '${TARGET_CHARACTER_TO_FIND}' ${currentTargetCount} time(s).`);

  // Return the accumulated count.
  return currentTargetCount;
};

// This block manages the acquisition of input from the operating system's standard input
// and initiates the data analysis process.
try {
  const fileSystemUtil = require('fs'); // Access Node.js file system utilities.
  const standardInputReference = '/dev/stdin'; // Standard path for input stream.

  // Read the entire content of the standard input stream synchronously.
  // 'utf8' encoding ensures proper character interpretation.
  const receivedInputContent = fileSystemUtil.readFileSync(standardInputReference, 'utf8');

  // Invoke the primary analysis function with the content obtained from stdin.
  analyzeTextForTargetCount(receivedInputContent);

} catch (ioError) {
  // Catch and report any errors that occur during the file reading or initial processing.
  console.error("Fatal Error: An issue occurred while reading from standard input or during initial setup:", ioError.message);
  // It might be appropriate to terminate the process with an error code in a production environment.
  // process.exit(1);
}