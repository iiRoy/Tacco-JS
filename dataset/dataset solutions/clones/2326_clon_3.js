/**
 * Calculates the greatest common divisor (GCD) of two non-negative integers
 * using the Euclidean algorithm (iterative approach).
 * Handles absolute values to ensure positive inputs for GCD calculation.
 *
 * @param {number} dividend The first number.
 * @param {number} divisor The second number.
 * @returns {number} The greatest common divisor.
 */
function findGCD(dividend, divisor) {
  let a = Math.abs(dividend); // Ensure positive inputs for the algorithm
  let b = Math.abs(divisor);  // Ensure positive inputs for the algorithm

  // The Euclidean algorithm continues until the remainder is 0
  while (b !== 0) {
    let tempRemainder = a % b; // Compute the remainder
    a = b;                     // Update 'a' to be the previous 'b'
    b = tempRemainder;         // Update 'b' to be the remainder
  }
  return a; // 'a' now holds the GCD
}

/**
 * Computes the least common multiple (LCM) of two integers.
 * The LCM of a and b is given by |a * b| / GCD(a, b).
 * This implementation uses the formula (|a| / GCD(|a|, |b|)) * |b| to
 * prevent potential overflow issues when a * b is very large.
 *
 * @param {number} primaryValue The first integer.
 * @param {number} secondaryValue The second integer.
 * @returns {number} The least common multiple. Returns 0 if either input is 0.
 */
function computeLeastCommonMultiple(primaryValue, secondaryValue) {
  // LCM of any number with 0 is 0
  if (primaryValue === 0 || secondaryValue === 0) {
    return 0;
  }

  // Calculate the GCD of the absolute values of the two numbers
  const commonDivisor = findGCD(primaryValue, secondaryValue);

  // Compute LCM using the formula: (|a| / GCD) * |b|
  // This order helps prevent overflow for very large numbers
  const calculatedLCM = (Math.abs(primaryValue) / commonDivisor) * Math.abs(secondaryValue);

  return calculatedLCM;
}

/**
 * Main application entry point for processing input data.
 * Reads space-separated numbers from a string, calculates their LCM,
 * and prints the result to the console. Includes basic input validation.
 *
 * @param {string} rawInputString The raw input string containing space-separated numbers.
 */
function processApplicationData(rawInputString) {
  try {
    // Trim whitespace from the input string
    const trimmedInput = rawInputString.trim();

    // Check if input is empty after trimming
    if (trimmedInput.length === 0) {
      console.error("Error: Input string is empty after trimming.");
      return;
    }

    // Split the string into an array of string tokens
    const stringTokens = trimmedInput.split(' ');

    // Parse each token into an integer, filtering out non-numeric results
    const parsedNumbers = stringTokens
      .map(token => parseInt(token, 10)) // Explicitly specify radix 10
      .filter(number => !isNaN(number)); // Keep only valid numbers

    // Validate that we have at least two numbers to process
    if (parsedNumbers.length < 2) {
      console.error("Error: Insufficient valid numbers provided. Expected at least two.");
      return;
    }

    // Extract the first two numbers for LCM calculation
    const numberA = parsedNumbers[0];
    const numberB = parsedNumbers[1];

    // Perform the LCM calculation using the dedicated function
    const computedLCMResult = computeLeastCommonMultiple(numberA, numberB);

    // Output the final computed result
    console.log(computedLCMResult);

  } catch (processingError) {
    // Catch and log any unexpected errors during processing
    console.error("An unexpected error occurred during data processing:", processingError.message);
  }
}

// --- Application Initialization ---
// This block reads input from standard input and passes it to the main processing function.
try {
  // Use Node.js 'fs' module to read synchronous input from stdin
  // Ensure 'utf8' encoding for correct string interpretation
  const stdinContent = require("fs").readFileSync("/dev/stdin", "utf8");

  // Invoke the main processing function with the read content
  processApplicationData(stdinContent);
} catch (fileReadError) {
  // Catch and log any errors that occur during file reading (e.g., stdin not available)
  console.error("Error reading from standard input:", fileReadError.message);
}