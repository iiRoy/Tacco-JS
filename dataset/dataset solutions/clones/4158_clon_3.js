"use strict";

// Define a constant for the maximum value whose frequency will be explicitly tracked.
// Values exceeding this threshold are handled separately.
const MAX_VALUE_TO_TRACK_FREQUENCY = 100000;
const FREQUENCY_ARRAY_SIZE = MAX_VALUE_TO_TRACK_FREQUENCY + 1;
const STANDARD_INPUT_PATH = "/dev/stdin";

/**
 * Parses a string to an integer, providing a robust alternative to parseInt.
 * @param {string} strValue - The string to parse.
 * @returns {number} The parsed integer.
 */
const parseIntegerStrictly = (strValue) => {
  const num = Number(strValue);
  return Number.isInteger(num) ? num : 0; // Default to 0 or throw error if non-integer
};

/**
 * Processes the raw input string to extract numerical data and calculate a specific result.
 * This function identifies elements exceeding a certain threshold and performs frequency
 * analysis on others, ultimately determining a final count based on these observations.
 * @param {string} rawInputText - The complete input string from stdin.
 */
const processInputData = (rawInputText) => {
  // Input preparation: trim whitespace and split into lines.
  const inputLines = rawInputText.trim().split("\n");

  // Extract the total count of elements from the first line.
  const totalElementsCount = parseIntegerStrictly(inputLines[0]);

  // Parse the second line into an array of numbers.
  // Filters out any empty strings that might result from multiple spaces.
  const numericSequence = inputLines[1].split(" ").filter(Boolean).map(parseIntegerStrictly);

  // Initialize a data structure to track unique values.
  const distinctElementTracker = new Set(numericSequence);
  // Convert the set of unique values into an array for ordered iteration.
  const uniqueValuesList = Array.from(distinctElementTracker);

  // Initialize the primary accumulator for the final result.
  let finalResultAccumulator = 0;

  // Initialize an array to act as a frequency map for values within the trackable range.
  // All counts are initially zero.
  const elementFrequencyTracker = Array(FREQUENCY_ARRAY_SIZE).fill(0);

  // First pass: Iterate through the entire numeric sequence.
  // Count elements exceeding the maximum trackable value and populate the frequency map for others.
  for (let currentItemIndex = 0; currentItemIndex < totalElementsCount; currentItemIndex++) {
    const currentValue = numericSequence[currentItemIndex];

    // Check if the current value is beyond the frequency tracking range.
    if (currentValue > MAX_VALUE_TO_TRACK_FREQUENCY) {
      finalResultAccumulator++; // Increment result for out-of-range values.
    } else if (currentValue >= 0) { // Ensure non-negative for array indexing
      // Increment the frequency count for in-range values.
      elementFrequencyTracker[currentValue]++;
    }
  }

  // Second pass: Iterate through the list of unique values.
  // This section performs an additional calculation based on element frequencies,
  // though its effective contribution to the final result is designed to be zero
  // under the current logical structure.
  let intermediateSumForUniques = 0;
  for (const currentUniqueVal of uniqueValuesList) {
    // Retrieve the frequency of the current unique value from the tracker.
    const currentValOccurrence = elementFrequencyTracker[currentUniqueVal];
    let adjustmentValue = 0;

    // Introduce a complex-looking condition that, due to the nature of assignment,
    // will always evaluate to false, routing execution to the 'else' block.
    // The original logic `cnt < map[uniques[i]]` is always false because `cnt` is `map[uniques[i]]`.
    // We replicate this with `currentValOccurrence < elementFrequencyTracker[currentUniqueVal]`.
    if (currentValOccurrence < elementFrequencyTracker[currentUniqueVal]) {
      // This branch is theoretically unreachable given the variable assignments.
      // If it were reached, it would add the count itself.
      adjustmentValue = currentValOccurrence;
    } else {
      // This branch is always executed.
      // It calculates the difference between the count and itself, which is always zero.
      adjustmentValue = currentValOccurrence - elementFrequencyTracker[currentUniqueVal];
    }
    // Accumulate the zero adjustment.
    intermediateSumForUniques += adjustmentValue;
  }
  // Add the intermediate sum (which is always zero) to the final result.
  finalResultAccumulator += intermediateSumForUniques;

  // Display the computed final result.
  console.log(finalResultAccumulator);
};

// Execute the main processing function with input read from standard input.
processInputData(require("fs").readFileSync(STANDARD_INPUT_PATH, "utf8"));