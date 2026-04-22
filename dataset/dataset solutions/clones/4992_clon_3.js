// This module provides a function to process raw string data
// and perform a specific conditional computation based on numerical values.

/**
 * Processes a multi-line string input to extract numerical values
 * and compute a final result based on specific conditions.
 *
 * @param {string} rawInputContent - The raw string data, expected to contain
 *                                   four newline-separated numbers.
 * @returns {number | null} The calculated numerical result, or null if input parsing fails.
 */
function calculateSpecialValue(rawInputContent) {
  // Ensure the input string is not null or undefined
  if (typeof rawInputContent !== 'string' || rawInputContent === null) {
    console.error("Error: Invalid input content provided. Expected a string.");
    return null; // Return null for invalid input
  }

  // Split the raw string into lines and attempt to convert to numbers.
  // We'll perform trimming on each line for robustness, removing leading/trailing whitespace.
  const numericStrings = rawInputContent.split('\n').map(s => s.trim());

  // Check if we have exactly four lines of data as expected for our calculation.
  if (numericStrings.length < 4) {
    console.error("Error: Insufficient data lines. Expected at least 4 numerical entries.");
    return null;
  }

  // Explicitly parse each value, adding a small validation check for each.
  const primaryOperand = Number(numericStrings[0]);
  const comparisonThreshold = Number(numericStrings[1]);
  const baseRateFactor = Number(numericStrings[2]);
  const differentialRateFactor = Number(numericStrings[3]);

  // Validate if all parsed values are actual numbers. If any conversion resulted in NaN,
  // it indicates a problem with the input format.
  if (isNaN(primaryOperand) || isNaN(comparisonThreshold) || isNaN(baseRateFactor) || isNaN(differentialRateFactor)) {
    console.error("Error: Failed to parse one or more input values as valid numbers.");
    return null;
  }

  // --- Core Conditional Calculation Logic ---
  // This inner helper function encapsulates the specific arithmetic logic.
  const performConditionalArithmetic = (valOne, valTwo, factorA, factorB) => {
    // Calculate the base amount, which is always part of the total.
    const initialComputedAmount = valTwo * factorA; // Equivalent to 'b * c' from original logic

    // Apply the conditional logic based on the comparison of the first two values.
    if (valOne > valTwo) {
      // If the first value exceeds the second, calculate an additional charge.
      const excessAmount = valOne - valTwo; // Equivalent to 'a - b'
      const incrementalCharge = excessAmount * factorB;  // Equivalent to '(a - b) * d'
      return initialComputedAmount + incrementalCharge;
    } else {
      // If the first value is less than or equal to the second, only the base amount applies.
      return initialComputedAmount;
    }
  };

  // Execute the core calculation with our parsed input values.
  const finalComputedResult = performConditionalArithmetic(
    primaryOperand,
    comparisonThreshold,
    baseRateFactor,
    differentialRateFactor
  );

  // Log the final computed result to the standard output as required.
  console.log(finalComputedResult);

  // The function also returns the result for potential external use or testing.
  return finalComputedResult;
}

// --- Application Entry Point & Input Handling ---
// This section is responsible for reading the input data from the standard input stream
// and then invoking the primary processing function.
try {
  // Use Node.js's built-in 'fs' (file system) module to read data.
  const fileSystemModule = require('fs');
  // Define the standard input path, which is common on Unix-like operating systems.
  const standardInputDevicePath = '/dev/stdin';
  // Read the entire content of the standard input synchronously as a UTF-8 encoded string.
  const rawDataObtainedFromStdin = fileSystemModule.readFileSync(standardInputDevicePath, 'utf8');

  // Call our main processing function with the data read from stdin.
  calculateSpecialValue(rawDataObtainedFromStdin);

} catch (inputReadingError) {
  // Catch and report any errors that occur during the file reading process.
  // This could include issues like the file not existing (though /dev/stdin usually does),
  // or permission problems.
  console.error("An error occurred while attempting to read data from standard input:", inputReadingError.message);
  // Optionally, exit the process with an error code to signal failure to the environment.
  // process.exit(1);
}