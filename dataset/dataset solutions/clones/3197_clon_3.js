// Function designed to process incoming data, analyze numerical parameters,
// and determine an outcome based on a specific mathematical condition.
const evaluateThresholdCondition = (sourceDataString) => {
  // Initialize a variable to store the final result string.
  // Defaulting to "NO" ensures a consistent output even in error scenarios
  // unless explicitly changed by the core logic.
  let determinationOutcome = "NO";

  // --- Input Data Parsing and Initial Validation ---
  // The input is expected to be a string containing numerical data,
  // typically from a file or standard input.
  // We first clean up the string and split it into individual lines.
  const allInputLines = sourceDataString.trim().split('\n');

  // Perform a preliminary check to ensure the input isn't entirely empty
  // or just whitespace after trimming.
  if (allInputLines.length === 0 || allInputLines[0].trim().length === 0) {
    console.error("Error: Provided input string is empty or contains no meaningful data.");
    console.log(determinationOutcome); // Output the default 'NO' for invalid input.
    return; // Terminate execution as input is unusable.
  }

  // Focus on the very first line of input, as per problem specification.
  const primaryInputLineParts = allInputLines[0].split(' ');

  // Validate that the first line contains at least two distinct parts,
  // which are expected to be our two numerical parameters.
  if (primaryInputLineParts.length < 2) {
    console.error("Error: Insufficient numerical parameters found in the input line. Expected N and K.");
    console.log(determinationOutcome); // Output the default 'NO'.
    return; // Terminate due to malformed input.
  }

  // Attempt to parse the extracted string parts into integer numbers.
  // Using parseInt with radix 10 for explicit base conversion.
  const totalItemsCount = parseInt(primaryInputLineParts[0], 10);
  const criticalThreshold = parseInt(primaryInputLineParts[1], 10);

  // --- Robust Numerical Input Validation ---
  // Check if parsing resulted in non-numeric values (NaN) or if the values
  // are not positive integers, which are typically required for such problems.
  if (isNaN(totalItemsCount) || isNaN(criticalThreshold) || totalItemsCount <= 0 || criticalThreshold <= 0) {
    console.error("Error: Input values must be positive integers. Received:", { totalItemsCount, criticalThreshold });
    // If input is invalid, 'determinationOutcome' remains 'NO' as initialized.
  } else {
    // --- Core Conditional Logic Evaluation ---
    // The original condition can be expressed as: (N + 1) / 2 >= K
    // To avoid floating-point arithmetic and potential precision issues,
    // we can algebraically transform this inequality using integer operations:
    // 1. Multiply both sides by 2: N + 1 >= 2 * K
    // 2. Subtract 1 from both sides: N >= (2 * K) - 1
    // This derived form `N >= (2 * K) - 1` is mathematically equivalent and
    // often preferred for robustness with integer inputs.

    // Calculate the minimum required value for 'totalItemsCount' based on 'criticalThreshold'.
    const minimumRequiredCount = (2 * criticalThreshold) - 1;

    // Compare the actual total count against the calculated minimum.
    if (totalItemsCount >= minimumRequiredCount) {
      determinationOutcome = "YES"; // Condition is met.
    } else {
      // Condition is not met, 'determinationOutcome' remains "NO".
    }
  }

  // Output the final determined outcome to standard output.
  console.log(determinationOutcome);
};

// --- Application Entry Point for Execution ---
// This block handles reading input from the standard input stream,
// which is common in competitive programming environments.
try {
  // Utilize Node.js 'fs' module to synchronously read the entire content
  // of '/dev/stdin' (standard input) as a UTF-8 encoded string.
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

  // Invoke our primary processing function with the data read from stdin.
  evaluateThresholdCondition(fileContent);
} catch (inputReadError) {
  // If any error occurs during the file reading process (e.g., file not found,
  // permission issues, or other I/O errors), catch it here.
  console.error("An unrecoverable error occurred while attempting to read input:", inputReadError.message);
  // As a fallback, output "NO" to ensure some result is always printed.
  console.log("NO");
}