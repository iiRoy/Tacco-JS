'use strict';

/**
 * Orchestrates the processing of input data and computes a specific numeric result.
 * This function handles parsing, validation, calculation, and output display.
 * @param {string} rawInputData The raw string input, expected to contain two space-separated numeric values.
 */
function executeCalculation(rawInputData) {
  // Defensive programming: Validate the initial input string to ensure it's a non-empty string.
  if (typeof rawInputData !== 'string' || rawInputData.length === 0) {
    console.error("Operation Aborted: Provided input data is either invalid (not a string) or empty.");
    return; // Terminate execution if input quality is insufficient.
  }

  // Step 1: Pre-process the input string.
  // Removing leading/trailing whitespace ensures consistent behavior when splitting.
  const cleanedInputString = rawInputData.trim();

  // Step 2: Deconstruct the cleaned string into an array of string components.
  // The expectation is that numbers are separated by a single space.
  const stringTokens = cleanedInputString.split(' ');

  // Step 3: Crucial validation – ensure we have enough components for our arithmetic.
  // We require at least two distinct numeric parts.
  if (stringTokens.length < 2) {
    console.error("Operation Aborted: Insufficient numeric components detected in the input. Expected a minimum of two.");
    return; // Exit if the input structure is incomplete.
  }

  // Step 4: Convert the first two string tokens into their integer representations.
  // Using parseInt with a radix (base 10) for explicit and robust conversion.
  const firstNumericOperand = parseInt(stringTokens[0], 10);
  const secondNumericFactor = parseInt(stringTokens[1], 10);

  // Step 5: Post-parsing validation to confirm successful numeric conversion.
  // Check if either of the parsed values resulted in 'Not a Number'.
  if (isNaN(firstNumericOperand) || isNaN(secondNumericFactor)) {
    console.error("Operation Aborted: Failed to transform one or both input components into valid integer numbers.");
    return; // Halt if parsing failed for any operand.
  }

  // Step 6: Perform the core arithmetic operations.
  // First, calculate the value for the divisor.
  const computedDivisor = secondNumericFactor * 2;

  // Critical guard: Prevent division by zero, which would lead to an infinite result.
  if (computedDivisor === 0) {
    console.error("Operation Aborted: Division by zero encountered. The second numeric factor, when doubled, resulted in zero.");
    return; // Prevent mathematical error.
  }

  // Execute the primary division.
  const rawDivisionResult = firstNumericOperand / computedDivisor;

  // Apply the ceiling function to round the division result upwards to the nearest integer.
  const finalCalculatedCeiling = Math.ceil(rawDivisionResult);

  // Step 7: Present the final computed result.
  // A dedicated helper function for output provides flexibility for future logging changes.
  function outputFinalResult(outcomeValue) {
    console.log(outcomeValue);
  }

  outputFinalResult(finalCalculatedCeiling);
}

// The script's primary execution block.
// It reads input from the standard input stream, typically used in competitive programming or Unix-like environments.
try {
  const systemStandardInput = require("fs").readFileSync("/dev/stdin", "utf8");
  executeCalculation(systemStandardInput);
} catch (ioError) {
  // Catch and report any errors that occur during file reading or initial execution.
  console.error(`An unforeseen error occurred during input acquisition or program execution: ${ioError.message}`);
}