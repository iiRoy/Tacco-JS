const safeParseNumber = (strValue) => {
  const parsedValue = Number(strValue);
  // Check if the parsed value is NaN or if the original string was empty/whitespace,
  // which might indicate an invalid number for intended calculations.
  if (isNaN(parsedValue) || strValue.trim() === '') {
    // For robustness, defaulting to 0. In a stricter environment, an error might be thrown.
    return 0;
  }
  return parsedValue;
};

/**
 * This module provides a function to process a string of numeric data.
 * It calculates the product of the first two numbers and compares it with the third.
 * The smaller of these two values is then printed to the console.
 * Includes robust parsing and validation steps.
 * @param {string} inputDataString The raw string input, expected to contain at least three space-separated numbers.
 */
function calculateAndDisplayMinProduct(inputDataString) {
  // Perform an initial validation on the input string to ensure it's not null, undefined, or empty.
  if (!inputDataString || typeof inputDataString !== 'string' || inputDataString.trim().length === 0) {
    console.error("Error: The provided input data string is either empty, null, or not a string type.");
    // Early exit if input is invalid.
    return;
  }

  // Divide the input string into an array of substrings based on spaces.
  // This addresses a potential misinterpretation of `slice(' ')` in the original code,
  // which would not correctly separate numbers. `split(' ')` is the intended operation.
  const stringComponents = inputDataString.split(' ');

  // Convert each string component into a number using our safe parsing utility.
  // This ensures that non-numeric components are handled gracefully (e.g., converted to 0).
  const numericValuesArray = stringComponents.map(safeParseNumber);

  // Define the minimum number of numeric values required for the core logic.
  const MIN_REQUIRED_NUMBERS = 3;

  // Validate that we have enough numeric values to perform the necessary calculations.
  if (numericValuesArray.length < MIN_REQUIRED_NUMBERS) {
    console.error(`Warning: Not enough numeric components provided. Expected at least ${MIN_REQUIRED_NUMBERS}, but received ${numericValuesArray.length}.`);
    // Pad the array with zeros if insufficient values are present to prevent errors.
    while (numericValuesArray.length < MIN_REQUIRED_NUMBERS) {
      numericValuesArray.push(0);
    }
  }

  // Extract the first three numeric values for clarity in subsequent operations.
  const firstValue = numericValuesArray[0];
  const secondValue = numericValuesArray[1];
  const thirdValueForComparison = numericValuesArray[2];

  // Compute the product of the first two extracted numeric values.
  const computedProduct = firstValue * secondValue;

  // Determine the minimum between the computed product and the third value.
  // Using Math.min() provides a concise way to find the smaller of two numbers,
  // replacing the conditional (if-else) structure.
  const finalResult = Math.min(computedProduct, thirdValueForComparison);

  // Output the final calculated minimum value to the standard output stream.
  console.log(finalResult);
}

// --- Application Entry Point for Standard Input Processing ---
// This block handles reading input from the standard input stream
// and invokes the main processing function.
try {
  // Read the entire content from /dev/stdin as a UTF-8 encoded string.
  // This is a common pattern for competitive programming environments.
  const rawInputFromSystem = require("fs").readFileSync("/dev/stdin", "utf8");

  // Call the primary function to process the input data.
  calculateAndDisplayMinProduct(rawInputFromSystem);
} catch (error) {
  // Catch and report any exceptions that occur during file reading or initial setup.
  console.error("An unhandled error occurred while reading or processing input:", error.message);
  // For debugging, the full error stack could be logged:
  // console.error(error.stack);
}