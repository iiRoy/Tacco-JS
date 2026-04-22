/**
 * This module provides a function to calculate a specific sum based on numerical input.
 * It identifies numbers within a given range that are not multiples of 3 or 5
 * and sums them up, mimicking a classic FizzBuzz-like problem variant.
 */

/**
 * Reads input from the standard input stream, typically `/dev/stdin` in competitive programming environments.
 * This function encapsulates the file system interaction.
 *
 * @returns {string} The raw string content read from standard input. Returns a default string "100"
 *                   if reading fails, allowing for local testing or graceful degradation.
 */
function obtainInputFromEnvironment() {
  try {
    // Attempt to access the Node.js 'fs' (file system) module.
    // This is a common pattern for reading input in online judges.
    const fileSystemModule = require("fs");
    // Synchronously read the entire content of /dev/stdin as a UTF-8 string.
    return fileSystemModule.readFileSync("/dev/stdin", "utf8");
  } catch (errorDetails) {
    // In case of an error (e.g., 'fs' module not found, or /dev/stdin not accessible),
    // log a diagnostic message and provide a fallback value.
    console.error("Input reading failed. Defaulting to '100' for computation. Error:", errorDetails.message);
    return "100"; // A reasonable default for demonstration or local testing.
  }
}

/**
 * Calculates the sum of all positive integers up to a specified upper bound (inclusive)
 * that are NOT divisible by 3 AND NOT divisible by 5.
 *
 * @param {string} rawInputData - The raw string input, expected to be convertible to a positive integer.
 * @returns {number} The computed sum, or 0 if the input is invalid or non-positive.
 */
function computeFilteredTotal(rawInputData) {
  // First, parse the raw string input into an integer.
  // Using parseInt with radix 10 ensures proper decimal conversion.
  let maximumValue = parseInt(rawInputData, 10);

  // --- Type III: Add a robust input validation guard clause ---
  // Check if the parsed value is a valid positive number.
  // If it's not a number (NaN) or if it's zero or negative,
  // we'll treat it as an invalid input.
  if (isNaN(maximumValue) || maximumValue <= 0) {
    console.error("Invalid numeric boundary supplied. Please provide a positive integer value.");
    // Return 0 as the sum for invalid input, preventing further computation errors.
    return 0;
  }

  // Initialize the variable that will accumulate the sum of eligible numbers.
  // This is our primary result storage.
  let accumulatedSum = 0;

  // Initialize the loop counter. The problem typically starts counting from 1.
  let currentNumber = 1;

  // --- Type II & III: Change loop control structure from 'for' to 'while' ---
  // The loop continues as long as currentNumber is within the specified range (1 to maximumValue).
  while (currentNumber <= maximumValue) {
    // --- Type III: Introduce intermediate variables for clarity in conditional logic ---
    const isMultipleOfThree = (currentNumber % 3 === 0);
    const isMultipleOfFive = (currentNumber % 5 === 0);

    // --- Type II & III: Rewrite the conditional statement ---
    // The original condition was `(i % 3 !== 0) && (i % 5 !== 0)`.
    // This is logically equivalent to checking if it's NOT a multiple of 3 AND NOT a multiple of 5.
    // We can express this using the boolean flags we just created.
    if (!isMultipleOfThree && !isMultipleOfFive) {
      // If the current number satisfies the criteria (not divisible by 3 and not by 5),
      // add it to our running total.
      // --- Type II: Rewrite the sum assignment operation explicitly ---
      accumulatedSum = accumulatedSum + currentNumber;
    }

    // Increment the counter to process the next number in the sequence.
    currentNumber++;
  }

  // --- Type II & III: Modify the output format ---
  // Output the final result with a descriptive message.
  console.log(`The computed total for numbers up to ${maximumValue} (excluding multiples of three or five) equals: ${accumulatedSum}`);

  // Return the final sum. This makes the function more reusable if its result
  // is needed by other parts of an application.
  return accumulatedSum;
}

// --- Type II: Rename the main execution block's variable ---
// Fetch the input string from the environment using our helper function.
const receivedInputLine = obtainInputFromEnvironment();

// Execute the core logic function with the obtained input.
// The function handles its own output and validation.
computeFilteredTotal(receivedInputLine);