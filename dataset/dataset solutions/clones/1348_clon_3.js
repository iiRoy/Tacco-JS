// This JavaScript module is designed to process a single numerical input,
// typically representing the radius of a circle, obtained from standard input.
// It then computes two fundamental properties of that circle: its area and its circumference.
// The results are formatted to a specific number of decimal places before being printed.

/**
 * Encapsulates the entire logic for reading input, performing calculations,
 * and presenting the output related to circle properties.
 * This function is immediately invoked to execute the script.
 */
(function performGeometricCalculations() {
  // --- Configuration and Constants ---
  // Define a constant for the mathematical value of Pi, using JavaScript's built-in precision.
  const M_PI_CONSTANT = Math.PI;

  // Specify the desired number of decimal places for all final numerical outputs.
  const OUTPUT_DECIMAL_FIXED_PRECISION = 6;

  // Define the path from which the numerical radius input will be read.
  // In competitive programming environments, this often points to standard input.
  const SOURCE_INPUT_LOCATION = "/dev/stdin";

  let currentCircleRadius = 0.0; // Initialize the variable that will store the parsed radius.

  // --- Utility Function for Input Handling ---
  /**
   * Reads numerical data from a specified file path, performs validation,
   * and returns the parsed float value. Includes error handling for I/O and parsing issues.
   * @param {string} inputFilePath The path to the file containing the numerical input.
   * @returns {number} The parsed floating-point number, or 0.0 if an error occurred or input was invalid.
   */
  const acquireValidatedNumericInput = (inputFilePath) => {
    try {
      // Attempt to access the file system module.
      // This assumes a Node.js environment where 'fs' is available.
      const fileSystemModule = require("fs");

      // Read the entire content of the file as a UTF-8 string.
      const rawContentBuffer = fileSystemModule.readFileSync(inputFilePath, "utf8");

      // Clean up the raw string by removing leading/trailing whitespace.
      const trimmedContentString = rawContentBuffer.trim();

      // Attempt to convert the cleaned string into a floating-point number.
      const numericalValue = parseFloat(trimmedContentString);

      // Validate if the conversion resulted in a legitimate number.
      if (isNaN(numericalValue)) {
        // If the parsed value is not a number, log an error and return a default.
        console.error(`[ERROR] Invalid numerical input detected: '${trimmedContentString}'. Defaulting radius to 0.`);
        return 0.0;
      }

      // Return the successfully parsed and validated numerical input.
      return numericalValue;
    } catch (inputError) {
      // Catch any exceptions that might occur during file reading (e.g., file not found, permissions).
      console.error(`[ERROR] Failed to read input from ${inputFilePath}. Reason: ${inputError.message}. Defaulting radius to 0.`);
      return 0.0; // Return a safe default value in case of I/O errors.
    }
  };

  // --- Main Execution Flow ---

  // Step 1: Obtain the radius value using the robust input acquisition function.
  currentCircleRadius = acquireValidatedNumericInput(SOURCE_INPUT_LOCATION);

  // --- Core Calculation Routines ---

  /**
   * Calculates the area of a circle given its radius and a value for Pi.
   * Formula: Area = Pi * radius^2
   * @param {number} r The radius of the circle.
   * @param {number} pi The value of Pi.
   * @returns {number} The calculated area of the circle.
   */
  const computeCircleArea = (r, pi) => {
    return pi * Math.pow(r, 2);
  };

  /**
   * Calculates the circumference of a circle given its radius and a value for Pi.
   * Formula: Circumference = 2 * Pi * radius
   * @param {number} r The radius of the circle.
   * @param {number} pi The value of Pi.
   * @returns {number} The calculated circumference of the circle.
   */
  const computeCircleCircumference = (r, pi) => {
    return 2 * pi * r;
  };

  // Step 2: Perform the actual geometric calculations using the obtained radius.
  const calculatedAreaResult = computeCircleArea(currentCircleRadius, M_PI_CONSTANT);
  const calculatedCircumferenceResult = computeCircleCircumference(currentCircleRadius, M_PI_CONSTANT);

  // --- Output Formatting and Presentation ---

  /**
   * Formats a given number to a string with a specified number of decimal places.
   * Ensures that even invalid numbers are handled gracefully for display.
   * @param {number} valueToFormat The number to be formatted.
   * @param {number} fixedDecimals The number of decimal places to fix the output to.
   * @returns {string} The formatted numerical string.
   */
  const formatNumericOutput = (valueToFormat, fixedDecimals) => {
    // Check if the value is actually a number and not NaN.
    if (typeof valueToFormat !== 'number' || isNaN(valueToFormat)) {
      // If not a valid number, return "0.000000" (or similar based on precision) as a fallback.
      return (0.0).toFixed(fixedDecimals);
    }
    return valueToFormat.toFixed(fixedDecimals);
  };

  // Step 3: Format the calculated results to the specified decimal precision.
  const areaFormattedString = formatNumericOutput(calculatedAreaResult, OUTPUT_DECIMAL_FIXED_PRECISION);
  const circumferenceFormattedString = formatNumericOutput(calculatedCircumferenceResult, OUTPUT_DECIMAL_FIXED_PRECISION);

  // Step 4: Construct the final output string as required (area and circumference separated by a space).
  const finalDisplayMessage = `${areaFormattedString} ${circumferenceFormattedString}`;

  // Step 5: Print the final message to standard output.
  console.log(finalDisplayMessage);

})(); // End of the Immediately-Invoked Function Expression.