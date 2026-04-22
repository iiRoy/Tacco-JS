// This JavaScript module is designed to process a string of numerical data.
// Its primary function is to calculate the product of the initial two numbers
// provided in the input, and subsequently determine the smallest value
// between this computed product and a third numerical component.

/**
 * Safely converts a given string segment into a floating-point number.
 * This utility function includes robust error handling to ensure data integrity.
 *
 * @param {string} segmentString - The string representation of a number to be parsed.
 * @param {number} segmentIndex - The zero-based index of the segment within the original input,
 *                                used for more informative error messages.
 * @returns {number} The successfully parsed floating-point number.
 * @throws {Error} If the provided segment string cannot be accurately converted to a number.
 */
function convertToFloatWithValidation(segmentString, segmentIndex) {
  const numericOutcome = parseFloat(segmentString);

  // A crucial validation step: check if the parsing operation resulted in a valid number.
  if (isNaN(numericOutcome)) {
    console.error(`Data Parsing Error: Input component at position ${segmentIndex + 1} ('${segmentString}') is not a valid numerical value.`);
    // In a production system, one might throw a custom error or return a default/null value.
    // For this example, we'll throw a generic Error.
    throw new Error(`Invalid data format detected: non-numeric value found at segment ${segmentIndex + 1}.`);
  }
  return numericOutcome;
}

/**
 * Core processing function that takes a raw string payload, parses it,
 * performs calculations, and outputs the final result.
 *
 * @param {string} rawDataPayload - A string expected to contain at least three
 *                                  space-separated numerical values (e.g., "10 5 7").
 */
function processNumericalData(rawDataPayload) {
  // Step 1: Deconstruct the incoming string into an array of smaller string fragments.
  // Using .trim() helps to handle potential leading or trailing whitespace.
  const segmentArray = rawDataPayload.trim().split(' ');

  // Mandatory check: Ensure that the input provides enough data points for the required operations.
  const MINIMUM_EXPECTED_PARTS = 3;
  if (segmentArray.length < MINIMUM_EXPECTED_PARTS) {
    console.error(`Input Structure Error: Expected at least ${MINIMUM_EXPECTED_PARTS} numerical parts, but received only ${segmentArray.length}.`);
    // An early exit or a more specific error handling mechanism could be implemented here.
    return;
  }

  // Step 2: Parse the critical numerical components from the segment array.
  // We leverage our robust helper function for each conversion.
  let firstParsedOperand;
  let secondParsedOperand;
  let thirdComparisonOperand;

  try {
    firstParsedOperand = convertToFloatWithValidation(segmentArray[0], 0);
    secondParsedOperand = convertToFloatWithValidation(segmentArray[1], 1);
    thirdComparisonOperand = convertToFloatWithValidation(segmentArray[2], 2);
  } catch (parsingErr) {
    // Catch specific errors from the parsing helper and re-log or re-throw as needed.
    console.error(`Processing halted due to parsing issues: ${parsingErr.message}`);
    return;
  }

  // Step 3: Execute the primary arithmetic operation: multiplication of the first two numbers.
  const productOfFirstTwo = firstParsedOperand * secondParsedOperand;

  // Step 4: Determine the absolute minimum between the calculated product and the third operand.
  // This replaces the traditional 'if-else' conditional logic with a more compact Math function call.
  const finalComputedMinimum = Math.min(productOfFirstTwo, thirdComparisonOperand);

  // Step 5: Present the final result to the standard output stream.
  console.log(finalComputedMinimum);
}

// --- Program Entry Point and Execution Flow ---

/**
 * Initiates the application by reading input from stdin and orchestrating
 * the data processing logic. Includes basic error handling for I/O operations.
 */
function startApplicationFromStandardInput() {
  try {
    // Synchronously read all available data from the standard input stream.
    // This is typical for competitive programming or simple script execution.
    const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Delegate the actual data processing to our dedicated function.
    processNumericalData(standardInputContent);
  } catch (ioOrProcessingError) {
    // Catch any exceptions that might occur during file reading or within the processing pipeline.
    console.error(`Application Runtime Error: An unhandled exception occurred: ${ioOrProcessingError.message}`);
    // Indicate an abnormal termination to the operating system.
    process.exit(1);
  }
}

// Execute the main application startup sequence.
startApplicationFromStandardInput();