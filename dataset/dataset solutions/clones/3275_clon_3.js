"use strict";

/**
 * Orchestrates the processing of raw input data to solve a balancing problem.
 * This routine reads numerical arrays, calculates their element-wise differences,
 * and attempts to make all differences non-negative through a two-pointer adjustment strategy.
 * It reports the number of elements involved in adjustments or -1 if balancing is impossible.
 * @param {string} rawInputContent - The complete input string, typically from a file or standard input.
 */
const processInputData = (rawInputContent) => {
  // --- Input Validation and Initial Parsing ---

  // Verify the input content is valid and not empty.
  if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
    console.log(-1); // Indicate an error due to empty or invalid input.
    return;
  }

  const allInputLines = rawInputContent.split('\n');

  // Ensure a minimum number of lines are present for array length and array data.
  if (allInputLines.length < 3) {
    console.log(-1); // Not enough data lines provided.
    return;
  }

  /**
   * Internal utility to parse a string line into an array of integers.
   * It filters out empty strings and validates each parsed segment.
   * @param {string} lineString - The text line to parse.
   * @returns {Array<number>} An array of parsed integer values.
   * @throws {Error} If any non-numeric segment is encountered.
   */
  const parseLineToNumbers = (lineString) => {
    return lineString.split(/\s+/).filter(Boolean).map(segmentText => {
      const numericValue = parseInt(segmentText, 10);
      if (isNaN(numericValue)) {
        throw new Error(`Non-numeric value detected: '${segmentText}' in line: '${lineString}'`);
      }
      return numericValue;
    });
  };

  // Extract and validate the array size from the first line.
  // Using parseFloat and Math.floor to demonstrate a "data type" manipulation.
  const rawSizeValue = parseFloat(allInputLines[0]);
  if (isNaN(rawSizeValue) || rawSizeValue <= 0) {
    console.log(-1); // Array size must be a positive number.
    return;
  }
  const arraySize = Math.floor(rawSizeValue); // Ensure an integer size.

  let primaryValueSeries = [];
  let secondaryValueSeries = [];

  // Parse the first array (A) from the second input line.
  try {
    primaryValueSeries = parseLineToNumbers(allInputLines[1]).slice(0, arraySize);
    if (primaryValueSeries.length !== arraySize) {
      console.log(-1); // Mismatch between declared array size and actual elements.
      return;
    }
  } catch (err) {
    console.log(-1); // Error during parsing of primary series.
    return;
  }

  // Parse the second array (B) from the third input line.
  try {
    secondaryValueSeries = parseLineToNumbers(allInputLines[2]).slice(0, arraySize);
    if (secondaryValueSeries.length !== arraySize) {
      console.log(-1); // Mismatch between declared array size and actual elements.
      return;
    }
  } catch (err) {
    console.log(-1); // Error during parsing of secondary series.
    return;
  }

  // --- Core Logic: Difference Calculation and Balancing ---

  // Compute the element-wise differences (A[i] - B[i]).
  // This new array holds the "balance" at each position.
  const balanceFactors = primaryValueSeries.map((valA, currentIdx) => {
    return valA - secondaryValueSeries[currentIdx];
  });

  // Sort the balance factors in descending order.
  // This places positive surpluses at the beginning and negative deficits at the end.
  balanceFactors.sort((factorX, factorY) => {
    // Custom comparator for reverse numerical sort.
    return factorY - factorX;
  });

  // Initialize a tracking array to mark elements that participate in an adjustment.
  // Using `new Array().fill()` is an alternative to `map` for initialization.
  const adjustmentInvolvedFlags = new Array(arraySize).fill(false);

  // Set up two pointers for the balancing operation.
  // `leftPtr` targets positive surpluses.
  // `rightPtr` targets negative deficits.
  let leftPtr = 0;
  let rightPtr = arraySize - 1;

  // Iterate while the left pointer has not crossed the right pointer.
  // This loop attempts to use positive factors to offset negative ones.
  while (leftPtr < rightPtr) {
    const currentRightFactor = balanceFactors[rightPtr];

    // If the rightmost factor is already non-negative,
    // all remaining factors (from right to left) are also non-negative due to sorting.
    // No further balancing is required from the right side.
    if (currentRightFactor >= 0) {
      break; // Exit the loop.
    }

    // Calculate the positive amount needed to neutralize the current negative factor.
    const compensationRequired = -currentRightFactor;

    const currentLeftFactor = balanceFactors[leftPtr];

    // Case 1: The current positive factor from the left is sufficient or more than sufficient
    // to cover the negative factor from the right.
    if (currentLeftFactor >= compensationRequired) {
      // Mark both elements as having been involved in an adjustment.
      adjustmentInvolvedFlags[leftPtr] = true;
      adjustmentInvolvedFlags[rightPtr] = true;

      // Apply the compensation: reduce the positive factor, neutralize the negative factor.
      balanceFactors[leftPtr] -= compensationRequired; // Decrement the surplus.
      balanceFactors[rightPtr] = 0; // The deficit is fully covered.

      // Move the right pointer inward, as this deficit is resolved.
      rightPtr--;
    }
    // Case 2: The current positive factor from the left is not enough to cover the negative factor.
    else {
      // Only mark elements as adjusted if the left factor actually contributes a positive value.
      if (currentLeftFactor > 0) {
        adjustmentInvolvedFlags[leftPtr] = true;
        adjustmentInvolvedFlags[rightPtr] = true;
      }
      // If the left factor is zero, it cannot contribute, so we just move past it.
      else if (currentLeftFactor === 0) {
        leftPtr++;
        continue; // Skip the rest of this iteration and re-evaluate with the next left factor.
      }

      // Apply the partial compensation: reduce the negative factor, exhaust the positive factor.
      balanceFactors[rightPtr] += currentLeftFactor; // Reduce the deficit by the available surplus.
      balanceFactors[leftPtr] = 0; // The surplus is fully utilized.

      // Move the left pointer inward, as this surplus is exhausted.
      leftPtr++;
    }

    // Safety break: Should not be needed if logic is sound, but good for robustness.
    if (leftPtr >= arraySize || rightPtr < 0) {
      // This indicates an unexpected state, potentially an infinite loop or pointer corruption.
      console.error("Internal pointer logic error detected. Terminating balancing.");
      break;
    }
  }

  // --- Final Result Determination ---

  // After the balancing loop, check if any negative factors remain.
  // If `arraySize` is 0, `balanceFactors` is empty, `rightPtr` is -1.
  // If `arraySize` is 1, `rightPtr` is 0, loop doesn't run. `balanceFactors[0]` is checked.
  let finalBalanceStatus = 0;
  if (arraySize > 0) {
    // The `rightPtr` will point to the first element that was not fully compensated,
    // or to an element that became positive/zero.
    finalBalanceStatus = balanceFactors[rightPtr];
  }

  if (finalBalanceStatus < 0) {
    // If the final element (or any remaining negative ones) is still negative,
    // it implies that balancing was impossible.
    console.log(-1);
  } else {
    // Otherwise, count the total number of elements that participated in an adjustment.
    // Using a simple loop instead of `reduce` for variety.
    let totalAdjustedItems = 0;
    for (const flagStatus of adjustmentInvolvedFlags) {
      if (flagStatus === true) {
        totalAdjustedItems++;
      }
    }
    console.log(totalAdjustedItems);
  }
};

// --- Execution Entry Point ---

// Read input from standard input and then process it.
// Includes a try-catch block for robust file reading.
try {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  processInputData(fileContent);
} catch (error) {
  // Catch any errors during file reading or initial input processing.
  console.error("Error encountered:", error.message);
  console.log(-1); // Report a general failure.
}