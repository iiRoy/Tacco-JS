/**
 * Orchestrates the processing of raw input data to perform a specific numerical evaluation.
 * It expects two space-separated integers on the first line of the input.
 * The function then calculates their sum and outputs the sum if it's below a
 * predefined threshold, or an error identifier otherwise.
 *
 * @param {string} sourceContent - The complete raw string content received from an input source.
 */
function processInputData(sourceContent) {
  // Define a constant for the output message when a condition is not met.
  const OUT_OF_RANGE_MESSAGE = "ValueOutOfRange";

  // Establish the upper limit for the sum of the two numbers.
  const SUM_ACCEPTANCE_CEILING = 10;

  // Step 1: Preliminary input validation.
  // Ensure the provided content is a non-empty string.
  if (typeof sourceContent !== 'string' || sourceContent.length === 0) {
    console.log(OUT_OF_RANGE_MESSAGE); // Indicate an issue with the input source.
    return; // Terminate execution due to invalid primary input.
  }

  // Step 2: Decompose the input string into individual lines.
  // We are primarily concerned with the very first line for this computation.
  const contentDividedByLines = sourceContent.split('\n');

  // Step 3: Validate the structure of the first line.
  // Check if any lines exist and if the first line isn't just whitespace.
  if (contentDividedByLines.length === 0 || contentDividedByLines[0].trim().length === 0) {
    console.log(OUT_OF_RANGE_MESSAGE); // Report an empty or malformed first line.
    return;
  }

  // Extract and clean the first line, removing leading/trailing whitespace.
  const primaryInputLine = contentDividedByLines[0].trim();

  // Step 4: Parse the numbers from the cleaned first line.
  // Split the line by spaces to get string representations of the numbers.
  const stringRepresentations = primaryInputLine.split(' ');

  // Step 5: Validate the number of operands.
  // Ensure there are at least two distinct parts that could be numbers.
  if (stringRepresentations.length < 2) {
    console.log(OUT_OF_RANGE_MESSAGE); // Insufficient number of operands.
    return;
  }

  // Step 6: Convert string operands to numeric types.
  // The unary plus operator is used for a concise string-to-number conversion.
  const operandOne = +stringRepresentations[0];
  const operandTwo = +stringRepresentations[1];

  // Step 7: Validate the numeric conversion.
  // Check if both conversions resulted in actual numbers (not NaN).
  if (isNaN(operandOne) || isNaN(operandTwo)) {
    console.log(OUT_OF_RANGE_MESSAGE); // Detection of non-numeric input.
    return;
  }

  // Step 8: Perform the core arithmetic operation.
  const resultantSum = operandOne + operandTwo;

  // Step 9: Evaluate the sum against the defined threshold.
  // Using a negative condition for stylistic variation: "is it NOT less than the ceiling?"
  if (!(resultantSum < SUM_ACCEPTANCE_CEILING)) {
    // If the sum is equal to or greater than the ceiling, output the specific message.
    console.log(OUT_OF_RANGE_MESSAGE);
  } else {
    // Otherwise, the sum is within the acceptable boundaries, so output its value.
    console.log(resultantSum);
  }
}

// --- Application Execution Entry Point ---
// This section is responsible for acquiring the input data from the standard
// input stream (typically /dev/stdin in Unix-like environments) and
// initiating the data processing. It includes basic error handling for input acquisition.
try {
  // Dynamically load the 'fs' (file system) module provided by Node.js.
  const nodeFileSystemModule = require('fs');

  // Define the standard path for reading input.
  const standardInputFilePath = '/dev/stdin';

  // Specify the character encoding for reading the file content.
  const fileEncodingFormat = 'utf8';

  // Synchronously read the entire content from the specified input path.
  // The content is expected to be a Buffer, so .toString() is used to convert it.
  const acquiredInputString = nodeFileSystemModule.readFileSync(standardInputFilePath, fileEncodingFormat).toString();

  // Pass the acquired string content to our primary processing function.
  processInputData(acquiredInputString);

} catch (inputReadingError) {
  // If any error occurs during the file reading process (e.g., file not found, permissions),
  // log the error message and exit the process with a non-zero status code,
  // indicating that the script terminated abnormally.
  console.error("An exceptional condition occurred during input acquisition:", inputReadingError.message);
  process.exit(1); // Signal an error to the operating system.
}