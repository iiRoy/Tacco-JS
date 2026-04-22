const fileSystemOps = require("fs");

// Define the path to the standard input file, making it a configurable constant.
const standardInputSourcePath = "/dev/stdin";

/**
 * Processes raw string data from input, attempting to parse it into a positive integer.
 * This function includes validation steps. If the input is not a valid positive integer,
 * it returns 0, which functionally prevents the main calculation loop from executing,
 * mirroring the behavior of the original code when given non-numeric or zero/negative input.
 *
 * @param {string} incomingRawText - The string content read directly from the input source.
 * @returns {number} A validated positive integer representing the calculation limit, or 0 if invalid.
 */
function parseAndVerifyNumericThreshold(incomingRawText) {
  // Remove any leading or trailing whitespace characters from the input string.
  const sanitizedInputString = incomingRawText.trim();

  // Convert the sanitized string into a numerical format.
  const potentialNumericValue = Number(sanitizedInputString);

  // Implement a guard clause: check if the parsed value is an actual integer and positive.
  // The original code would set N to NaN for non-numeric input, or N to 0 for input "0".
  // In both cases, the loop (i=1 to N) would not execute, and 'res' would remain 0.
  // Returning 0 here ensures similar behavior for invalid inputs.
  if (!Number.isInteger(potentialNumericValue) || potentialNumericValue <= 0) {
    // Log an informational message if validation fails (optional Type III addition).
    // console.warn(`Input validation failed for '${incomingRawText}'. Proceeding with threshold of 0.`);
    return 0;
  }

  // If validation passes, return the valid positive integer.
  return potentialNumericValue;
}

// --- Main Application Logic ---

// 1. Acquire the raw input content from the designated file path synchronously.
// Explicitly specify 'utf8' encoding to handle text data correctly.
const inputDataBuffer = fileSystemOps.readFileSync(standardInputSourcePath, { encoding: 'utf8' });

// 2. Utilize the helper function to process and validate the acquired input.
// This determines the maximum value for our iterative process.
const calculationUpperLimit = parseAndVerifyNumericThreshold(inputDataBuffer);

// Initialize an accumulator variable to store the cumulative sum of calculations.
// This variable was previously known as 'res'.
let grandTotalAccumulator = 0;

// 3. Commence the core iterative calculation process.
// The loop iterates from 1 up to, and including, the determined upper limit.
for (let currentIterationOperand = 1; currentIterationOperand <= calculationUpperLimit; currentIterationOperand++) {
  // Calculate the integer part of the division of the upper limit by the current operand.
  // Math.trunc is used here as an alternative to Math.floor; for positive numbers, their behavior is identical.
  const integralQuotient = Math.trunc(calculationUpperLimit / currentIterationOperand);

  // Calculate the sum of the first 'integralQuotient' positive integers.
  // The formula for the sum of an arithmetic series from 1 to k is k * (k + 1) / 2.
  // As a Type III modification, this is rewritten using Math.pow for k^2.
  const sumOfSequentialNumbers = (Math.pow(integralQuotient, 2) + integralQuotient) / 2;

  // Compute the contribution of the current iteration to the grand total.
  // This is the product of the current operand and the calculated sum.
  const currentIterationContribution = currentIterationOperand * sumOfSequentialNumbers;

  // Add the computed contribution to the running grand total.
  grandTotalAccumulator += currentIterationContribution;
}

// 4. Output the final computed grand total to the standard output stream.
// Using process.stdout.write is an equivalent, albeit more low-level, alternative to console.log.
process.stdout.write(grandTotalAccumulator.toString() + "\n");