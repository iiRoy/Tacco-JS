/*
 * This script processes a string of raw data, typically read from standard input,
 * to perform conditional calculations and output results. It extracts two numeric
 * values from the input and applies different logic paths based on their magnitudes.
 */
function processInputData(rawDataContent) {
  // Establish a foundational numeric value for computations.
  const BASE_VALUE_LIMIT = 100;

  // Split the raw input string by any sequence of whitespace characters.
  // The filter ensures that any empty strings resulting from the split are removed.
  const splitDataTokens = rawDataContent.split(/\s+/).filter(Boolean);

  // --- Robust Input Verification ---
  // Ensure that at least two distinct data tokens are available for processing.
  if (splitDataTokens.length < 2) {
    // If input is insufficient, log an error and terminate execution gracefully.
    console.error("Input Error: Expected a minimum of two numeric components.");
    return;
  }

  // Attempt to parse the first token as a floating-point number, then convert to an integer.
  const exponentFactor = Math.floor(parseFloat(splitDataTokens[0]));
  // Attempt to parse the second token as a floating-point number.
  const primaryOperand = parseFloat(splitDataTokens[1]);

  // Validate that both parsed values are indeed valid numbers (not NaN).
  if (isNaN(exponentFactor) || isNaN(primaryOperand)) {
    // If any parsing fails, report an error and halt.
    console.error("Data Parsing Error: One or both input values are not valid numbers.");
    return;
  }

  // --- Conditional Execution Pathways ---

  // Check if the exponent factor falls outside the desired range [1, 2].
  // This serves as an initial bypass condition.
  if (!(exponentFactor >= 1 && exponentFactor <= 2)) {
    // When the exponent factor is 0 or greater than 2, output the primary operand directly.
    // A template literal is used for dynamic string construction.
    const directOutputString = `Initial Condition Met: ${primaryOperand}`;
    console.log(directOutputString);
    return; // Exit the function immediately after this condition.
  }

  // If the code reaches this point, 'exponentFactor' is guaranteed to be 1 or 2.
  // Now, evaluate the 'primaryOperand' against the 'BASE_VALUE_LIMIT'.
  if (primaryOperand > BASE_VALUE_LIMIT) {
    // For cases where 'primaryOperand' exceeds the limit, perform a specific calculation.
    // The exponentiation operator (**) is used for clarity and modern JS syntax.
    let powerResult = BASE_VALUE_LIMIT ** exponentFactor;
    let finalComputation = powerResult * primaryOperand;

    // Display the computed result, formatted to two decimal places for consistency.
    console.log(`Calculation Complete: ${finalComputation.toFixed(2)}`);
  }
  // Note: If 'primaryOperand' is less than or equal to 'BASE_VALUE_LIMIT',
  // and 'exponentFactor' is 1 or 2, no output is generated, mirroring the original behavior.
}

// --- Application Initialization and Error Handling ---
try {
  // Read the entire content of standard input synchronously, assuming UTF-8 encoding.
  // The .trim() method removes leading/trailing whitespace from the input string.
  const fileDataContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
  // Invoke the main processing function with the acquired data.
  processInputData(fileDataContent);
} catch (runtimeError) {
  // Catch and report any exceptions that occur during file reading or the processing logic.
  console.error("An unexpected system error occurred:", runtimeError.message);
}