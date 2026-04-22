// Helper utility function to ascertain if all characters within a given string sequence are identical.
function verifyHomogeneity(inputSequence) {
  const sequenceLength = inputSequence.length;

  // Edge case: an empty string or a string with a single character is considered homogeneous.
  if (sequenceLength <= 1) {
    return true;
  }

  // Establish the first character as the reference point for comparison.
  const referenceChar = inputSequence.charAt(0);

  // Iterate through the remaining characters, starting from the second one.
  for (let charPointer = 1; charPointer < sequenceLength; charPointer++) {
    // If any character deviates from the reference, the sequence is not homogeneous.
    if (inputSequence.charAt(charPointer) !== referenceChar) {
      return false;
    }
  }

  // If the loop completes, all characters were found to be identical.
  return true;
}

// Utility function to increment a numeric string value by one and return it as a string.
function advanceNumericString(valueString) {
  // Convert the string representation of the number to an actual numeric type.
  const currentNumericValue = Number(valueString);

  // Perform the increment operation.
  const nextNumericValue = currentNumericValue + 1;

  // Convert the incremented number back into a string for subsequent operations.
  return String(nextNumericValue);
}

// The core function designed to process an initial numerical input
// and find the smallest subsequent number where all its digits are identical.
function processNumericalChallenge(initialInputContent) {

  // --- Input Validation and Initial Data Extraction ---

  // Guard clause: Ensure the provided input is a valid string.
  if (!initialInputContent || typeof initialInputContent !== 'string') {
    // In a production scenario, one might log an error or throw an exception here.
    // For this exercise, we'll simply exit.
    return;
  }

  // Extract the very first line from the input, remove leading/trailing whitespace,
  // and assign it as our starting candidate string.
  let currentCandidateString = initialInputContent.trim().split('\n')[0];

  // Guard clause: Validate that the extracted candidate string is indeed a number string.
  if (!currentCandidateString || !/^\d+$/.test(currentCandidateString)) {
    // Handle cases where the first line isn't a valid positive integer string.
    return;
  }

  // --- Main Search Loop Configuration ---

  let isTargetFound = false; // A boolean flag to manage the termination of our search loop.
  let iterationCounter = 0;   // An auxiliary variable to track the number of attempts (for debugging/metrics).

  // The primary search loop continues indefinitely until the 'isTargetFound' flag is set to true.
  while (!isTargetFound) {
    iterationCounter++; // Increment the counter for each cycle.

    // Utilize the 'verifyHomogeneity' helper function to check the current candidate.
    if (verifyHomogeneity(currentCandidateString)) {
      // If all digits are the same, this is our desired result.
      console.log(currentCandidateString); // Output the homogeneous number.
      isTargetFound = true;               // Set the flag to true to exit the loop.
    } else {
      // If the digits are not homogeneous, we need to increment the number.
      // The 'advanceNumericString' helper handles the conversion and increment.
      currentCandidateString = advanceNumericString(currentCandidateString);
    }
  }
}

// --- Standard Input Handling for Execution Environment ---

// Import the 'fs' (file system) module to read input.
const fileSystem = require('fs');

// Define the standard input path, common in Unix-like environments.
const standardInputPath = '/dev/stdin';

// Specify the character encoding for reading the input file.
const encodingType = 'utf8';

// Read the entire content of the standard input file synchronously.
// Then, pass this content to our main processing function.
processNumericalChallenge(fileSystem.readFileSync(standardInputPath, encodingType));