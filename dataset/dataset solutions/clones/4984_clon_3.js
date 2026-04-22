// This module provides a function to calculate the sum of all possible numeric interpretations
// of a given string of digits, including various ways of splitting the number into parts.
// For instance, if the input is "123", it computes:
// 123 (the original number)
// + (1 + 23) (first split: "1" and "23")
// + (12 + 3) (second split: "12" and "3")
// + (1 + 2 + 3) (splits with intermediate digit sums: e.g., for "23" part, "1" is the prefix sum)
// The final result for "123" would be 168.

/**
 * A utility function to safely convert a single character digit to its numeric value.
 * Includes basic validation to ensure the input is indeed a single digit character.
 * @param {string} charDigit - The character string representing a single digit (e.g., '7').
 * @returns {number} The integer value of the digit, or 0 if input is invalid (with a warning).
 */
const retrieveDigitNumericalValue = (charDigit) => {
  // Defensive programming: check if input is a valid single digit string.
  if (typeof charDigit !== 'string' || charDigit.length !== 1 || !/\d/.test(charDigit)) {
    console.warn(`Warning: Attempted to parse an invalid digit character: "${charDigit}". Returning 0.`);
    return 0; // Return a default value or throw an error for robust error handling.
  }
  return Number(charDigit);
};

/**
 * This auxiliary function computes the sum of all possible two-part splits for a segment
 * of the source numeric string, incorporating a pre-calculated prefix sum.
 * It's designed to be called iteratively by the main processing function.
 * @param {string} sourceNumericString - The complete string of digits being analyzed.
 * @param {number} segmentStartIdx - The starting index within `sourceNumericString` for the current segment.
 * @param {number} cumulativeSumOfPreviousDigits - The sum of all digits occurring before `segmentStartIdx`.
 * @returns {number} The aggregated sum of all combinations generated from splits within this segment.
 */
function computeSegmentSplitSums(sourceNumericString, segmentStartIdx, cumulativeSumOfPreviousDigits) {
  let accumulatedSegmentResult = 0; // Accumulator for combinations within this segment.

  // Determine the length of the string portion that can be split from `segmentStartIdx`.
  const remainingStringLength = sourceNumericString.length - segmentStartIdx;

  // A split requires at least two characters remaining. If not, no new combinations can be formed here.
  if (remainingStringLength <= 1) {
    return 0;
  }

  // Iterate through all possible split points for the current segment.
  // `firstPartLength` defines the length of the first number in the split.
  for (let firstPartLength = 1; firstPartLength < remainingStringLength; firstPartLength++) {
    // The sum of digits preceding the current split point is added to each new combination.
    accumulatedSegmentResult += cumulativeSumOfPreviousDigits;

    // Extract the first numerical part of the split.
    const firstSegmentString = sourceNumericString.substring(segmentStartIdx, segmentStartIdx + firstPartLength);
    const firstSegmentNumericalValue = Number(firstSegmentString);
    accumulatedSegmentResult += firstSegmentNumericalValue;

    // Extract the second numerical part of the split (from the end of the first part to the end of the string).
    const secondSegmentString = sourceNumericString.substring(segmentStartIdx + firstPartLength);
    const secondSegmentNumericalValue = Number(secondSegmentString);
    accumulatedSegmentResult += secondSegmentNumericalValue;
  }

  return accumulatedSegmentResult; // Return the total sum for this segment's splits.
}

/**
 * The primary function that orchestrates the calculation of the sum of all possible
 * numeric interpretations of an input digit string.
 * This includes the full number itself and all possible ways of splitting it into sub-numbers.
 * @param {string} rawInputString - The string of digits provided as input.
 */
function processNumericalStringInterpretations(rawInputString) {
  // Step 1: Robust input validation to ensure we're working with a clean, valid digit string.
  if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
    console.error("Error: Input must be a non-empty string. Processing halted.");
    return; // Exit if input is invalid.
  }
  const sanitizedNumericString = rawInputString.trim();
  if (!/^\d+$/.test(sanitizedNumericString)) {
    console.error("Error: Input string contains non-digit characters. Processing halted.");
    return; // Exit if input contains invalid characters.
  }

  // Step 2: Initialize the grand total. The first interpretation is the input string itself as a single number.
  let overallTotalSum = Number(sanitizedNumericString);

  // Step 3: Iterate through each possible "split point" in the string.
  // The `currentSplitIndex` represents the starting position of the segment
  // for which `computeSegmentSplitSums` will calculate combinations.
  for (let currentSplitIndex = 0; currentSplitIndex < sanitizedNumericString.length; currentSplitIndex++) {
    // Step 3a: Calculate the sum of individual digits that appear *before* the current `currentSplitIndex`.
    // This prefix sum is a crucial component in how the problem defines its combinations.
    let sumOfLeadingDigits = 0;
    for (let digitIterator = 0; digitIterator < currentSplitIndex; digitIterator++) {
      sumOfLeadingDigits += retrieveDigitNumericalValue(sanitizedNumericString[digitIterator]);
    }

    // Step 3b: Call the helper function to compute all split sums originating from `currentSplitIndex`.
    // The result from this call is added to our running `overallTotalSum`.
    overallTotalSum += computeSegmentSplitSums(
      sanitizedNumericString,
      currentSplitIndex,
      sumOfLeadingDigits
    );
  }

  // Step 4: Output the final calculated sum in a user-friendly format.
  console.log(`The aggregated sum of all numerical interpretations for "${sanitizedNumericString}" is: ${overallTotalSum}`);
}

// Entry point for script execution: Read input from standard input and initiate processing.
try {
  // Use Node.js 'fs' module to synchronously read content from '/dev/stdin'.
  const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Pass the read content to our main processing function.
  processNumericalStringInterpretations(inputContent);
} catch (executionError) {
  // Catch and report any errors that occur during file reading or processing.
  console.error("An error occurred during execution:", executionError.message);
  // Depending on the application, more detailed error logging or specific exit codes might be appropriate.
}