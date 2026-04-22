"use strict";

/**
 * Helper function to safely read file content.
 * @param {string} filePath - The path to the file.
 * @returns {string} The content of the file as a UTF-8 string.
 */
function acquireFileContents(filePath) {
  // Utilizing Node.js 'fs' module for file system operations.
  return require("fs").readFileSync(filePath, "utf8");
}

/**
 * Analyzes a sequence of numbers based on several conditions
 * to determine if it meets specific structural criteria.
 * This function handles input parsing, multiple validation steps,
 * and a conditional rearrangement phase.
 *
 * @param {string} inputDataString - Raw string input containing the sequence length
 *                                   and the sequence elements, separated by newlines.
 * @returns {void} Prints "Yes" or "No" to the console.
 */
function assessNumericalSequence(inputDataString) {
  // Split the entire input string into individual lines for processing.
  const dataLines = inputDataString.split("\n");

  // Retrieve the first line, which represents the count of elements in the sequence.
  const sequenceLength = Number(dataLines[0]);

  // --- Input Validation and Early Exit Conditions ---
  // Ensure the sequence length is a positive integer.
  if (isNaN(sequenceLength) || sequenceLength <= 0) {
    console.log("No");
    return;
  }

  // Parse the remaining lines into an array of numbers, adjusting each element.
  // Each element is decremented by 1 as per the original problem's internal representation.
  const currentPermutation = dataLines.slice(1).map(valStr => Number(valStr) - 1);

  // Validate that the number of parsed elements matches the declared sequence length.
  if (currentPermutation.length !== sequenceLength) {
    console.log("No");
    return;
  }

  // --- First Validation: Parity Consistency Check ---
  // This loop verifies if the parity (even/odd) of each element at index `idx`
  // matches the parity of its own index `idx`.
  // An alternative check: `(element + index)` must be even for parity to match.
  let isParityConsistent = true; // Flag to track parity validation status.
  for (let idx = 0; idx < sequenceLength; ++idx) {
    if ((currentPermutation[idx] + idx) % 2 !== 0) { // If sum is odd, parities differ.
      isParityConsistent = false; // Parity mismatch found.
      break; // No need to check further.
    }
  }

  // If parity check failed, output "No" and terminate.
  if (!isParityConsistent) {
    console.log("No");
    return;
  }

  // --- Conditional Rearrangement Phase (Backward Iteration with Swaps) ---
  // Iterate backward through the array, starting from the third-to-last element (index N-1)
  // down to the third element (index 2).
  // This loop identifies specific decreasing triplets and performs a swap.
  for (let reverseIdx = sequenceLength - 1; reverseIdx >= 2; --reverseIdx) {
    // Cache values for clearer conditional logic.
    const elementAtCurrent = currentPermutation[reverseIdx];
    const elementAtPrev = currentPermutation[reverseIdx - 1];
    const elementAtTwoPrev = currentPermutation[reverseIdx - 2];

    // Condition for swap: if the triplet is in strictly decreasing order (P[i] < P[i-1] < P[i-2]).
    if (elementAtCurrent < elementAtPrev && elementAtPrev < elementAtTwoPrev) {
      // Perform a swap between the current element and the element two positions back.
      // This uses array destructuring for a concise swap operation.
      [currentPermutation[reverseIdx], currentPermutation[reverseIdx - 2]] = [elementAtTwoPrev, elementAtCurrent];
    }
  }

  // --- Second Validation: Post-Rearrangement Order Check ---
  // This final validation loop also iterates backward, checking for a more complex
  // pattern of disorder that would indicate the sequence is invalid after potential swaps.
  let isStructureValid = true; // Flag to track the order validation status.
  for (let checkIdx = sequenceLength - 1; checkIdx >= 2; --checkIdx) {
    // Extract elements for the current triplet being examined.
    const currentElement = currentPermutation[checkIdx];
    const precedingElement = currentPermutation[checkIdx - 1];
    const twoStepsBackElement = currentPermutation[checkIdx - 2];

    // Define sub-conditions for clarity in the complex `if` statement.
    const conditionOne = currentElement < twoStepsBackElement;
    const conditionTwo = currentElement > precedingElement;
    const conditionThree = precedingElement > twoStepsBackElement;

    // The combined condition for invalidity:
    // (current < two_steps_back) AND ((current > preceding) OR (preceding > two_steps_back))
    if (conditionOne && (conditionTwo || conditionThree)) {
      isStructureValid = false; // Invalid pattern found.
      break; // No need to check further.
    }
  }

  // If the post-rearrangement order check failed, output "No".
  if (!isStructureValid) {
    console.log("No");
    return;
  }

  // If all checks pass and the sequence is deemed valid, output "Yes".
  console.log("Yes");
  return;
}

// --- Main Execution Block ---
// This block ensures the sequence analysis function is called with the appropriate input.
// It also includes basic error handling for file operations.
try {
  // Read the input from standard input (/dev/stdin) using the helper function.
  const rawInputContent = acquireFileContents("/dev/stdin");
  // Pass the raw content to the main analysis function.
  assessNumericalSequence(rawInputContent);
} catch (error) {
  // In case of any error during file reading or processing, log a generic error message.
  console.error("An unexpected issue occurred during processing:", error.message);
  console.log("No"); // Assume failure if an error occurs.
}