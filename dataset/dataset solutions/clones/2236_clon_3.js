// This module is responsible for processing a multi-line string input,
// interpreting it as dimensional data, and computing a specific output value.

/**
 * Orchestrates the processing of raw textual input to determine a calculated value
 * based on dimensional constraints and a target quantity.
 *
 * @param {string} inputString - The complete raw input data as a single string,
 *                               typically read from standard input.
 */
function ProcessInputData(inputString) {

  // A utility function to parse a string segment into a positive integer.
  // This adds robustness and explicit validation not present in the original.
  const retrieveValidatedPositiveInteger = (textSegment, fallbackValue = 0) => {
    // Attempt to convert the trimmed string to a number.
    const numericalConversion = Number(textSegment.trim());

    // Introduce a validation step: if the conversion results in NaN, or
    // if the number is not positive, we log a warning and use a fallback.
    // This handles potential malformed input gracefully.
    if (isNaN(numericalConversion) || numericalConversion <= 0) {
      console.warn(`Input validation warning: Non-numeric or non-positive value '${textSegment}' detected. Defaulting to ${fallbackValue}.`);
      return fallbackValue;
    }
    // For competitive programming, inputs are usually integers, but Math.floor
    // ensures we're dealing with whole numbers if floats were somehow introduced.
    return Math.floor(numericalConversion);
  };

  // Divide the incoming data string into an array of individual lines.
  const lineSegments = inputString.split('\n');

  // Extract and validate the three primary numerical parameters from the input.
  // These represent two spatial dimensions and a total count of items.
  const primarySpatialDimension = retrieveValidatedPositiveInteger(lineSegments[0]);
  const secondarySpatialDimension = retrieveValidatedPositiveInteger(lineSegments[1]);
  const totalItemQuantity = retrieveValidatedPositiveInteger(lineSegments[2]);

  // Determine the largest of the two spatial dimensions. This effectively
  // dictates the limiting factor for the subsequent calculation.
  // This replaces the original conditional logic with a more concise expression.
  const dominantDimension = Math.max(primarySpatialDimension, secondarySpatialDimension);

  let finalComputedResult; // Declaration for the ultimate outcome.

  // Implement an explicit guard clause to prevent division by zero,
  // which would lead to 'Infinity' or 'NaN' and potentially unexpected behavior.
  // If no valid dominant dimension exists, the result is set to zero.
  if (dominantDimension === 0) {
    console.error("Critical error: Both primary and secondary dimensions are zero or invalid. Calculation cannot proceed as expected.");
    finalComputedResult = 0; // Assign a safe default in error scenarios.
  } else {
    // Calculate the raw division result. This is an intermediate step
    // that clarifies the flow before final rounding.
    const intermediateDivision = totalItemQuantity / dominantDimension;

    // Round the intermediate result up to the nearest whole number.
    // This ensures that even a fraction of a unit counts as a full unit.
    finalComputedResult = Math.ceil(intermediateDivision);
  }

  // A dedicated function for outputting the final result.
  // This can be extended for more complex reporting or logging mechanisms.
  const presentCalculatedOutput = (outputValue) => {
    console.log(outputValue);
  };

  // Invoke the output function with the determined result.
  presentCalculatedOutput(finalComputedResult);
}

// Entry point for script execution. Reads content from standard input
// and initiates the data processing pipeline.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));