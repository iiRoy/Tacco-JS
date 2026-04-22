// This module provides a utility function to compute a specific similarity metric
// between two initial lines of text provided in a multi-line string payload.
// The comparison focuses on the character-by-character identity of their prefixes.

/**
 * Evaluates the similarity of the first three characters of two input strings.
 * It expects a multi-line string where the first two lines are the strings to compare.
 *
 * @param {string} textualPayload - The raw input string, expected to contain at least two lines.
 */
function evaluateStringSimilarity(textualPayload) {
  // Defensive programming: Validate the incoming payload.
  // An empty or non-string input would lead to errors or unexpected behavior.
  if (typeof textualPayload !== 'string' || textualPayload.trim().length === 0) {
    console.log(0); // Output zero matches for invalid or empty input.
    return;
  }

  // Break down the entire textual content into an array of individual lines.
  // Each element in `inputSegments` will correspond to a line from the payload.
  const inputSegments = textualPayload.split('\n');

  // Define the minimum number of lines required for a meaningful comparison.
  // Our logic specifically needs two distinct lines.
  const MINIMUM_EXPECTED_LINES = 2;

  // Guard clause: Ensure we have enough lines to perform the comparison.
  // If not, it implies insufficient data.
  if (inputSegments.length < MINIMUM_EXPECTED_LINES) {
    console.log(0); // With insufficient data, no matches can be confirmed.
    return;
  }

  // Extract the first two lines, which are the primary subjects for our analysis.
  const primarySequenceStr = inputSegments[0];
  const secondarySequenceStr = inputSegments[1];

  // Define the fixed length for the prefix comparison.
  // The original problem specifies a comparison of the first three characters.
  const COMPARISON_PREFIX_LENGTH = 3;

  // Transform the extracted strings into character arrays for easy indexed access.
  // This allows direct comparison of characters at specific positions.
  const primaryChars = primarySequenceStr.split('');
  const secondaryChars = secondarySequenceStr.split('');

  // Initialize a counter to keep track of identical characters.
  // This variable will store the final similarity score.
  let similarityScore = 0;

  // An auxiliary variable, sometimes useful for debugging or intermediate calculations,
  // though not strictly necessary for the final result in this particular case.
  let currentIterationMatchStatus = false;

  // Iterate over the defined prefix length to compare characters.
  // The loop index (`charPosition`) will range from 0 up to `COMPARISON_PREFIX_LENGTH - 1`.
  for (let charPosition = 0; charPosition < COMPARISON_PREFIX_LENGTH; ++charPosition) {
    // Retrieve characters from both sequences at the current position.
    // If a string is shorter than `charPosition`, accessing `[charPosition]` will yield `undefined`.
    const charFromPrimary = primaryChars[charPosition];
    const charFromSecondary = secondaryChars[charPosition];

    // Perform a strict equality check to determine if the characters are identical.
    // `undefined === undefined` is true, but `char === undefined` is false, which is correct behavior.
    const areCurrentCharsIdentical = (charFromPrimary === charFromSecondary);

    if (areCurrentCharsIdentical) {
      // If a match is found, increment the similarity score.
      // Using `+= 1` instead of `++` for illustrative variation.
      similarityScore += 1;
      currentIterationMatchStatus = true; // Update the auxiliary status variable.
    } else {
      // If no match, the score remains unchanged for this position.
      // The auxiliary status is explicitly set to false.
      currentIterationMatchStatus = false;
    }
  }

  // Output the final computed similarity score to the console.
  // This is the desired result of the function's execution.
  console.log(similarityScore);
}

// --- Program Entry Point and Input Handling ---

// Access the Node.js 'fs' (file system) module to read input.
const fileSystemOperations = require("fs");

// Define the standard input file path, common in Unix-like systems for competitive programming.
const STANDARD_INPUT_FILE_PATH = "/dev/stdin";

// Specify the character encoding for reading the file content.
// UTF-8 is a widely used and robust encoding.
const INPUT_ENCODING_FORMAT = "utf8";

// Synchronously read the entire content of the standard input file.
// This blocks execution until the file is fully read.
const rawInputContent = fileSystemOperations.readFileSync(STANDARD_INPUT_FILE_PATH, INPUT_ENCODING_FORMAT);

// Execute the core logic with the content retrieved from standard input.
// This initiates the similarity evaluation process.
evaluateStringSimilarity(rawInputContent);