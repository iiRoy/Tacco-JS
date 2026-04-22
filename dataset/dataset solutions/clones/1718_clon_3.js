/**
 * Computes a specific polynomial series sum for a given base number.
 * The series is defined as: base + base^2 + base^3.
 *
 * @param {string} inputDataString - The raw string input which should represent a numeric value.
 *                                   If the input is not a valid number or is empty,
 *                                   it defaults to 0 for calculations after logging a warning.
 * @returns {void} This function prints the computed sum directly to the console.
 */
function evaluatePolynomialSeries(inputDataString) {
  // Declare a variable to hold the numeric base value.
  let baseNumber;

  // Perform initial validation on the input string.
  // Check if the input is a valid string and not just whitespace.
  if (typeof inputDataString !== 'string' || inputDataString.trim() === '') {
    console.warn("Input string is empty or invalid. Defaulting to 0 for computations.");
    baseNumber = 0; // Assign a default value for invalid input.
  } else {
    // Attempt to convert the input string to a floating-point number.
    const potentialNumericValue = Number(inputDataString);

    // Validate if the conversion resulted in a valid number.
    if (isNaN(potentialNumericValue)) {
      console.warn(`Could not parse "${inputDataString.trim()}" as a number. Defaulting to 0.`);
      baseNumber = 0; // Handle non-numeric input by defaulting.
    } else {
      // If conversion is successful, use the parsed number.
      baseNumber = potentialNumericValue;
    }
  }

  // Calculate the individual terms of the polynomial series.
  // Using direct multiplication instead of Math.pow for small integer exponents.
  const termOne = baseNumber;
  const termTwo = baseNumber * baseNumber;       // Equivalent to Math.pow(baseNumber, 2)
  const termThree = baseNumber * baseNumber * baseNumber; // Equivalent to Math.pow(baseNumber, 3)

  // Sum up all the calculated terms to get the final result.
  const computedSumResult = termOne + termTwo + termThree;

  // Output the final computed sum to the standard output.
  console.log(computedSumResult);
}

// --- Program Execution Entry Point ---
try {
  // Dynamically load the Node.js 'fs' (file system) module.
  const fileSystemUtility = require('fs');

  // Read the entire content of the standard input stream as a UTF-8 string.
  // This operation is synchronous and will block until input is available.
  const contentFromStandardInput = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

  // Invoke the main computation function with the acquired input.
  evaluatePolynomialSeries(contentFromStandardInput);

} catch (inputAcquisitionError) {
  // Catch any errors that might occur during file system operations,
  // such as '/dev/stdin' not being accessible or other read errors.
  console.error("An error occurred during standard input acquisition:", inputAcquisitionError.message);
  // As a fallback, call the function with a default empty string,
  // which will trigger its internal default handling.
  evaluatePolynomialSeries("");
}