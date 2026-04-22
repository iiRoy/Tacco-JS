'use strict';

// A module-level constant to represent the standard input path.
const STANDARD_INPUT_PATH = '/dev/stdin';

/**
 * Retrieves raw data from a specified external source, typically standard input.
 * @returns {string} The content read from the source as a UTF-8 encoded string.
 */
const retrieveDataSourceContent = () => {
  // Utilize Node.js's file system module to synchronously read data.
  // This approach is common in competitive programming environments.
  return require('fs').readFileSync(STANDARD_INPUT_PATH, 'utf8');
};

/**
 * Processes a sequence of binary digits (0s and 1s) to calculate a specific metric.
 * This function identifies the counts of '0's and '1's and applies a formula.
 *
 * @param {string} incomingDataPayload - The raw string containing binary digits.
 * @returns {number} The calculated metric, or 0 if input is invalid or empty.
 */
const computeBinarySequenceMetric = (incomingDataPayload) => {
  // Input validation: Ensure the payload is a non-empty string.
  if (typeof incomingDataPayload !== 'string' || incomingDataPayload.trim().length === 0) {
    // If the input is not a valid string or is empty, return a default value.
    return 0;
  }

  // Data cleansing step: Remove any potential trailing characters,
  // such as newline characters often appended by readFileSync.
  // This is analogous to the original code's `slice(0, -1)` operation,
  // applied to the string itself before character processing.
  const sanitizedSequenceString = incomingDataPayload.slice(0, -1);

  // If the string becomes empty after sanitation, there's nothing to process.
  if (sanitizedSequenceString.length === 0) {
    return 0;
  }

  // Initialize accumulators for the counts of the two distinct digit types.
  // 'CounterA' will track occurrences of '0'.
  let counterForZeroes = 0;
  // 'CounterB' will track occurrences of '1'.
  let counterForOnes = 0;

  // Iterate over each character in the sanitized input string.
  // A traditional for-loop provides explicit control over iteration.
  for (let characterIndex = 0; characterIndex < sanitizedSequenceString.length; characterIndex++) {
    const currentCharacter = sanitizedSequenceString[characterIndex];
    // Convert the character to its numeric representation.
    // `Number()` is a robust way to convert string digits to numbers.
    const numericValue = Number(currentCharacter);

    // Robustness check: Ensure the character is indeed a binary digit (0 or 1).
    // This adds a layer of validation not explicitly present but implied by the problem.
    if (isNaN(numericValue) || (numericValue !== 0 && numericValue !== 1)) {
      // If an invalid character is encountered, skip it and continue processing.
      // Depending on requirements, an error could be thrown here instead.
      continue;
    }

    // Increment the appropriate counter based on the numeric value.
    if (numericValue === 0) {
      counterForZeroes++;
    } else { // numericValue must be 1 due to the validation above
      counterForOnes++;
    }
  }

  // Determine the minimum count between the two categories.
  // This value represents the smaller group of digits.
  const smallerGroupCount = Math.min(counterForZeroes, counterForOnes);

  // Calculate the final result by multiplying the smaller group count by two.
  // This specific multiplication factor is a core part of the problem's definition.
  const finalCalculatedOutcome = smallerGroupCount * 2;

  // Return the computed value.
  return finalCalculatedOutcome;
};

// Entry point for the application execution.
// 1. Fetch the raw input data from the designated source.
const rawInputContent = retrieveDataSourceContent();

// 2. Process the obtained raw data to derive the final numerical result.
const resultantMetric = computeBinarySequenceMetric(rawInputContent);

// 3. Output the final result to the standard output stream.
console.log(resultantMetric);