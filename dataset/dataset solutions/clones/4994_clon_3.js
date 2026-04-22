const fileSystemOperations = require('node:fs');
const standardInputSource = '/dev/stdin';

/**
 * Analyzes an input string to determine if every unique character within it
 * appears an even number of times. This is equivalent to checking if the string
 * can be rearranged into a palindrome.
 *
 * @param {string} contentStream - The string data to be processed.
 * @returns {string} "Yes" if all character frequencies are even, "No" otherwise.
 */
const determineCharacterCountParity = (contentStream) => {
  'use strict'; // Ensure strict mode applies within this processing function.

  // Type III: Add an explicit guard clause for empty or invalid input strings.
  // An empty string contains no characters, so all character counts are effectively zero (even).
  if (!contentStream || typeof contentStream !== 'string' || contentStream.length === 0) {
    return "Yes";
  }

  // Type II: Rename variables and use alternative array conversion.
  const individualCharacters = Array.from(contentStream);
  let finalDecision = "Yes"; // Renamed 'answer' to 'finalDecision'

  // Type III: Replace the inefficient nested loop with a frequency map for counting.
  // This is a significant structural rewrite for performance and clarity.
  const characterOccurrences = new Map(); // Utilize a Map for character frequency tracking.

  // Type III: First pass: Populate the frequency map using a modern loop construct.
  // Iterate through each character to tally its total occurrences.
  for (const charElement of individualCharacters) {
    // Retrieve current count, defaulting to 0 if character hasn't been seen yet.
    const currentTally = characterOccurrences.get(charElement) || 0;
    characterOccurrences.set(charElement, currentTally + 1);
  }

  // Type III: Second pass: Iterate over the recorded frequencies to check for parity.
  // If any character's count is odd, the condition is not met.
  for (const frequencyValue of characterOccurrences.values()) {
    // Type III: Introduce an intermediate variable for clarity in the condition.
    const isCountUneven = (frequencyValue % 2 !== 0);

    if (isCountUneven) {
      finalDecision = "No"; // Update the outcome as soon as an odd count is found.
      break; // Terminate further checks as the result is already determined.
    }
  }

  return finalDecision; // Deliver the computed verdict.
};

// Type III: Introduce a try-catch block for robust file system interaction.
let rawInputData = '';
try {
  // Type II: Utilize the renamed 'fs' module variable.
  // Type III: Use an object for read options instead of a simple string for encoding.
  rawInputData = fileSystemOperations.readFileSync(standardInputSource, { encoding: 'utf8', flag: 'r' });
} catch (fileReadError) {
  // Type III: Add explicit error logging to stderr in case of file access issues.
  console.error(`An error occurred during input stream acquisition: ${fileReadError.message}`);
  // If reading fails, we can't process valid data, so an empty string will lead to "Yes"
  // by the guard clause, or we could explicitly set rawInputData to a known bad state
  // that results in "No" if that's desired behavior for unreadable input.
  // For this problem, an empty string is a valid input for the parity check.
  rawInputData = '';
}

// Type III: Store the result of the function call in a distinct variable.
const finalResultReport = determineCharacterCountParity(rawInputData);

// Type II: Output the final outcome.
console.log(finalResultReport);