// This module processes input data to determine which of two candidates is closer to a target value.
function processInputData(rawDataString) {
  // Defensive check for input validity. Ensures the input is a non-empty string.
  if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
    console.error("Error: Provided input data string is empty or invalid.");
    return; // Exit early if input is not usable.
  }

  /**
   * Helper function to compute the absolute difference (magnitude) between two numerical values.
   * @param {number} valueOne - The first number.
   * @param {number} valueTwo - The second number.
   * @returns {number} The absolute difference between valueOne and valueTwo.
   */
  const computeMagnitudeOfDifference = (valueOne, valueTwo) => {
    return Math.abs(valueOne - valueTwo);
  };

  // Step 1: Split the raw input string into individual tokens using any sequence of whitespace as a delimiter.
  const tokenizedInput = rawDataString.trim().split(/\s+/);

  // Step 2: Ensure we have the minimum required number of numerical components.
  const minimumExpectedComponents = 3;
  if (tokenizedInput.length < minimumExpectedComponents) {
    console.error(`Error: Not enough numerical components provided. Expected at least ${minimumExpectedComponents}, but got ${tokenizedInput.length}.`);
    return;
  }

  // Step 3: Convert string tokens to floating-point numbers. parseFloat is more robust than Number() for varied inputs.
  const numericComponents = tokenizedInput.map(strRepresentation => parseFloat(strRepresentation));

  // Step 4: Validate that all string-to-number conversions were successful.
  if (numericComponents.some(val => isNaN(val))) {
    console.error("Error: One or more input components could not be successfully parsed as a valid number.");
    return;
  }

  // Step 5: Assign the parsed numerical values to semantically meaningful variables.
  const primaryReference = numericComponents[0];
  const optionAlpha = numericComponents[1];
  const optionBeta = numericComponents[2];

  // Step 6: Calculate the absolute differences of the primary reference to each candidate option.
  const deviationFromAlpha = computeMagnitudeOfDifference(primaryReference, optionAlpha);
  const deviationFromBeta = computeMagnitudeOfDifference(primaryReference, optionBeta);

  // Step 7: Determine which option is closer to the primary reference, or if they are equidistant.
  let finalDecisionLabel;
  if (deviationFromAlpha > deviationFromBeta) {
    // If optionAlpha is further away than optionBeta, then optionBeta is the closer choice.
    finalDecisionLabel = 'B';
  } else {
    // If optionAlpha is closer or equidistant to optionBeta, then optionAlpha is the preferred choice.
    finalDecisionLabel = 'A';
  }

  // Step 8: Output the determined label to the console.
  console.log(finalDecisionLabel);
}

// Main execution block: This section handles reading input from standard input and passing it to the processing function.
try {
  // Attempt to read the entire content of standard input as a UTF-8 string.
  const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
  // Delegate the actual data processing to our dedicated function.
  processInputData(standardInputContent);
} catch (ioError) {
  // Catch and report any errors that occur during the file reading process.
  console.error("Failed to read input from /dev/stdin:", ioError.message);
}