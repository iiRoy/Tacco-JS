// This module defines a routine for processing and reordering numerical input.

/**
 * Processes a raw string of numerical data, extracting specific values
 * and displaying them in a predefined sequence.
 * @param {string} incomingDataString - The complete string received from an input source,
 *                                    expected to contain space-separated integer values.
 */
function processNumericalData(incomingDataString) {
  // First, split the input string into an array of individual string components.
  // Trimming is included to handle potential leading/trailing whitespace in the input.
  const componentsArray = incomingDataString.trim().split(" ");

  // Define a constant for the minimum expected number of data segments.
  const REQUIRED_SEGMENT_COUNT = 3;

  // Implement a basic validation check: ensure enough components are present.
  // If the input is malformed or incomplete, an error message is logged,
  // and the function execution is halted to prevent further errors.
  if (componentsArray.length < REQUIRED_SEGMENT_COUNT) {
    console.error("Data error: Not enough numerical segments provided. Expected " + REQUIRED_SEGMENT_COUNT + ".");
    return; // Exit early due to invalid input.
  }

  // Parse the numerical values from the components array based on specific indices.
  // The original problem specifies a reordering of elements for output.
  // The first value for the final output sequence is derived from the third input component (index 2).
  const firstOutputNumber = parseInt(componentsArray[2], 10);

  // The second value for the final output sequence is derived from the first input component (index 0).
  const secondOutputNumber = parseInt(componentsArray[0], 10);

  // The third value for the final output sequence is derived from the second input component (index 1).
  const thirdOutputNumber = parseInt(componentsArray[1], 10);

  // Construct the final output string using a template literal for improved readability.
  const finalSequenceString = `${firstOutputNumber} ${secondOutputNumber} ${thirdOutputNumber}`;

  // Output the reordered numerical string to the standard console.
  console.log(finalSequenceString);
}

// This is the entry point for script execution.
// It reads the entire content of standard input, decodes it as UTF-8,
// and then passes it to the data processing function.
processNumericalData(require("fs").readFileSync("/dev/stdin", "utf8"));