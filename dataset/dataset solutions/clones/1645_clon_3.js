// This module processes input data to determine a specific outcome based on a series of numeric transformations.

/**
 * Orchestrates the parsing of raw input, applies a set of iterative transformations,
 * and evaluates the final state against predefined conditions.
 * @param {string} rawInputString - The complete input received, typically from stdin.
 */
function processInputData(rawInputString) {
  // First, split the entire input string into an array of individual lines.
  // Each line is expected to contain specific pieces of information.
  const dataLines = rawInputString.split('\n');

  // Input validation: Ensure a minimum number of lines are present for processing.
  // We expect at least two lines: one for the initial values and one for the iteration count.
  if (dataLines.length < 2) {
    console.error("Error: Insufficient input provided. Expected at least two lines of data.");
    return; // Exit early if the input structure is invalid.
  }

  // Parse the first line to extract the initial numeric sequence.
  // These values are expected to be space-separated strings.
  const stringValuesFromFirstLine = dataLines[0].split(' ');

  // Further validation: Confirm that exactly three numeric tokens were provided.
  if (stringValuesFromFirstLine.length !== 3) {
      console.error("Error: The first line must contain exactly three space-separated numeric values.");
      return;
  }

  // Convert the extracted string tokens into an array of integers.
  // Using `parseInt` with radix 10 ensures correct numeric interpretation.
  let currentNumericState = [
    parseInt(stringValuesFromFirstLine[0], 10),
    parseInt(stringValuesFromFirstLine[1], 10),
    parseInt(stringValuesFromFirstLine[2], 10)
  ];

  // Parse the second line to get the total number of transformation cycles to perform.
  const totalTransformationCycles = parseInt(dataLines[1], 10);

  // Validation: Check if the parsed cycle count is a valid non-negative integer.
  if (isNaN(totalTransformationCycles) || totalTransformationCycles < 0) {
      console.error("Error: The second line must specify a valid non-negative integer for transformation cycles.");
      return;
  }

  /**
   * Applies a series of conditional doubling operations to a numeric sequence.
   * This function encapsulates the core transformation logic.
   * @param {number[]} valuesToTransform - An array of three numbers to be modified.
   * @param {number} cyclesCount - The number of times to apply the transformation logic.
   * @returns {number[]} The array of numbers after all transformations.
   */
  function performIterativeDoubling(valuesToTransform, cyclesCount) {
    // Loop through each transformation cycle.
    for (let cycleIndex = 0; cycleIndex < cyclesCount; cycleIndex++) {
      // Check the primary doubling condition: if the second value is greater than or equal to the third.
      if (valuesToTransform[1] >= valuesToTransform[2]) {
        // If the condition holds, double the third value.
        valuesToTransform[2] *= 2;
      }
      // If the primary condition is false, check the secondary doubling condition:
      // if the first value is greater than or equal to the second.
      else if (valuesToTransform[0] >= valuesToTransform[1]) {
        // If this condition holds, double the second value.
        valuesToTransform[1] *= 2;
      }
      // If neither condition is met, the values remain unchanged for the current cycle.
    }
    // Return the array containing the numbers after all cycles are complete.
    return valuesToTransform;
  }

  // Execute the iterative doubling process on our initial numeric state.
  let finalTransformedValues = performIterativeDoubling(currentNumericState, totalTransformationCycles);

  // --- Final condition evaluation ---
  // Evaluate the first part of the final logical condition: Is the second value
  // less than or equal to the third value?
  const isSecondValueWithinBounds = (finalTransformedValues[1] <= finalTransformedValues[2]);

  // Evaluate the second part of the final logical condition: Is the first value
  // less than or equal to the second value?
  const isFirstValueWithinBounds = (finalTransformedValues[0] <= finalTransformedValues[1]);

  // Determine the final result message based on whether both conditions are met.
  // A ternary operator is used for concise conditional output.
  const outcomeString = (isSecondValueWithinBounds && isFirstValueWithinBounds) ? 'yes' : 'no';

  // Output the final determined message to the standard console.
  console.log(outcomeString);
}

// The program's entry point: reads the entire content of standard input,
// assumes UTF-8 encoding, and passes it to our main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));