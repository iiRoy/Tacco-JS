'use strict';

/**
 * A simple utility function for logging messages to the console.
 * This replaces the original 'p' function for better readability.
 * @param {string} textContent - The string to be outputted.
 */
const transmitResult = (textContent) => console.log(textContent);

/**
 * Examines a numerical range to ascertain if any integer within it
 * is perfectly divisible by a specified integer divisor.
 *
 * This function processes two lines of input:
 *  - The first line contains the divisor value (first token).
 *  - The second line contains two space-separated integers defining the
 *    inclusive start and end of the numerical range.
 *
 * @param {string[]} inputSegments - An array of strings, each representing a line of input.
 * @returns {void} Outputs 'OK' if a divisible number is found, otherwise 'NO'.
 *                  Also outputs error messages for invalid input.
 */
function processNumericInterval(inputSegments) {
  // Input validation: Ensure we have at least two segments (lines).
  if (!Array.isArray(inputSegments) || inputSegments.length < 2) {
    transmitResult('Error: Insufficient input lines provided.');
    return;
  }

  // Parse the divisor from the initial input segment.
  const divisorString = inputSegments[0].trim().split(" ")[0];
  const testDivisor = parseInt(divisorString, 10);

  // Guard clause: Validate the parsed divisor.
  if (isNaN(testDivisor) || testDivisor <= 0) {
    transmitResult('Error: Invalid or non-positive divisor detected.');
    return;
  }

  // Parse the range boundaries from the second input segment.
  const intervalBounds = inputSegments[1].trim().split(" ");
  const lowerBoundary = parseInt(intervalBounds[0], 10);
  const upperBoundary = parseInt(intervalBounds[1], 10);

  // Guard clause: Validate the parsed range boundaries.
  if (isNaN(lowerBoundary) || isNaN(upperBoundary)) {
    transmitResult('Error: Invalid range boundary values detected.');
    return;
  }

  // Guard clause: Ensure the range is logically ordered.
  if (lowerBoundary > upperBoundary) {
    transmitResult('Error: Lower boundary exceeds upper boundary.');
    return;
  }

  // Iterate through each integer within the defined range, inclusive.
  // The original 'i' is renamed to 'currentNumberInSequence'.
  for (let currentNumberInSequence = lowerBoundary; currentNumberInSequence <= upperBoundary; currentNumberInSequence++) {
    // Check for perfect divisibility. Simplified from Math.floor(i%K) === 0.
    if (currentNumberInSequence % testDivisor === 0) {
      transmitResult('OK'); // A divisible number has been located.
      return; // Terminate execution immediately upon finding the first match.
    }
  }

  // If the loop completes without an early return, no divisible number was found.
  // The explicit 'flag' variable from the original code has been removed.
  transmitResult('NO');
}

// Standard entry point for reading input from stdin in competitive programming environments.
// The variable names for file system module and input content are modified.
const fileSystemAccess = require('fs');
const rawInputContent = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputContent.trim().split("\n");

// Execute the primary logic with the prepared input data.
processNumericInterval(processedInputLines);