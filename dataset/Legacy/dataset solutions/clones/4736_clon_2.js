'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes the given raw text to find the length of the first substring
 * that starts with 'A' and ends with 'Z'.
 * If no such substring is found, it outputs 0.
 * @param {string} rawData The input string to be processed.
 */
const processInput = (rawData) => {
  // Remove leading/trailing whitespace from the input string.
  const trimmedString = rawData.trim();

  // Attempt to find a substring starting with 'A' and ending with 'Z'
  // using a regular expression. The '.*' matches any character (except newline) zero or more times.
  const matchResult = trimmedString.match(/A.*Z/);

  // Check if a match was found.
  if (matchResult) {
    // If a match exists, output the length of the full matched string.
    console.log(matchResult[0].length);
  } else {
    // If no match was found, output zero.
    console.log(0);
  }
};

// Read the entire content from standard input synchronously and process it.
// The 'utf8' encoding ensures proper character handling.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
