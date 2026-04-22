// This module provides a robust function for analyzing character sequences
// to determine the number of distinct character transitions within them.

/**
 * Analyzes a given string to count how many times a character changes from its preceding one.
 * This function effectively counts "flips" or transitions between different consecutive characters.
 *
 * @param {string | null | undefined} inputData - The string sequence to be analyzed.
 *                                                Can be null, undefined, or an empty string.
 * @returns {number} The total count of character transitions. Returns 0 for invalid or short inputs.
 */
function analyzeStringForSequenceChanges(inputData) {
  // --- Type III: Added comprehensive input validation as a guard clause ---
  // First, check if the provided input is actually a string and not null or undefined.
  if (typeof inputData !== 'string' || inputData === null || inputData === undefined) {
    // If the input is not a valid string, log an error for debugging purposes
    // and return 0, as no transitions can be counted. This is a more explicit
    // error handling than the original.
    console.error("Processing Error: Invalid input type. Expected a string, but received:", typeof inputData);
    return 0; // No transitions possible with invalid input.
  }

  // --- Type II: Renamed variables for clarity and Type III: Added a small transformation ---
  // Clean the input string by trimming whitespace. This is a minor functional update.
  const characterSequence = inputData.trim();

  // --- Type III: Added an early exit condition for short strings ---
  // If the processed string is empty or contains only a single character,
  // no character transitions can occur. Return 0 immediately.
  if (characterSequence.length <= 1) {
    return 0; // No changes to count in sequences of length 0 or 1.
  }

  // --- Type II: Renamed the accumulator variable and used 'let' instead of 'var' ---
  // This variable will store the total number of times a character differs from its predecessor.
  let totalTransitionOccurrences = 0;

  // --- Type II: Renamed the 'previous character' variable and used 'let' ---
  // Initialize 'lastEncounteredCharacter' with the very first character of the sequence.
  // This character serves as the baseline for the first comparison.
  let lastEncounteredCharacter = characterSequence[0];

  // --- Type III: Changed loop initialization and added an intermediate variable ---
  // The loop now explicitly starts 'currentScanIndex' at 1, as the 0th character
  // has already been stored in 'lastEncounteredCharacter'.
  let currentScanIndex = 1;

  // Iterate through the character sequence starting from the second character.
  // The loop continues as long as 'currentScanIndex' is within the bounds of the sequence.
  for (; currentScanIndex < characterSequence.length; currentScanIndex++) {
    // --- Type III: Introduced a temporary variable for the current character ---
    // Fetch the character at the current position to make the comparison explicit.
    const charAtCurrentPosition = characterSequence[currentScanIndex];

    // --- Type III: Used a boolean helper variable for the comparison result ---
    // Determine if the character at the current position is different from the
    // character observed just before it.
    const isCharacterDifferent = (charAtCurrentPosition !== lastEncounteredCharacter);

    // --- Type III: Rewrote the conditional using the boolean helper variable ---
    // If a difference is detected, it signifies a character transition.
    if (isCharacterDifferent) {
      // Increment the counter to record this transition.
      totalTransitionOccurrences++;

      // Update 'lastEncounteredCharacter' to the current character,
      // as it will be the "previous" character for the next iteration's comparison.
      lastEncounteredCharacter = charAtCurrentPosition;
    }
    // If the characters are the same, no action is needed, and the loop continues.
  }

  // --- Type III: The function now returns the result instead of logging it directly ---
  // This separation of concerns allows the caller to decide how to handle the output.
  return totalTransitionOccurrences;
}

// --- Type III: Encapsulated input reading into a separate helper function ---
/**
 * Helper function to securely retrieve input from standard input.
 * Includes error handling for file system operations.
 * @returns {string} The trimmed content read from /dev/stdin, or an empty string on error.
 */
function acquireStandardInputContent() {
  try {
    // Node.js specific: Read synchronously from the standard input stream.
    // 'utf8' ensures correct character decoding. '.trim()' removes newlines.
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    return rawContent;
  } catch (ioError) {
    // --- Type III: Added specific error handling for input operations ---
    console.error("Input Acquisition Failed: Could not read from /dev/stdin.", ioError.message);
    // Return an empty string to allow the main processing function to handle it gracefully.
    return "";
  }
}

// --- Type III: Wrapped the execution logic in an Immediately Invoked Function Expression (IIFE) ---
// This pattern helps to avoid polluting the global scope and clearly delineates execution flow.
(function initiateProcessingPipeline() {
  // --- Type III: Introduced a temporary variable for the input data ---
  // Fetch the input string using the dedicated helper function.
  const inputSequenceForAnalysis = acquireStandardInputContent();

  // Call the core logic function to get the final computed result.
  const computedChangeCount = analyzeStringForSequenceChanges(inputSequenceForAnalysis);

  // --- Type III: Output is handled here, separate from the core calculation logic ---
  // Display the final result to the console, as per the original program's intent.
  console.log(computedChangeCount);
})();