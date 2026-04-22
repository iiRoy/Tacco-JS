// This module provides a utility function to process a string containing
// two space-separated numbers, interpreting them as dimensions for a specific
// geometric calculation, such as the area of a right-angled triangle.

/**
 * Processes a raw input string to extract two numerical values and computes
 * half of their product.
 *
 * @param {string} rawInputString - The raw string input, expected to contain
 *                                  at least two space-separated numbers.
 * @returns {number|null} The computed result (half of the product of the two numbers),
 *                          or null if parsing or validation fails.
 */
function processDimensionalInput(rawInputString) {
  // Step 1: Normalize and tokenize the input string.
  // Trim leading/trailing whitespace and split by any sequence of whitespace characters.
  // Filter out any empty tokens that might result from multiple spaces.
  const tokenizedData = rawInputString.trim().split(/\s+/).filter(Boolean);

  // Step 2: Validate the number of tokens received.
  // We require exactly two numerical tokens for our calculation.
  if (tokenizedData.length < 2) {
    console.error("Input Error: Expected at least two numerical components, but received fewer.");
    // Returning null signals a failure in processing the input.
    return null;
  }

  // Define the numerical base for parsing integers. Explicitly setting to 10 for decimal.
  const parsingRadix = 10;

  // Step 3: Parse the individual numerical components from the tokens.
  // The first token is expected to be the first dimension.
  const firstDimensionValue = parseInt(tokenizedData[0], parsingRadix);
  // The second token is expected to be the second dimension.
  const secondDimensionValue = parseInt(tokenizedData[1], parsingRadix);

  // Step 4: Validate that both parsed values are indeed valid numbers.
  if (isNaN(firstDimensionValue) || isNaN(secondDimensionValue)) {
    console.error("Input Error: One or both provided input tokens could not be converted to valid numbers.");
    return null; // Indicates that numerical conversion failed.
  }

  // Step 5: Perform the core calculation.
  // Calculate the direct product of the two dimensions.
  const productOfDimensions = firstDimensionValue * secondDimensionValue;
  // Then, divide the product by 2.0 to ensure floating-point division,
  // representing the desired geometric area.
  const finalComputedArea = productOfDimensions / 2.0;

  // Step 6: Return the successfully computed result.
  return finalComputedArea;
}

/**
 * Orchestrates the entire process: reading input from a file,
 * performing the calculation, and displaying the result.
 *
 * @param {string} sourcePath - The file path from which to read the input data.
 */
function executeApplicationLogic(sourcePath) {
  let fileContents;
  try {
    // Attempt to read the entire file synchronously.
    // Specify 'utf8' encoding for text interpretation.
    fileContents = require('fs').readFileSync(sourcePath, 'utf8');
  } catch (ioError) {
    // Catch and report any errors during file reading.
    console.error(`System Error: Could not read input from '${sourcePath}'. Details: ${ioError.message}`);
    // Terminate execution if input cannot be obtained.
    return;
  }

  // Call the main processing function with the obtained file contents.
  const calculationResult = processDimensionalInput(fileContents);

  // Check if the calculation yielded a valid result.
  if (calculationResult !== null) {
    // If successful, print the final result to standard output.
    console.log(calculationResult);
  } else {
    // If the result is null, an error message would have already been
    // printed by `processDimensionalInput`. This serves as a secondary notification.
    console.warn("Operation Warning: The geometric calculation could not be completed. Please review input.");
  }
}

// Entry point of the application.
// This typically reads from standard input when executed in a competitive programming environment.
executeApplicationLogic('/dev/stdin');