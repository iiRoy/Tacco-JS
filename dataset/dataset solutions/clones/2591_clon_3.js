// This JavaScript module provides a robust solution for comparing two sequences of characters,
// specifically designed to count identical characters at the same positional index
// between the first two distinct lines of a given input text.

// --- Configuration Constants ---
// Define a constant for the newline character used to delineate lines within the input.
const LINE_BREAK_CHAR = '\n';

// Establish a default starting value for the character match counter.
const INITIAL_MATCH_SCORE = 0;

// --- Utility Functions ---

/**
 * Safely retrieves a character from a specified string at a given zero-based index.
 * This helper function prevents potential runtime errors that could occur from
 * attempting to access an out-of-bounds index directly on a string.
 *
 * @param {string} sourceString - The string from which to extract a character.
 * @param {number} charIndex - The numerical index of the character to retrieve.
 * @returns {string | undefined} The character at the specified index, or `undefined`
 *                               if the index is out of bounds or the input is invalid.
 */
function getCharacterAtPosition(sourceString, charIndex) {
  // Perform basic type and boundary checks for defensive programming.
  if (typeof sourceString !== 'string' || charIndex < 0 || charIndex >= sourceString.length) {
    return undefined; // Indicate that no valid character was found.
  }
  return sourceString[charIndex]; // Return the character if checks pass.
}

// --- Core Logic Function ---

/**
 * Processes a multi-line string input to determine the number of exact character matches
 * between the first and second lines at corresponding positions.
 *
 * @param {string} rawInputContent - The complete input string, typically read from a source
 *                                   like standard input, expected to contain at least two lines.
 * @returns {number} An integer representing the total count of identical characters found
 *                   between the first two lines, or 0 if input is invalid or insufficient.
 */
function calculateAlignedMatchCount(rawInputContent) {
  // Input validation: Check if the provided content is a valid non-empty string.
  // An empty string or non-string type will result in no comparisons.
  if (typeof rawInputContent !== 'string' || rawInputContent.length === 0) {
    console.error("Input content is invalid or empty. Cannot perform comparison. Returning 0.");
    return INITIAL_MATCH_SCORE;
  }

  // Split the raw input into an array of individual lines based on the defined separator.
  const separatedLines = rawInputContent.split(LINE_BREAK_CHAR);

  // Critical check: Ensure there are at least two lines available for a meaningful comparison.
  // If fewer than two lines exist, a comparison is not possible as defined by the problem.
  if (separatedLines.length < 2) {
    console.warn("Insufficient lines detected for comparison (minimum two lines required). Returning 0.");
    return INITIAL_MATCH_SCORE;
  }

  // Extract the two primary lines designated for the character-by-character comparison.
  // These variables make the subsequent code more readable and prevent repeated array access.
  const firstSequenceString = separatedLines[0];
  const secondSequenceString = separatedLines[1];

  // Determine the effective length for our iteration. We only need to iterate
  // up to the length of the first string. If the second string is shorter,
  // `getCharacterAtPosition` will gracefully return `undefined` for out-of-bounds access,
  // which will naturally not match any character from the first string.
  const comparisonLength = firstSequenceString.length;

  // Initialize the counter for matching characters. This variable will be
  // incrementally updated during the comparison process.
  let currentMatchTotal = INITIAL_MATCH_SCORE;

  // Iterate through each character position up to the length of the first string.
  // This loop forms the core of the comparison logic.
  for (let currentPosition = 0; currentPosition < comparisonLength; currentPosition++) {
    // Retrieve characters from both strings at the current position using the helper.
    const charFromFirst = getCharacterAtPosition(firstSequenceString, currentPosition);
    const charFromSecond = getCharacterAtPosition(secondSequenceString, currentPosition);

    // Perform the comparison: if both characters exist (not undefined) and are strictly equal,
    // then increment our match counter. The `getCharacterAtPosition` ensures `undefined`
    // is returned for non-existent characters, preventing false matches.
    if (charFromFirst === charFromSecond) {
      currentMatchTotal++;
    }
  }

  // After iterating through all relevant positions, return the final accumulated count.
  return currentMatchTotal;
}

// --- Main Program Execution Block ---
// This immediately invoked function expression (IIFE) handles the program's
// entry point, including reading input and outputting the result.
(function runCharacterMatcher() {
  const fileSystem = require("fs"); // Import the Node.js File System module for I/O operations.
  const standardInputFilePath = "/dev/stdin"; // Define the standard path for reading input.
  let inputDataBuffer = ''; // A variable to store the data read from standard input.

  try {
    // Synchronously read the entire content of the standard input file.
    // Specifying 'utf8' encoding ensures the content is interpreted as a string.
    inputDataBuffer = fileSystem.readFileSync(standardInputFilePath, "utf8");
  } catch (ioError) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`An error occurred while attempting to read from ${standardInputFilePath}: ${ioError.message}`);
    // In a production environment, one might choose to exit the process here.
    return; // Terminate execution if input cannot be read.
  }

  // Invoke the main logic function with the content read from standard input.
  // The result will be the total number of matching characters.
  const finalResult = calculateAlignedMatchCount(inputDataBuffer);

  // Output the computed result to standard output.
  // Using `process.stdout.write` for direct output, ensuring a newline is added manually
  // for consistent output formatting.
  process.stdout.write(String(finalResult) + LINE_BREAK_CHAR);

})(); // Execute the main program immediately.