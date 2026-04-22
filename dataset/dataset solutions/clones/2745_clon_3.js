"use strict";

(function(rawInputBuffer){
  // --- Stage 1: Data Preprocessing and Initial Checks ---

  // Convert buffer to string, eliminate leading/trailing whitespace, and segment into string components.
  const processedInputString = rawInputBuffer.toString().trim();
  const inputComponentArray = processedInputString.split(/\s+/);

  // Early validation: Check if any input components exist after trimming and splitting.
  if (inputComponentArray.length === 0) {
    // If no data is supplied, the problem cannot be solved.
    console.log("No");
    return;
  }

  // Extract the first component as the declared total number of data items.
  // Explicitly parse as an integer with base 10.
  const declaredTotalItemCount = Number.parseInt(inputComponentArray.shift(), 10);

  // Validate the declared total item count. It must be a positive, valid number.
  if (Number.isNaN(declaredTotalItemCount) || declaredTotalItemCount <= 0) {
    // An invalid or non-positive count makes the input malformed.
    console.log("No");
    return;
  }

  // Transform the remaining string components into numerical values.
  // The unary plus operator efficiently converts strings to numbers.
  const numericDataElements = inputComponentArray.map(itemString => +itemString);

  // Cross-check: Ensure the actual number of parsed elements matches the declared count.
  if (numericDataElements.length !== declaredTotalItemCount) {
    // Discrepancy between declared count and actual elements implies invalid input.
    console.log("No");
    return;
  }

  // --- Stage 2: Evaluate Primary Conditions for Early Exits ---

  // Condition A: Is the declared total item count a perfect multiple of three?
  const isTotalCountDivisibleByThree = (declaredTotalItemCount % 3 === 0);

  // Condition B: Are all the numeric data elements zero?
  // Calculate the sum of squares to efficiently determine if all elements are zero.
  let accumulatedSquareSum = 0;
  for (let idx = 0; idx < numericDataElements.length; idx++) {
    accumulatedSquareSum += numericDataElements[idx] * numericDataElements[idx];
  }
  const areAllElementsValuedAtZero = (accumulatedSquareSum === 0);

  // Handle early exit scenarios based on these conditions.
  // If all elements are zero, the answer is always "Yes".
  if (areAllElementsValuedAtZero) {
    console.log("Yes");
    return;
  }

  // If not all elements are zero, and the total count is not divisible by three,
  // then the answer is "No". (This covers the original `(!A) && (!B)` case where `B` is false).
  if (!isTotalCountDivisibleByThree) {
    console.log("No");
    return;
  }

  // At this stage, we know:
  // 1. `isTotalCountDivisibleByThree` is TRUE.
  // 2. `areAllElementsValuedAtZero` is FALSE.
  // Proceed with detailed analysis of distinct elements and their frequencies.

  // --- Stage 3: Detailed Element Analysis and Frequency Tracking ---

  const distinctElementTracker = []; // Array to store up to 3 unique numeric values.
  const frequencyCounterArray = [0, 0, 0]; // Array to store counts corresponding to distinctElementTracker.

  let finalResultIndicator = "No"; // Initialize the result, assume "No" until proven "Yes".

  // Iterate through the numeric data elements using a flexible pointer.
  // The `dataProcessingPointer` can advance multiple times within one loop iteration.
  for (let dataProcessingPointer = 0; dataProcessingPointer < declaredTotalItemCount; /* dataProcessingPointer is managed internally */ ) {
    const currentNumberOfUniqueItems = distinctElementTracker.length;

    // Guard: If we've already identified more than 3 unique elements, it's an immediate "No".
    if (currentNumberOfUniqueItems > 3) {
      finalResultIndicator = "No"; // Too many unique values.
      break; // Terminate the processing loop.
    }

    let elementMatchedInTracker = false;
    // Attempt to find the current element (`numericDataElements[dataProcessingPointer]`)
    // within the `distinctElementTracker`.
    for (let trackerPosition = 0; trackerPosition < currentNumberOfUniqueItems; trackerPosition++) {
      if (numericDataElements[dataProcessingPointer] === distinctElementTracker[trackerPosition]) {
        // A match is found! Increment its frequency.
        frequencyCounterArray[trackerPosition]++;
        dataProcessingPointer++; // Advance the main data pointer to the next element.
        trackerPosition = -1; // Reset `trackerPosition` to re-scan `distinctElementTracker` from start.
                              // This handles cases where `dataProcessingPointer` advances and
                              // the new element might also match an existing unique item.
        elementMatchedInTracker = true;
        continue; // Restart the inner loop with the updated `dataProcessingPointer`.
      }
    }

    // If the element was not found in `distinctElementTracker`, it's a new unique value.
    if (!elementMatchedInTracker) {
      if (currentNumberOfUniqueItems < 3) {
        // Add the new unique element to the tracker.
        distinctElementTracker.push(numericDataElements[dataProcessingPointer]);
        // Increment the count for this newly added unique element.
        // It corresponds to the last element pushed into distinctElementTracker.
        frequencyCounterArray[distinctElementTracker.length - 1]++;
      } else {
        // We already have 3 unique elements, and this is a new one,
        // which violates the condition of having at most 3 distinct types.
        finalResultIndicator = "No";
        break; // Terminate the processing loop.
      }
      dataProcessingPointer++; // Advance the main data pointer after handling a new unique element.
    }
  }

  // --- Stage 4: Final Decision Based on Accumulated Frequencies ---

  // If `finalResultIndicator` was set to "No" by an early exit in Stage 3, output it.
  if (finalResultIndicator === "No") {
      console.log(finalResultIndicator);
      return;
  }

  // The final check: For a "Yes" outcome, the counts of all 3 distinct elements
  // (if 3 were found) must be equal. If fewer than 3 were found, this condition
  // implicitly evaluates to false for positive `declaredTotalItemCount`.
  if (frequencyCounterArray[0] === frequencyCounterArray[1] &&
      frequencyCounterArray[1] === frequencyCounterArray[2]) {
    finalResultIndicator = "Yes";
  } else {
    finalResultIndicator = "No";
  }

  // Output the determined result.
  console.log(finalResultIndicator);

})(require("fs").readFileSync("/dev/stdin","utf8"));