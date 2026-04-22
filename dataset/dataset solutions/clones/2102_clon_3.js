function processInputData(rawData) {
  "use strict"; // Enforce strict parsing and error handling

  // Define constants for the specific calculation factors.
  // These constants make the mathematical expressions clearer and easier to modify.
  const COEFFICIENT_X_BASE = 12.5;
  const ADJUSTMENT_X_UPPER = 11.5;
  const COEFFICIENT_Y_BASE = 10;
  const ADJUSTMENT_Y_UPPER = 9;

  /**
   * Parses the raw input string to extract two numeric values from the first line.
   * Includes basic validation for the presence and numeric quality of the input.
   * @param {string} inputSource The complete input string.
   * @returns {number[]} An array containing the two parsed integers, or [NaN, NaN] if parsing fails.
   */
  const obtainNumericParameters = (inputSource) => {
    // Split the entire input into individual lines and take only the very first line.
    const initialLine = inputSource.split("\n")[0];
    // Split the first line by spaces to get individual string tokens.
    const valueTokens = initialLine.split(" ");

    // Guard clause: Ensure there are at least two tokens to process.
    if (valueTokens.length < 2) {
      console.error("Input processing error: Expected at least two space-separated values.");
      return [NaN, NaN]; // Indicate failure by returning Not-a-Number
    }

    // Attempt to parse the first two tokens as base-10 integers.
    const firstParsedVal = parseInt(valueTokens[0], 10);
    const secondParsedVal = parseInt(valueTokens[1], 10);

    // Guard clause: Validate that both parsing operations were successful.
    if (isNaN(firstParsedVal) || isNaN(secondParsedVal)) {
      console.error("Input processing error: Could not convert input tokens to valid numbers.");
      return [NaN, NaN]; // Indicate failure
    }

    return [firstParsedVal, secondParsedVal];
  };

  // Execute the input parsing helper function to get our primary values.
  const [primaryInputVal, secondaryInputVal] = obtainNumericParameters(rawData);

  // If the input parsing failed (indicated by NaN values), terminate execution.
  if (isNaN(primaryInputVal) || isNaN(secondaryInputVal)) {
    return; // Exit the function gracefully without further processing.
  }

  // --- Calculate the first value range [min_X, max_X] ---
  // Step 1: Calculate the base product for the first input value.
  const calculatedBaseX = primaryInputVal * COEFFICIENT_X_BASE;
  // Step 2: Determine the lower bound for the first range using ceiling.
  const rangeX_MinBound = Math.ceil(calculatedBaseX);
  // Step 3: Determine the upper bound for the first range using ceiling with an offset.
  const rangeX_MaxBound = Math.ceil(calculatedBaseX + ADJUSTMENT_X_UPPER);

  // --- Calculate the second value range [min_Y, max_Y] ---
  // Step 1: Calculate the base product for the second input value.
  const calculatedBaseY = secondaryInputVal * COEFFICIENT_Y_BASE;
  // Step 2: Determine the lower bound for the second range using ceiling.
  const rangeY_MinBound = Math.ceil(calculatedBaseY);
  // Step 3: Determine the upper bound for the second range using ceiling with an offset.
  const rangeY_MaxBound = Math.ceil(calculatedBaseY + ADJUSTMENT_Y_UPPER);

  /**
   * Determines if two given numerical ranges [min1, max1] and [min2, max2] have any overlap.
   * Ranges do not overlap if one ends before the other begins.
   * @param {number} r1Min Minimum value of the first range.
   * @param {number} r1Max Maximum value of the first range.
   * @param {number} r2Min Minimum value of the second range.
   * @param {number} r2Max Maximum value of the second range.
   * @returns {boolean} True if the ranges do not overlap, false otherwise.
   */
  const checkNoRangeOverlap = (r1Min, r1Max, r2Min, r2Max) => {
    // The ranges do not overlap if the first range ends before the second begins,
    // OR if the second range ends before the first begins.
    return r1Max < r2Min || r2Max < r1Min;
  };

  // Evaluate the overlap condition using the helper function.
  if (checkNoRangeOverlap(rangeX_MinBound, rangeX_MaxBound, rangeY_MinBound, rangeY_MaxBound)) {
    // If no overlap is detected between the two calculated ranges, print -1.
    console.log(-1);
  } else {
    // If the ranges do overlap, the intersection begins at the maximum of their lower bounds.
    const effectiveIntersectionStart = Math.max(rangeX_MinBound, rangeY_MinBound);
    console.log(effectiveIntersectionStart);
  }
}

// This following line is typically part of the standard input/output setup in competitive programming.
// It reads all data from standard input and passes it to our main processing function.
// It is usually kept as-is to ensure compatibility with judge systems.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));