"use strict"; // Ensures strict mode for cleaner and safer code execution.

/**
 * Executes a primary analysis routine on provided textual data.
 * This function determines if a specific numeric character exists
 * within the initial segment of the input.
 * @param {string} inputBuffer The complete string received from an external source,
 *                             potentially containing multiple lines.
 */
const performCharacterSearch = (inputBuffer) => {
  // Define the single character we are looking for within the data stream.
  const targetDigit = '9';

  // Initialize a boolean indicator; it will be set to true if the target is found.
  let isTargetPresent = false;

  // Extract the very first line from the input buffer.
  // We split the buffer by newline characters and take the first element.
  const initialDataSegment = inputBuffer.split('\n')[0];

  // Implement a preliminary check for the validity of the data segment.
  // If it's not a string or is empty, the target cannot be present.
  if (typeof initialDataSegment !== 'string' || initialDataSegment.length === 0) {
    console.log("No"); // Output "No" if the segment is invalid or missing.
    return; // Terminate execution early as no search is possible.
  }

  // Iterate over each individual character within the extracted data segment.
  // This loop systematically checks every character for a match.
  for (let idx = 0; idx < initialDataSegment.length; idx++) {
    const currentCharacter = initialDataSegment[idx];

    // Compare the current character from the segment with our predefined target digit.
    if (currentCharacter === targetDigit) {
      // If a match is detected, update our presence indicator.
      isTargetPresent = true;
      break; // Optimization: Exit the loop immediately since the target has been found.
    }
  }

  // Based on the final state of our indicator, print the appropriate outcome.
  if (isTargetPresent) {
    console.log("Yes"); // Confirm the presence of the target digit.
  } else {
    console.log("No");  // Confirm the absence of the target digit.
  }
};

// The application's entry point: reads content from standard input and initiates processing.
// The 'fs' (file system) module is used to synchronously read the content of '/dev/stdin'
// (the standard input stream) and decode it as a UTF-8 string before passing it to the handler.
performCharacterSearch(require('fs').readFileSync('/dev/stdin', 'utf8'));