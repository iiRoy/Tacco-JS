// This module defines a function to process numerical input,
// applying a series of weighted divisions to calculate a final score.

/**
 * Computes a specialized weighted sum by iteratively dividing a numerical input.
 * The division process involves calculating a quotient and a remainder,
 * with the quotient being added to an accumulator based on specific weighting rules.
 *
 * @param {string} rawInputPayload - The initial input string, expected to be a number.
 *                                   It will be parsed into an integer.
 * @returns {void} This function logs the final computed score to the console
 *                 or an error message if the input is invalid.
 */
const calculateWeightedSum = (rawInputPayload) => {
  // Step 1: Input Validation and Type Conversion
  // Parse the raw input string into an integer.
  // Using `parseInt` with radix 10 ensures correct decimal conversion.
  const initialNumericValue = parseInt(rawInputPayload, 10);

  // Implement a guard clause to handle invalid or negative numerical inputs.
  // If the input cannot be converted to a valid non-negative number,
  // an error message is displayed, and the function terminates early.
  if (isNaN(initialNumericValue) || initialNumericValue < 0) {
    console.error("Input Error: The provided payload is not a valid non-negative integer.");
    console.error(`Received: '${rawInputPayload}'. Please check your input data.`);
    return; // Exit the function to prevent further processing with bad data.
  }

  // Step 2: Variable Initialization
  // Initialize the primary variable that will accumulate the final score.
  // This variable will store the sum of weighted quotients.
  let accumulatedScore = 0;

  // Initialize the variable that tracks the remaining amount after each division.
  // It starts with the validated numeric input and is updated with the modulo result.
  let currentRemainingAmount = initialNumericValue;

  // Step 3: Iterative Calculation Loop
  // The algorithm uses a descending loop, with the loop variable acting as the divisor.
  // The loop starts from 11 and proceeds downwards to 1, inclusive.
  for (let currentDivisor = 11; currentDivisor >= 1; currentDivisor--) {
    // Intermediate step: Calculate the integer quotient for the current division.
    // Math.floor ensures that we only consider the whole number part of the division.
    const integerQuotient = Math.floor(currentRemainingAmount / currentDivisor);

    // Determine the weighting multiplier based on the current divisor's value.
    // If the divisor is greater than 6, a multiplier of 2 is applied.
    // Otherwise (if 6 or less), a multiplier of 1 is used.
    const weightingFactor = (currentDivisor > 6) ? 2 : 1;

    // Update the accumulated score by adding the product of the integer quotient
    // and the determined weighting factor.
    // This is an expanded form of `accumulatedScore += (integerQuotient * weightingFactor);`
    accumulatedScore = accumulatedScore + (integerQuotient * weightingFactor);

    // Update the `currentRemainingAmount` using the modulo operator.
    // This calculates the remainder of the division, which becomes the input
    // for the next iteration's division.
    // This is an equivalent operation to `currentRemainingAmount = currentRemainingAmount % currentDivisor;`
    currentRemainingAmount %= currentDivisor;

    // Optional: Add a debug log to observe the state of variables during each iteration.
    // This fragment helps in tracing the execution flow and values.
    // console.log(`[DEBUG] Divisor: ${currentDivisor}, Quotient: ${integerQuotient}, Weight: ${weightingFactor}, Added: ${integerQuotient * weightingFactor}, Current Score: ${accumulatedScore}, Remaining: ${currentRemainingAmount}`);
  }

  // Step 4: Output the Final Result
  // Display the total accumulated score in a clear, descriptive format.
  console.log(`The final calculated weighted sum is: ${accumulatedScore}`);
};

// --- Execution Entry Point ---
// This block handles reading input from the standard input stream
// and invoking the main calculation function.
try {
  // Require the 'fs' (file system) module to read input.
  // Read the content of '/dev/stdin' synchronously.
  // The 'UTF-8' encoding is specified to handle text input correctly.
  const systemRawInput = require('fs').readFileSync('/dev/stdin', 'UTF-8');

  // Call the primary function, ensuring any leading/trailing whitespace
  // is removed from the input string before processing.
  calculateWeightedSum(systemRawInput.trim());
} catch (executionError) {
  // Catch and log any errors that occur during the input reading or initial processing.
  console.error("An unhandled error occurred during program execution:", executionError.message);
  // Optionally, provide more details about the error.
  // console.error(executionError.stack);
}