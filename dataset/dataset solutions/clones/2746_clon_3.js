"use strict";

// This self-executing function encapsulates the primary application logic.
// It processes raw input data, performs a series of validation and aggregation steps,
// and ultimately determines if a specific set of conditions are met.
(function(sourceDataStream) {

  // A utility function to standardize output and ensure early termination.
  // 'resultFlag' should be a boolean: true for "Yes", false for "No".
  const presentFinalDecision = (resultFlag) => {
    console.log(resultFlag ? "Yes" : "No");
    return; // Crucial for exiting the IIFE immediately.
  };

  // --- Data Initialization and Preliminary Parsing ---

  // Convert the incoming data stream to a string, remove leading/trailing whitespace,
  // split it into individual tokens based on any sequence of whitespace characters,
  // and then convert each token into a numeric value. Using `Number` for explicit conversion.
  let parsedNumericalTokens = sourceDataStream
    .toString()
    .trim()
    .split(/\s+/)
    .map(token => Number(token));

  // Validate the integrity of the initial input. An empty array of tokens is an immediate failure.
  if (parsedNumericalTokens.length === 0) {
    presentFinalDecision(false);
    return;
  }

  // Extract the first token, which represents the 'countOfItemsToProcess',
  // and collect the rest of the tokens into 'subsequentNumericalValues'.
  // This uses array destructuring for a distinct approach compared to `shift()`.
  let [countOfItemsToProcess, ...subsequentNumericalValues] = parsedNumericalTokens;

  // Perform robust validation on 'countOfItemsToProcess'. It must be a non-negative integer.
  if (!Number.isInteger(countOfItemsToProcess) || countOfItemsToProcess < 0) {
    presentFinalDecision(false);
    return;
  }

  // --- Initial Conditional Checks (Equivalent to original A and B flags) ---

  let isTotalCountDivisibleByThree = false; // Corresponds to original 'A'
  let areAllSubsequentValuesZero = false; // Corresponds to original 'B'

  // Check if the primary count is perfectly divisible by three.
  if (countOfItemsToProcess % 3 === 0) {
    isTotalCountDivisibleByThree = true;
  }

  // Calculate the sum of squares for all 'subsequentNumericalValues'.
  // If this sum is zero, it implies every value in the array must be zero.
  let accumulatedSquareSum = 0;
  for (let idx = 0; idx < subsequentNumericalValues.length; idx++) {
    const currentNumericValue = subsequentNumericalValues[idx];
    // Additional validation: ensure all subsequent values are indeed numbers.
    if (isNaN(currentNumericValue)) {
      presentFinalDecision(false);
      return;
    }
    accumulatedSquareSum += currentNumericValue * currentNumericValue;
  }

  // Determine if all subsequent values are effectively zero.
  if (accumulatedSquareSum === 0) {
    areAllSubsequentValuesZero = true;
  }

  // Apply the early exit logic based on these initial conditions.
  // Case 1: If all subsequent values are zero, it's always a "Yes".
  if (areAllSubsequentValuesZero) {
    presentFinalDecision(true);
    return;
  }
  // Case 2: If subsequent values are NOT all zero, then the total count MUST be divisible by three.
  // Otherwise, it's a "No".
  if (!isTotalCountDivisibleByThree) {
    presentFinalDecision(false);
    return;
  }
  // If we reach here, 'areAllSubsequentValuesZero' is false, and 'isTotalCountDivisibleByThree' is true.

  // --- Value Aggregation and Frequency Counting Phase ---

  // Arrays to store distinct numerical values encountered and their corresponding frequencies.
  // The problem implies a maximum of three distinct values.
  const distinctNumericalValues = [];
  const valueFrequencies = [0, 0, 0]; // Pre-allocated for up to 3 distinct values.

  // 'processingPointer' acts as the index for iterating through 'subsequentNumericalValues'.
  // It also implicitly serves as a counter for how many items have been "processed"
  // from the logical stream represented by 'countOfItemsToProcess'.
  let processingPointer = 0;
  while (processingPointer < countOfItemsToProcess) {
    // Critical guard: Ensure we don't attempt to access beyond the bounds of the actual data array.
    if (processingPointer >= subsequentNumericalValues.length) {
      // If we run out of elements before satisfying 'countOfItemsToProcess', it's an invalid state.
      presentFinalDecision(false);
      return;
    }

    const valueUnderConsideration = subsequentNumericalValues[processingPointer];

    // Re-validate the current value's numeric type.
    if (isNaN(valueUnderConsideration)) {
      presentFinalDecision(false);
      return;
    }

    // If we've already identified 3 distinct values, and the current one isn't a match,
    // then adding a 4th distinct value makes it an immediate "No".
    if (distinctNumericalValues.length > 3) { // This condition is effectively '>=3' before a push.
      presentFinalDecision(false);
      return;
    }

    let foundExistingMatch = false;
    // Iterate through already identified distinct values to check for a match.
    for (let k = 0; k < distinctNumericalValues.length; k++) {
      if (valueUnderConsideration === distinctNumericalValues[k]) {
        valueFrequencies[k]++; // Increment the frequency for the matched value.
        processingPointer++; // Advance the pointer in the input data.
        foundExistingMatch = true;
        break; // Exit the inner loop, as the value has been processed.
      }
    }

    // If no match was found among existing distinct values, then this is a new distinct value.
    if (!foundExistingMatch) {
      // Check again if adding this new value would exceed the limit of 3 distinct values.
      if (distinctNumericalValues.length >= 3) {
        presentFinalDecision(false);
        return;
      }
      distinctNumericalValues.push(valueUnderConsideration);
      // Initialize its frequency. The index for the new frequency is the current length-1.
      valueFrequencies[distinctNumericalValues.length - 1] = 1;
      processingPointer++; // Advance the input data pointer.
    }
  }

  // Final sanity check on the number of unique elements gathered.
  if (distinctNumericalValues.length > 3) {
    presentFinalDecision(false);
    return;
  }
  // If 'countOfItemsToProcess' was positive, but no unique numbers were found, this is also a failure.
  if (countOfItemsToProcess > 0 && distinctNumericalValues.length === 0) {
    presentFinalDecision(false);
    return;
  }


  // --- Final Conditional Checks (Equivalent to original C, E, and D flags) ---

  let countDistributionSatisfied = false; // Corresponds to original 'C' or 'E' conditions.

  // Condition 1 (C): All three frequencies are equal (requires exactly 3 distinct values).
  if (distinctNumericalValues.length === 3) {
    if (
      valueFrequencies[0] === valueFrequencies[1] &&
      valueFrequencies[1] === valueFrequencies[2] &&
      valueFrequencies[0] > 0 // Ensure counts are positive, not zero.
    ) {
      countDistributionSatisfied = true;
    }
  }

  // Condition 2 (E): Only two distinct values, and one frequency is double the other.
  // This check only proceeds if Condition 1 was not met.
  if (!countDistributionSatisfied && distinctNumericalValues.length === 2) {
    // Implicitly, valueFrequencies[2] would be zero in this case.
    if (
      (valueFrequencies[0] === 2 * valueFrequencies[1] && valueFrequencies[0] > 0) ||
      (valueFrequencies[1] === 2 * valueFrequencies[0] && valueFrequencies[1] > 0)
    ) {
      countDistributionSatisfied = true;
    }
  }

  // If neither count distribution condition is met, it's a "No".
  if (!countDistributionSatisfied) {
    presentFinalDecision(false);
    return;
  }

  let xorSumConditionMet = false; // Corresponds to original 'D' condition.

  // The XOR sum condition is only relevant and valid for exactly 3 distinct values.
  // If fewer than 3 values, the XOR operation on `undefined` would result in NaN,
  // making the comparison `NaN === 0` false. This explicit check clarifies that behavior.
  if (distinctNumericalValues.length === 3) {
    const firstVal = distinctNumericalValues[0];
    const secondVal = distinctNumericalValues[1];
    const thirdVal = distinctNumericalValues[2];

    // Extra validation: Ensure these values are definitively numbers before XORing.
    if (
      typeof firstVal === "number" && !isNaN(firstVal) &&
      typeof secondVal === "number" && !isNaN(secondVal) &&
      typeof thirdVal === "number" && !isNaN(thirdVal)
    ) {
      if ((firstVal ^ secondVal ^ thirdVal) === 0) {
        xorSumConditionMet = true;
      }
    }
  } else {
    // If there are not exactly 3 distinct values, the XOR sum condition (D) cannot be met.
    xorSumConditionMet = false;
  }


  // If the XOR sum condition is not met, then it's a "No".
  if (!xorSumConditionMet) {
    presentFinalDecision(false);
    return;
  }

  // If all preceding complex conditions have been satisfied, then the final outcome is "Yes".
  presentFinalDecision(true);

})(require("fs").readFileSync("/dev/stdin", "utf8"));