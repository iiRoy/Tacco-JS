// This module is designed to process incoming textual data, typically from standard input,
// to perform a specific arithmetic calculation based on its first two lines.
// It incorporates robust error handling and explicit type conversions for reliability.

/**
 * Orchestrates the primary data processing flow. This function expects
 * a multi-line string where the first two lines should represent numeric values.
 * It calculates (second_number * 2) - first_number and outputs the result.
 * Comprehensive validation checks are performed at various stages to ensure
 * data integrity and provide informative error messages.
 *
 * @param {string} rawSourceContent - The complete raw string input, potentially with multiple lines.
 */
function executeInputTransformation(rawSourceContent) {

  // Step 1: Initial validation of the raw input stream.
  // This guard clause ensures that we have a non-empty string to work with.
  if (typeof rawSourceContent !== 'string' || rawSourceContent === null || rawSourceContent.length === 0) {
    console.error("Processing halted: Input data is invalid. Expected a non-empty string.");
    return; // Terminate execution gracefully.
  }

  // Step 2: Clean up the input string by removing any leading or trailing whitespace.
  const sanitizedText = rawSourceContent.trim();

  // Step 3: Divide the cleaned string into an array of individual lines.
  // Each element in this array will correspond to a line from the input.
  const segmentedLines = sanitizedText.split('\n');

  // Step 4: Validate the number of lines to ensure we have sufficient data for the calculation.
  // We require at least two lines: one for the 'first value' and one for the 'second value'.
  if (segmentedLines.length < 2) {
    console.error(`Data insufficiency: Expected a minimum of two lines but detected only ${segmentedLines.length}.`);
    return; // Exit if critical data is missing.
  }

  // Step 5: Extract the string representations of the two required numerical values.
  // These correspond to the first and second lines of the input.
  const numericalStringOne = segmentedLines[0]; // Represents the original 'r'
  const numericalStringTwo = segmentedLines[1]; // Represents the original 'g'

  // Step 6: Explicitly convert the extracted string values into numerical types.
  // Using Number() provides a clear intent for conversion and handles various formats.
  const numericValueAlpha = Number(numericalStringOne);
  const numericValueBeta = Number(numericalStringTwo);

  // Step 7: Validate that the string-to-number conversions were successful.
  // If either conversion results in NaN (Not a Number), it indicates invalid numeric input.
  if (isNaN(numericValueAlpha) || isNaN(numericValueBeta)) {
    console.error(`Conversion failure: One or both input lines ('${numericalStringOne}', '${numericalStringTwo}') could not be parsed into valid numbers.`);
    return; // Abort if the numbers are not valid.
  }

  // --- Core Business Logic: Perform the Arithmetic Operation ---

  // Step 8: Calculate an intermediate product: double the second numerical value.
  // This is equivalent to 'g * 2' from the original logic.
  const multipliedBeta = numericValueBeta * 2;

  // Step 9: Perform the final subtraction: subtract the first value from the doubled second value.
  // This completes the '(g * 2) - r' calculation.
  const finalComputedOutcome = multipliedBeta - numericValueAlpha;

  // Step 10: Output the final computed result to the standard output stream.
  // A descriptive label is added for better context, enhancing readability of the output.
  console.log("Calculated Output: " + finalComputedOutcome);

}

// --- Application Entry Point & Input Handling ---
// This block is responsible for reading the input from the file system,
// typically standard input in a competitive programming environment,
// and initiating the data processing. It includes error handling for I/O operations.

const fileManagementModule = require('fs'); // Import Node.js's native file system module.
const standardInputDevicePath = '/dev/stdin'; // Define the common path for standard input on Unix-like systems.
const fileEncodingScheme = 'utf8'; // Specify the character encoding to use when reading the file.

try {
  // Synchronously read the entire content of the specified input file.
  // The 'utf8' encoding ensures the content is interpreted as a string.
  const rawStreamContents = fileManagementModule.readFileSync(standardInputDevicePath, fileEncodingScheme);

  // Pass the obtained file content to our main processing function.
  executeInputTransformation(rawStreamContents);

} catch (fileReadError) {
  // If any error occurs during the file reading operation (e.g., file not found, permissions),
  // catch it here and log an informative error message to the console.
  console.error(`File I/O Error: Could not read from ${standardInputDevicePath}. Details: ${fileReadError.message}`);
  // Optionally, you might want to terminate the process with a non-zero exit code
  // to signal an error to the calling environment.
  // process.exit(1);
}