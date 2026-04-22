/*
 * This module defines a function to analyze an input string
 * for palindromic characteristics, determining if it reads
 * the same forwards and backwards.
 */

/**
 * Reverses a given string using an iterative approach.
 * This helper function avoids array conversions for performance.
 *
 * @param {string} originalValue The string to be reversed.
 * @returns {string} The reversed version of the input string.
 */
function manuallyReverseString(originalValue) {
  let reversedValue = '';
  // Iterate from the end of the string to the beginning
  for (let idx = originalValue.length - 1; idx >= 0; idx--) {
    reversedValue += originalValue[idx];
  }
  return reversedValue;
}

/**
 * Processes a raw string input to check for palindromic symmetry.
 * It cleans the input, handles edge cases, and prints a descriptive
 * result to the console.
 *
 * @param {string | any} sourceContent The raw content to be analyzed.
 */
function evaluateStringSymmetry(sourceContent) {
  // Perform an initial type validation for robustness.
  if (typeof sourceContent !== 'string' || sourceContent === null || sourceContent === undefined) {
    console.error('Validation Error: Provided input must be a valid string.');
    return; // Exit early if input is not a string
  }

  // Normalize the input by removing leading/trailing whitespace.
  const processedSegment = sourceContent.trim();

  // Handle the case of an empty string after trimming.
  if (processedSegment.length === 0) {
    console.log('INFO: The input string was empty after normalization. No symmetry to evaluate.');
    return;
  }

  // Generate the inverted version of the normalized segment.
  const invertedSegment = manuallyReverseString(processedSegment);

  // Compare the original normalized segment with its inverted counterpart.
  // This comparison determines if the string is a palindrome.
  const isSymmetricResult = (processedSegment === invertedSegment);

  // Output the final determination based on the symmetry check.
  if (isSymmetricResult) {
    console.log('SYMMETRIC_MATCH_FOUND');
  } else {
    console.log('NO_SYMMETRIC_MATCH');
  }
}

// Main execution block: Reads from standard input and processes the data.
try {
  // Utilize the 'node:fs' module for explicit clarity and specifies UTF-8 encoding.
  const inputBuffer = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
  // Pass the obtained content to the string symmetry evaluation function.
  evaluateStringSymmetry(inputBuffer);
} catch (fileReadErr) {
  // Catch and report any errors encountered during file reading.
  console.error(`Runtime Error: Could not read from standard input. Details: ${fileReadErr.message}`);
  // In a production environment, one might exit with a non-zero status here.
}