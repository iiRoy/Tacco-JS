function DataProcessor(inputString) {
  /*
   * This module processes a sequence of numerical values from a string input.
   * It calculates a cumulative sum based on complex sign-dependent rules
   * involving current, next, and sometimes a lookahead element.
   * The final result is the calculated sum plus the last modified 'next' value.
   */

  // Enforce strict mode for cleaner code practices
  "use strict";

  // Helper function for robust integer parsing
  const parseNumericValue = (textSegment) => {
    const value = Number.parseInt(textSegment, 10);
    // If parsing fails, return 0 or handle error. For this context,
    // assuming valid numeric input, but `parseInt` returns `NaN` for invalid parts.
    // Let's return 0 for NaN, as `0` is neutral for sign comparisons.
    return Number.isNaN(value) ? 0 : value;
  };

  // Split the raw input string into an array of lines
  const dataLines = inputString.split("\n");

  // --- Input Validation and Early Exits ---
  if (dataLines.length < 2) {
    console.error("Input data is insufficient. Expected at least two lines.");
    return 0; // Return a default value or throw an error
  }

  // Extract the declared count of elements from the first line
  const totalElementCount = parseNumericValue(dataLines[0]);

  // Parse the sequence of numbers from the second line
  const numericSequence = dataLines[1].split(" ").map(parseNumericValue);

  // Validate the number of elements
  if (totalElementCount <= 0) {
    console.log("No elements to process. Final result: 0");
    return 0;
  }
  // Special handling for a single element array
  if (totalElementCount === 1) {
    console.log(`Only one element found. Final result: ${numericSequence[0]}`);
    return numericSequence[0];
  }
  // Optional: Check if declared count matches actual parsed count
  if (numericSequence.length < totalElementCount) {
    console.warn("Warning: Declared element count exceeds actual available elements. Processing with available data.");
    // The loop condition relies on `totalElementCount`, so `numericSequence[idx]` might be `undefined`.
    // The original code implicitly handles this, which we will replicate.
  }
  // --- End of Input Validation ---


  // Initialize the primary accumulator for the computation
  let cumulativeResult = 0;

  // Variables to hold the current and subsequent values during iteration
  let currentProcessingValue;
  let nextProcessingValue;

  // Initial setup for the first iteration.
  // The original code initializes `current = 0`, `next = as[0]`, then `current = next` inside the loop.
  // We mirror this by setting `nextProcessingValue` to the first element's value.
  currentProcessingValue = 0; // This will be overwritten in the first loop iteration
  nextProcessingValue = numericSequence[0]; // The first actual number to be processed

  // Loop through the sequence, iterating `totalElementCount - 1` times as per original logic.
  // `processingIndex` goes from `0` to `totalElementCount - 2`.
  for (let processingIndex = 0; processingIndex < totalElementCount - 1; ++processingIndex) {
    // Update the values for the current processing step
    currentProcessingValue = nextProcessingValue;
    // Get the next value in the sequence. If `processingIndex + 1` is out of bounds,
    // `numericSequence[processingIndex + 1]` will be `undefined`, which the original
    // code implicitly handles in comparisons.
    nextProcessingValue = numericSequence[processingIndex + 1];

    // Safely retrieve the lookahead value for `numericSequence[processingIndex + 2]`.
    // If out of bounds, it's explicitly `undefined` to match original comparison behavior.
    const lookaheadValueForNextNext = (processingIndex + 2 < totalElementCount)
        ? numericSequence[processingIndex + 2]
        : undefined;

    // Calculate absolute values for common use
    const absoluteCurrent = Math.abs(currentProcessingValue);
    const absoluteNext = Math.abs(nextProcessingValue);

    // Determine if current and next values share the same sign (or if one/both are zero)
    const haveSameSign = (currentProcessingValue >= 0 && nextProcessingValue >= 0) ||
                         (currentProcessingValue < 0 && nextProcessingValue < 0);

    // --- Conditional Logic based on Signs ---

    // Scenario A: Both values have the same sign (both non-negative or both negative)
    if (haveSameSign) {
      cumulativeResult += absoluteCurrent;
      nextProcessingValue = absoluteNext; // Ensure next value is positive for subsequent steps
      continue; // Move to the next iteration
    }
    // Scenario B: Current value is non-negative, and next value is negative
    else if (currentProcessingValue >= 0 && nextProcessingValue < 0) {
      // Determine if the lookahead value (next-next) is non-negative.
      // `undefined >= 0` evaluates to `false`.
      const nextNextIsNonNegative = (lookaheadValueForNextNext !== undefined && lookaheadValueForNextNext >= 0);

      if (currentProcessingValue > absoluteNext || nextNextIsNonNegative) {
        cumulativeResult += currentProcessingValue;
      } else {
        cumulativeResult -= currentProcessingValue;
        nextProcessingValue = absoluteNext; // Make next value positive
      }
      continue; // Move to the next iteration
    }
    // Scenario C: Current value is negative, and next value is non-negative
    else { // This implies: currentProcessingValue < 0 && nextProcessingValue >= 0
      // Determine if the lookahead value (next-next) is negative.
      // `undefined < 0` evaluates to `false`.
      const nextNextIsNegative = (lookaheadValueForNextNext !== undefined && lookaheadValueForNextNext < 0);

      if (absoluteCurrent > nextProcessingValue || nextNextIsNegative) {
        cumulativeResult += absoluteCurrent; // Equivalent to: `cumulativeResult -= currentProcessingValue` (since current is negative)
        nextProcessingValue = -absoluteNext; // Make next value negative
      } else {
        cumulativeResult -= absoluteCurrent; // Equivalent to: `cumulativeResult += currentProcessingValue` (since current is negative)
      }
      continue; // Move to the next iteration
    }
  } // End of processing loop

  // The final result is the accumulated sum plus the last modified 'next' value
  const finalComputedValue = cumulativeResult + nextProcessingValue;
  console.log(`The final calculated sum is: ${finalComputedValue}`);

  // Return the computed value for potential external use
  return finalComputedValue;
}

// --- Entry Point for Execution ---
// Using a different variable name for the file system module.
const ioOperations = require("fs");

// Using an alternative path for standard input, common in competitive programming environments.
const standardInputSource = "/dev/stdin";

// Wrap the file reading and processing in a try-catch block for robust error handling.
try {
  const fileContents = ioOperations.readFileSync(standardInputSource, "utf8");
  DataProcessor(fileContents);
} catch (error) {
  // Log any errors encountered during file operations or processing.
  console.error(`An exception occurred during input processing: ${error.message}`);
  // Exit the process with an error code to indicate failure.
  process.exit(1);
}