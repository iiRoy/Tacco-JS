// This script computes a specific geometric area based on two numerical inputs.
// It expects the inputs to be provided as a single string, space-separated.

/**
 * Processes a raw input string containing two space-separated numbers,
 * calculates their product divided by two, and prints the result.
 *
 * @param {string} rawInputContent - The string containing the numerical inputs.
 *                                   Expected format: "NUMBER1 NUMBER2".
 */
function processNumericalDimensions(rawInputContent) {
  // Validate the fundamental type of the input before proceeding.
  if (typeof rawInputContent !== 'string') {
    console.error("Input supplied is not a string. Cannot proceed with calculation.");
    return; // Halt execution if input is invalid.
  }

  // Trim whitespace from both ends and split the string by one or more spaces.
  // This ensures robustness against varying whitespace.
  const numericalComponents = rawInputContent.trim().split(/\s+/);

  // Implement a guard clause to ensure we have sufficient components.
  const minimumExpectedComponents = 2;
  if (numericalComponents.length < minimumExpectedComponents) {
    console.error(`Error: Insufficient data points provided. Expected at least ${minimumExpectedComponents}, got ${numericalComponents.length}.`);
    return;
  }

  // Explicitly convert string components to floating-point numbers.
  // This handles potential non-integer inputs.
  const dimensionA = parseFloat(numericalComponents[0]);
  const dimensionB = parseFloat(numericalComponents[1]);

  // Perform validation on the parsed numerical values.
  // Check for NaN (Not-a-Number) and Infinity.
  if (isNaN(dimensionA) || isNaN(dimensionB) || !Number.isFinite(dimensionA) || !Number.isFinite(dimensionB)) {
    console.error("Error: One or both of the provided dimensions are not valid finite numbers.");
    return;
  }

  // Introduce a constant for the division factor.
  const areaDivisor = 2.0; // Use a float literal for clarity in division.

  // Break down the calculation into intermediate steps for readability.
  const intermediateProduct = dimensionA * dimensionB;
  const finalCalculatedValue = intermediateProduct / areaDivisor;

  // Output the computed result to the console with a descriptive label.
  console.log("Resulting computed value:", finalCalculatedValue);
}

// Define the standard input path as a constant.
const standardInputFilePath = '/dev/stdin';

// Utilize a try-catch block for robust file reading operations.
try {
  // Read the content of the standard input file synchronously.
  // Specify UTF-8 encoding to correctly interpret characters.
  const inputDataStream = require('fs').readFileSync(standardInputFilePath, { encoding: 'utf8' });

  // Invoke the main processing function with the obtained input data.
  processNumericalDimensions(inputDataStream);
} catch (readingError) {
  // Log any errors encountered during the file reading process.
  console.error(`An error occurred while attempting to read from stdin: ${readingError.message}`);
  // Optionally, exit the process with an error code.
  // process.exit(1);
}