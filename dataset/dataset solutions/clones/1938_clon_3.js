// This module contains a core routine for assessing a binary state based on two numerical inputs.
// It processes raw textual data, performs validation, and outputs a specific status indicator.

/**
 * Primary function to evaluate a given scenario based on two numerical parameters.
 * It parses an input string, validates its components, and determines a resultant status.
 * @param {string} rawSourceData - A string expected to contain two space-separated numeric values.
 * @returns {void} This function prints its determination directly to the console.
 */
const determineSystemStatus = (rawSourceData) => {

  // Step 1: Clean and tokenize the raw input string.
  // Using a regular expression to handle multiple spaces gracefully and trimming leading/trailing whitespace.
  const dataTokens = rawSourceData.trim().split(/\s+/);

  // Step 2: Perform initial validation on the token count.
  // A crucial guard clause to ensure we have the expected number of arguments.
  if (dataTokens.length < 2) {
    // If insufficient data, log an error state and terminate processing for this input.
    console.log("INPUT_FORMAT_ERROR");
    return;
  }

  // Step 3: Parse the extracted tokens into numerical values.
  // Explicitly converting string tokens to numbers using the Number() constructor for precision.
  const primaryReferenceValue = Number(dataTokens[0]);
  const comparisonTargetValue = Number(dataTokens[1]);

  // Step 4: Validate that the parsed values are indeed valid numbers.
  // This guards against non-numeric input leading to unexpected behavior (e.g., string comparison or NaN).
  if (isNaN(primaryReferenceValue) || isNaN(comparisonTargetValue)) {
    // If parsing fails, output a specific error indicating bad numerical data.
    console.log("NUMERIC_PARSE_FAILURE");
    return;
  }

  let outcomeDescription; // Intermediate variable to store the final output string.

  // Step 5: Evaluate the core condition.
  // The original condition (W > S) is inverted here (S >= W) for a different logical flow.
  // This demonstrates rewriting the conditional logic while maintaining functional equivalence.
  if (primaryReferenceValue >= comparisonTargetValue) {
    outcomeDescription = "STATUS_CRITICAL";
  } else {
    outcomeDescription = "STATUS_NOMINAL";
  }

  // Step 6: Output the determined status.
  // The final result is logged after all processing and determination.
  console.log(outcomeDescription);
};

// --- Execution Entry Point ---

// This block handles the environment-specific setup for input reading.
// It uses Node.js's built-in 'fs' module to read from standard input.
// Added helper variables for clearer configuration and a try-catch block for robustness.
const nodeFileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";
const defaultEncoding = "utf8";

try {
  // Read the entire content of the standard input file synchronously.
  const inputContentBuffer = nodeFileSystemModule.readFileSync(standardInputFilePath, defaultEncoding);
  // Pass the raw content to the main processing function.
  // The .trim() call is added here to ensure no extraneous whitespace affects processing.
  determineSystemStatus(inputContentBuffer.trim());
} catch (ioError) {
  // If any I/O error occurs during file reading, catch it and report a system error.
  // This is an added robustness feature (Type III addition).
  console.log("SYSTEM_IO_ERROR");
}