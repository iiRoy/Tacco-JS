"use strict"; // Enforce strict mode for modern JavaScript practices.

/**
 * Orchestrates the analysis of a numeric sequence provided as a string input.
 * It determines a game outcome based on the parity of the range of sorted numbers.
 *
 * @param {string} rawDataString - The entire input content, expected to be multi-line
 *                                 with the first significant number indicating the count
 *                                 of subsequent numbers to process.
 */
function analyzeNumericSequence(rawDataString) {
  // Step 1: Normalize and parse all numeric tokens from the input string.
  // This involves splitting the entire string by any whitespace (spaces, newlines, tabs),
  // filtering out any empty string results, and converting each remaining token to a number.
  const allNumericTokens = rawDataString
    .split(/\s+/)
    .filter(token => token.length > 0) // Ensures only non-empty strings are processed
    .map(Number); // Converts each string token to a numeric value.

  // Step 2: Input validation - Ensure there's actual data to process.
  if (allNumericTokens.length === 0) {
    console.error("Error: The provided input string contains no recognizable numeric data.");
    return; // Exit if no data.
  }

  // Step 3: Extract the declared sequence length from the first token.
  // The problem context implies the first number in the input is 'N'.
  const declaredSequenceLength = allNumericTokens[0];

  // Step 4: Validate the declared sequence length.
  // It must be a valid, positive integer.
  if (isNaN(declaredSequenceLength) || declaredSequenceLength < 0) {
    console.error(`Error: Invalid or non-positive sequence length declared: ${declaredSequenceLength}.`);
    return; // Exit if length is invalid.
  }

  // Step 5: Extract the actual numeric sequence based on the declared length.
  // We slice the array starting from the second element (index 1) up to
  // 'declaredSequenceLength' elements after the first.
  const actualNumericSequence = allNumericTokens.slice(1, declaredSequenceLength + 1);

  // Step 6: Perform an additional check for sequence integrity.
  // This ensures we have enough numbers as declared.
  if (actualNumericSequence.length < declaredSequenceLength) {
    console.warn(`Warning: Extracted sequence has ${actualNumericSequence.length} elements, but ${declaredSequenceLength} were declared. Processing with available data.`);
    // In a real-world scenario, one might decide to throw an error or adjust `declaredSequenceLength` here.
  }

  // Step 7: Handle edge cases for very short sequences.
  // If the sequence has less than two elements, the difference is considered zero (even).
  if (declaredSequenceLength < 2) {
    console.log("PlayerOneWins"); // A difference of 0 is even.
    return;
  }

  // Step 8: Sort the numeric sequence in ascending order.
  // This is crucial for easily identifying the minimum and maximum elements.
  actualNumericSequence.sort((firstVal, secondVal) => firstVal - secondVal);

  // Step 9: Calculate the overall span (range) of the sorted sequence.
  // The sum of adjacent differences (a[1]-a[0]) + (a[2]-a[1]) + ... + (a[N-1]-a[N-2])
  // telescopes down to simply (a[N-1] - a[0]).
  const minimumValue = actualNumericSequence[0];
  const maximumValue = actualNumericSequence[declaredSequenceLength - 1]; // Access the last element.

  const cumulativeDifferenceSpan = maximumValue - minimumValue;

  // Step 10: Determine the game outcome based on the parity of the cumulative difference.
  // If the difference is even, 'PlayerOneWins'; otherwise, 'PlayerTwoWins'.
  const finalOutcomeMessage = (cumulativeDifferenceSpan % 2 === 0) ? 'PlayerOneWins' : 'PlayerTwoWins';

  // Step 11: Output the result to the console.
  console.log(finalOutcomeMessage);
}

// Entry point for execution: Reads input from standard input and processes it.
// This block is specific to a Node.js environment.
try {
  // Attempt to read the entire content of standard input as a UTF-8 string.
  const fileDataContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Pass the raw content to our analysis function.
  analyzeNumericSequence(fileDataContent);
} catch (executionError) {
  // Catch and report any errors encountered during file reading or processing.
  console.error("An unhandled error occurred during script execution:", executionError.message);
  // Optionally, provide more context for specific error types (e.g., file not found).
  if (executionError.code === 'ENOENT') {
    console.error("Please ensure input is provided via /dev/stdin.");
  }
}