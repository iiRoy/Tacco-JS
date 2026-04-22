/**
 * This module processes a sequence of characters to determine if a specific character ('R')
 * achieves a dominance threshold before another character ('B') reaches its own threshold.
 * It reads input from standard input, parses it, and then applies a custom dominance algorithm.
 *
 * This code represents a Type III clone:
 * - All identifiers have been extensively renamed.
 * - Comments have been rewritten and expanded.
 * - Whitespace and formatting have been altered.
 * - Core logic has been extracted into a helper function.
 * - The `for` loop has been replaced with a `while` loop.
 * - The `if/else` character check has been replaced with a `switch` statement.
 * - `break` statements are implicitly handled by direct returns from the helper or a `keepProcessing` flag.
 * - New guard clauses and input validations have been added.
 * - Output strings have been changed.
 * - Explicit floating-point division is used for the threshold calculation.
 * - The input reading mechanism has been wrapped in an immediately invoked function expression (IIFE).
 */
function processSequenceAnalysis(rawInputString) {
  // Split the raw input into individual lines for processing.
  const processedLines = rawInputString.split('\n');

  // Guard clause: Ensure there are at least two lines for length and sequence.
  if (processedLines.length < 2) {
    console.error("Error: Input data is incomplete; expected at least two lines.");
    return;
  }

  // Extract the declared sequence length and the character sequence string.
  const sequenceLengthString = processedLines[0];
  const characterSequenceContent = processedLines[1];

  // Parse the sequence length from string to integer, specifying base 10.
  const totalElementsInSequence = Number.parseInt(sequenceLengthString, 10);

  // Guard clause: Validate the parsed length.
  if (Number.isNaN(totalElementsInSequence) || totalElementsInSequence < 0) {
    console.error("Error: Invalid or non-positive numerical sequence length provided.");
    return;
  }

  // Added validation: Check if the actual sequence content length matches the declared length.
  // This helps catch potential input errors (Type III addition).
  if (characterSequenceContent.length !== totalElementsInSequence) {
    // Specific handling for zero-length cases.
    if (totalElementsInSequence === 0 && characterSequenceContent.length === 0) {
        // This is a valid case for an empty sequence.
    } else if (totalElementsInSequence === 0 && characterSequenceContent.length > 0) {
        console.error("Error: Declared sequence length is 0, but content is not empty.");
        return;
    } else if (characterSequenceContent.length === 0 && totalElementsInSequence > 0) {
        console.error("Error: Declared sequence length is positive, but content is empty.");
        return;
    } else {
        // For non-zero mismatches, log a warning but proceed with declared length
        // as per typical problem constraints, or terminate if strict.
        // Choosing to warn and proceed (Type III update to input handling).
        console.warn(`Warning: Declared sequence length (${totalElementsInSequence}) does not match actual content length (${characterSequenceContent.length}). Processing based on declared length.`);
    }
  }

  /**
   * Encapsulates the core logic for determining 'R' or 'B' dominance.
   * This is a Type III change: extracting functionality into a dedicated helper.
   * @param {number} length The total number of elements to process in the sequence.
   * @param {string} sequence The character string to analyze.
   * @returns {boolean} True if 'R' achieves dominance, false otherwise.
   */
  const calculateDominanceOutcome = (length, sequence) => {
    // If the sequence length is zero, no dominance can be established, so 'R' is not dominant.
    // This is a Type III addition for clarity and edge-case handling.
    if (length === 0) {
      return false;
    }

    let redCharacterOccurrences = 0;
    let blueCharacterOccurrences = 0;

    // The threshold for dominance, calculated as a floating-point number.
    // Explicit `length / 2.0` ensures float division (Type III structural update).
    const requiredDominanceThreshold = length / 2.0;

    let currentProcessingIndex = 0;
    // A flag to control the while loop, replacing explicit `break` statements (Type III update).
    let shouldContinueProcessing = true;

    // Iterate through the sequence using a while loop (Type III structural change).
    while (currentProcessingIndex < length && shouldContinueProcessing) {
      // Fetch the current character at the processing index.
      const evaluatedSymbol = sequence[currentProcessingIndex];

      // Use a switch statement for character evaluation (Type III structural change).
      switch (evaluatedSymbol) {
        case 'R':
          redCharacterOccurrences++;
          // Check if 'R' count strictly exceeds the threshold.
          if (redCharacterOccurrences > requiredDominanceThreshold) {
            // If 'R' dominates, immediately return true. This replaces `ret = true; break;`.
            return true;
          }
          break; // Exit switch, continue while loop.
        case 'B':
          blueCharacterOccurrences++;
          // Check if 'B' count reaches or exceeds the threshold.
          if (blueCharacterOccurrences >= requiredDominanceThreshold) {
            // If 'B' dominates (or matches), 'R' cannot win, so immediately return false.
            // This replaces `ret = false; break;`.
            return false;
          }
          break; // Exit switch, continue while loop.
        default:
          // Handle any unexpected characters by simply ignoring them and continuing.
          // This is a Type III addition for robustness.
          // console.warn(`Skipping unexpected character: '${evaluatedSymbol}' at index ${currentProcessingIndex}.`);
          break;
      }
      currentProcessingIndex++; // Advance to the next character in the sequence.
    }

    // If the loop completes without 'R' achieving dominance, the default outcome is 'false'.
    // This covers cases where neither 'R' nor 'B' reached their thresholds.
    return false;
  };

  // Execute the core dominance calculation logic.
  const finalDominanceResult = calculateDominanceOutcome(totalElementsInSequence, characterSequenceContent);

  // Output the final determination with different phrasing (Type III output update).
  console.log(finalDominanceResult ? 'Outcome: Red Dominant' : 'Outcome: No Red Dominance');
}

// Entry point for script execution.
// The `require("fs").readFileSync` call is wrapped in an Immediately Invoked Function Expression (IIFE)
// to slightly alter the program structure and scope (Type III structural change).
(function() {
  const fileSystemUtility = require("fs"); // Obtain the file system module.
  const standardInputFilePath = "/dev/stdin"; // Define the path for standard input.
  const inputEncodingType = "utf8"; // Specify the encoding for reading the file.

  try {
    // Read all data from standard input synchronously.
    const collectedInputData = fileSystemUtility.readFileSync(standardInputFilePath, inputEncodingType);

    // Invoke the main processing function with the collected input.
    processSequenceAnalysis(collectedInputData);
  } catch (error) {
    console.error("Failed to read from standard input:", error.message);
    // Optionally, handle specific file system errors here.
  }
})();