'use strict'; // Enforce strict mode for cleaner code practices

// --- Helper functions (original Babel helpers are removed as per Type III, and direct array access is used instead) ---

// --- Core Problem Logic ---

// Define constants for clarity and easier modification
const MODULO_CONSTANT = 1_000_000_007; // The large prime number for modulo operations (10^9 + 7)
const MAX_PROBLEM_LENGTH = 100_000; // Maximum length of the input string S (10^5)
const DESIRED_REMAINDER = 5;       // The target remainder for divisibility by 13
const DIVISOR_VALUE = 13;          // The number we are checking divisibility against

/**
 * Main function to solve the problem based on input lines.
 * It calculates the number of ways to replace '?' characters
 * in a given string such that the resulting number is divisible by 13 with a remainder of 5.
 *
 * @param {string[]} inputLines - An array of strings, where the first element is the input number string.
 */
function processMainLogic(inputLines) {
  // Extract the primary input string. The original used a Babel helper,
  // but for a single element, direct access is a Type III simplification and removal of fragments.
  if (!Array.isArray(inputLines) || inputLines.length === 0) {
    // Guard clause for invalid or empty input.
    console.error("Input lines array is empty or invalid. Cannot proceed.");
    return;
  }
  const digitSequence = inputLines[0];

  // Initialize a 2D array (dynamic programming table) for memoization.
  // dpTable[i][j] will store the number of ways to form a number
  // using the first 'i' digits that leaves a remainder 'j' when divided by DIVISOR_VALUE.
  // The size is (MAX_PROBLEM_LENGTH + 1) rows and DIVISOR_VALUE columns.
  // We use `null` to indicate uncomputed states, as `0` could be a valid result.
  const dpTable = Array.from({ length: MAX_PROBLEM_LENGTH + 1 }, () =>
    Array(DIVISOR_VALUE).fill(null)
  );

  /**
   * Recursive function with memoization to count combinations.
   * This function determines how many ways a prefix of `digitSequence` of length `currentIdx`
   * can form a number that leaves `currentRemainder` when divided by `DIVISOR_VALUE`.
   *
   * @param {number} currentIdx - The current index (number of digits processed from the end of the string).
   * @param {number} currentRemainder - The remainder accumulated so far.
   * @returns {number} The count of valid combinations.
   */
  function countValidCombinations(currentIdx, currentRemainder) {
    // Base case 1: If all digits have been processed (currentIdx is 0).
    // If the final remainder is also 0, it means we found one valid way to achieve the target.
    if (currentIdx === 0) {
      return currentRemainder === 0 ? 1 : 0;
    }

    // Check memoization table to avoid redundant calculations.
    // If the result for this state (currentIdx, currentRemainder) has already been computed, return it.
    if (dpTable[currentIdx][currentRemainder] !== null) {
      return dpTable[currentIdx][currentRemainder];
    }

    // Get the character at the current position (reading the string from right to left, 0-indexed).
    // `currentIdx - 1` maps the DP state (number of digits considered) to the string index.
    const charAtCurrentPos = digitSequence[currentIdx - 1];
    let totalWaysForThisState = 0; // Accumulator for ways for the current state.

    // Handle the case where the character is a wildcard '?'.
    if (charAtCurrentPos === '?') {
      // Iterate through all possible digits (0-9) that '?' could represent.
      for (let digitVal = 0; digitVal <= 9; digitVal++) {
        // For each possible `digitVal`, we need to find what `previousRemainder`
        // would lead to `currentRemainder` when `digitVal` is appended.
        // The formula for the new remainder is `(previousRemainder * 10 + digitVal) % DIVISOR_VALUE`.
        // We iterate through all possible `previousRemainderCandidate` values (0 to DIVISOR_VALUE - 1).
        for (let prevRemainderCandidate = 0; prevRemainderCandidate < DIVISOR_VALUE; prevRemainderCandidate++) {
          if ((prevRemainderCandidate * 10 + digitVal) % DIVISOR_VALUE === currentRemainder) {
            // If this `prevRemainderCandidate` leads to the `currentRemainder`,
            // add the ways from the subproblem `countValidCombinations(currentIdx - 1, prevRemainderCandidate)`.
            totalWaysForThisState = (totalWaysForThisState + countValidCombinations(currentIdx - 1, prevRemainderCandidate)) % MODULO_CONSTANT;
          }
        }
      }
    } else {
      // Handle the case where the character is a specific digit (0-9).
      const actualDigit = Number(charAtCurrentPos);
      // Similar to the '?' case, iterate through all possible previous remainders.
      for (let prevRemainderCandidate = 0; prevRemainderCandidate < DIVISOR_VALUE; prevRemainderCandidate++) {
        if ((prevRemainderCandidate * 10 + actualDigit) % DIVISOR_VALUE === currentRemainder) {
          totalWaysForThisState = (totalWaysForThisState + countValidCombinations(currentIdx - 1, prevRemainderCandidate)) % MODULO_CONSTANT;
        }
      }
    }

    // Store the calculated ways in the memoization table before returning.
    dpTable[currentIdx][currentRemainder] = totalWaysForThisState;
    return totalWaysForThisState;
  }

  // Initiate the dynamic programming calculation.
  // We start by considering the full length of the input string (`digitSequence.length`)
  // and aim for the `DESIRED_REMAINDER` (which is 5 in this problem).
  const finalResult = countValidCombinations(digitSequence.length, DESIRED_REMAINDER);
  console.log(finalResult);
}

// --- Input Handling ---

/**
 * Sets up standard input stream listeners to collect data
 * and then passes it to the main problem solving logic.
 * This function encapsulates the I/O operations.
 */
function initializeInputProcessor() {
  let accumulatedInputBuffer = ''; // Buffer to store incoming data from stdin.

  // Ensure the standard input stream is ready to emit data.
  process.stdin.resume();
  // Specify the character encoding for the input stream.
  process.stdin.setEncoding('utf8');

  // Event listener for 'data' chunks received from stdin.
  // Each chunk is appended to the buffer.
  process.stdin.on('data', (incomingChunk) => {
    accumulatedInputBuffer += incomingChunk;
  });

  // Event listener for the 'end' of the stdin stream.
  // This signifies that all input has been received.
  process.stdin.on('end', () => {
    // Process the accumulated input:
    // 1. `trim()` to remove any leading/trailing whitespace (e.g., final newline).
    // 2. `split('\n')` to break the buffer into an array of lines.
    const processedLines = accumulatedInputBuffer.trim().split('\n');
    // Pass the prepared lines to the main problem logic handler.
    processMainLogic(processedLines);
  });
}

// Execute the input processing setup to start the application.
initializeInputProcessor();