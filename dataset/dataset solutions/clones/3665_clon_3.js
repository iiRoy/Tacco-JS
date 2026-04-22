// This function processes an input string to count specific character patterns.
// It analyzes character sequences based on an unusual loop condition.
function ProcessCharacterSequence(charDataString) {
  // Initialize a counter for character matches.
  // This variable will store the total number of times the specified pattern is found.
  let consecutiveMatchCounter = 0;

  // Initialize a variable for a calculated position within the string.
  // This will be used to determine which characters to inspect.
  let calcPosition = 0;

  // --- Type III Addition: Guard clause for invalid or empty input ---
  // Ensure the input string is valid before proceeding to avoid runtime errors.
  // If the input is not a string, or is empty, we handle it gracefully.
  if (charDataString === null || typeof charDataString !== 'string' || charDataString.length === 0) {
    // Output 0 matches for invalid or empty input, mirroring a scenario
    // where the loop would not execute or operate on non-existent data.
    console.log(consecutiveMatchCounter);
    return; // Exit the function early.
  }

  // Calculate a threshold for the loop condition.
  // This value determines how many times, if any, the loop will iterate.
  const halfLengthThreshold = charDataString.length / 2;

  // --- Type III Update: Rewrite loop structure from 'for' to 'while' ---
  // Initialize the loop control variable.
  let loopIterator = 2; // Starting point for the iteration.

  // The loop continues as long as the iterator is strictly greater than the half-length threshold.
  // IMPORTANT NOTE: This specific loop condition, combined with 'loopIterator++'
  // means the loop will:
  // 1. Not run at all if charDataString.length >= 4 (e.g., if length is 4, threshold is 2, 2 > 2 is false).
  // 2. Run indefinitely if charDataString.length < 4 (e.g., if length is 3, threshold is 1.5, 2 > 1.5 is true, and iterator keeps growing).
  // This peculiar behavior is intentionally preserved from the original code's design.
  while (loopIterator > halfLengthThreshold) {
    // --- Type III Update: Rewrite calculation for calcPosition using bitwise shift ---
    // Calculate a specific character position based on the current iterator value.
    // (loopIterator << 1) is equivalent to (loopIterator * 2), a common optimization/alternative.
    calcPosition = (loopIterator << 1) + 1; // Equivalent to n = i * 2 + 1 from original

    // --- Type III Addition: Introduce intermediate variables for character indices ---
    // Determine the indices of the characters that will be compared relative to 'calcPosition'.
    const precedingCharIndex = calcPosition - 1;
    const currentCentralCharIndex = calcPosition;
    const succeedingCharIndex = calcPosition + 1;

    // --- Type III Addition: Retrieve characters into dedicated variables ---
    // Accessing string indices that are out of bounds will result in 'undefined'.
    const charAtPreceding = charDataString[precedingCharIndex];
    const charAtCentral = charDataString[currentCentralCharIndex];
    const charAtSucceeding = charDataString[succeedingCharIndex];

    // --- Type III Update: Break down complex conditional logic into boolean flags ---
    // Evaluate if the character immediately before the central position matches the central character.
    const isAdjacentBeforeMatch = (charAtPreceding === charAtCentral);
    // Evaluate if the character immediately after the central position matches the central character.
    const isAdjacentAfterMatch = (charAtSucceeding === charAtCentral);

    // If either of the adjacent character comparisons results in a match (true), increment the counter.
    if (isAdjacentBeforeMatch || isAdjacentAfterMatch) {
      // --- Type III Update: Use alternative increment syntax ---
      consecutiveMatchCounter += 1; // Equivalent to a++ from original
    }

    // Increment the loop iterator to progress to the next potential position.
    loopIterator++;
  }

  // Output the final count of character matches to the console.
  console.log(consecutiveMatchCounter);
}

// --- Type III Update: Encapsulate input acquisition in a helper function ---
/**
 * Helper function to acquire the input string from standard input.
 * This abstracts the file system reading logic, making the main function cleaner
 * and providing a point for potential input validation or transformation.
 * @returns {string} The content read from /dev/stdin, typically a string.
 */
function acquireStandardInputData() {
    // Using a different variable name for the 'fs' module for variety and clarity.
    const fileSystemHandler = require("fs");
    const standardInputPath = "/dev/stdin"; // Standard input file path in Unix-like systems.
    const textEncoding = "utf8"; // Specify the character encoding for reading the file.

    // Read the entire file content synchronously.
    return fileSystemHandler.readFileSync(standardInputPath, textEncoding);
}

// Execute the main processing function with the data acquired from standard input.
ProcessCharacterSequence(acquireStandardInputData());