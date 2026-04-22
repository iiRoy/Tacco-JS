"use strict";

/**
 * Processes a multi-line input string to simulate operations on a dynamic sequence of elements.
 * The sequence can be conceptually reversed, and elements can be added to its logical front or back.
 *
 * @param {string} rawInputData - The complete input string, typically from standard input.
 *                                 Expected format:
 *                                 Line 1: Initial sequence of tokens (space-separated or single token)
 *                                 Line 2: Number of operations (unused in this version)
 *                                 Following lines: Operations.
 *                                   - Single token (e.g., '2'): Toggles the conceptual reversal state.
 *                                   - Three tokens (e.g., '1 1 X'): Adds element 'X'.
 *                                     '1 1 X' adds 'X' to the logical front.
 *                                     '1 2 X' adds 'X' to the logical back.
 */
function ExecuteSequenceOperations(rawInputData) {

  // Safeguard against empty or malformed input data
  if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim() === "") {
    console.log(""); // Output an empty string for no input
    return;
  }

  // Break down the input string into individual lines, discarding any blank lines
  const parsedInputLines = rawInputData.split("\n").map(line => line.trim()).filter(Boolean);

  // Extract the very first line to initialize our mutable sequence of string elements.
  // Using /\s+/ for splitting handles multiple spaces and ensures no empty strings from split.
  let currentElementSequence = parsedInputLines.shift().split(/\s+/).filter(Boolean);

  // The original problem might have a line indicating the number of operations,
  // but it's often not strictly necessary for array-based processing.
  // We'll remove it from the parsed lines but not use its value, demonstrating a deletion of unused code.
  const operationCountString = parsedInputLines.shift(); // This line is now effectively discarded.

  // Parse the remaining lines into structured operation descriptions.
  // Each description is an array of strings, representing tokens on that line.
  const operationDetailsList = parsedInputLines.map(line => line.split(/\s+/).filter(Boolean));

  // A boolean flag to track the conceptual reversal state of the sequence.
  // 'false' means the sequence is in its natural order (front is index 0).
  // 'true' means the sequence is conceptually reversed (front is the last element).
  let isDisplayOrderReversed = false;

  /**
   * Determines if an element should be appended to the physical end of the array
   * given the desired logical position and the current reversal state.
   *
   * @param {string} desiredLogicalPosition - '1' for logical front, '2' for logical back.
   * @param {boolean} currentReverseState - True if the sequence is currently conceptually reversed.
   * @returns {boolean} True if the element should be added using `push()`, false for `unshift()`.
   */
  const determinePhysicalAppendMethod = (desiredLogicalPosition, currentReverseState) => {
    const isLogicalAppendToBack = (desiredLogicalPosition === '2');
    // If we want to add to the logical back, and the array is *not* reversed, then push.
    // If we want to add to the logical front, and the array *is* reversed, then push.
    // This simplifies to: if the desired logical action matches the current physical orientation, use push.
    return isLogicalAppendToBack === !currentReverseState;
  };

  // Iterate over each operation specified in the input.
  for (const currentOperation of operationDetailsList) {
    // Operations are identified by the number of tokens on the line in the original logic.
    if (currentOperation.length === 1) {
      // If there's only one token, it's a toggle operation.
      // The original code toggles regardless of the token's value.
      isDisplayOrderReversed = !isDisplayOrderReversed;
    } else if (currentOperation.length === 3) {
      // If there are three tokens, it's an element addition operation.
      const addPositionCode = currentOperation[1]; // '1' or '2'
      const elementValue = currentOperation[2];

      // Adding an explicit validation for input robustness (Type III addition)
      if (addPositionCode !== '1' && addPositionCode !== '2') {
        console.warn(`Warning: Invalid position code '${addPositionCode}' detected in operation: ${currentOperation.join(' ')}. Skipping this addition.`);
        continue; // Skip this malformed operation
      }

      // Use the helper function to decide whether to push or unshift the element.
      const shouldPushToEnd = determinePhysicalAppendMethod(addPositionCode, isDisplayOrderReversed);

      if (shouldPushToEnd) {
        currentElementSequence.push(elementValue); // Add to the physical end of the array
      } else {
        currentElementSequence.unshift(elementValue); // Add to the physical beginning of the array
      }
    } else {
      // Log a warning for any operation that doesn't fit the expected formats (Type III addition)
      console.warn(`Warning: Unrecognized operation format with ${currentOperation.length} tokens: ${currentOperation.join(' ')}. Skipping.`);
    }
  }

  let finalOutputString;
  if (isDisplayOrderReversed) {
    // If the sequence is conceptually reversed, physically reverse it before joining elements.
    finalOutputString = currentElementSequence.reverse().join("");
  } else {
    // Otherwise, join the elements in their current physical order.
    finalOutputString = currentElementSequence.join("");
  }

  // Output the final concatenated string to standard output.
  console.log(finalOutputString);
}

// The following line is typically provided by competitive programming platforms
// and handles reading input from standard input and invoking the main processing function.
// It should generally not be modified.
ExecuteSequenceOperations(require("fs").readFileSync("/dev/stdin", "utf8"));