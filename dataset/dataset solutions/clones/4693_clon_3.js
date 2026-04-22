'use strict';

/**
 * Orchestrates the computation of a factorial for a given input number,
 * applying a specific modulus to keep the result within numerical bounds.
 *
 * This function processes a raw string input, validates it, and then iteratively
 * calculates the factorial of the parsed number, performing a modulo operation
 * at each multiplication step to manage the size of intermediate results.
 *
 * @param {string} rawInputPayload - The raw string data received, which is expected
 *   to represent a non-negative integer.
 */
const processFactorialCalculation = (rawInputPayload) => {
  // Define a constant for the modulus value. This specific prime number
  // (10^9 + 7) is frequently used in competitive programming to prevent
  // integer overflow for large calculations and ensure results fit standard
  // integer types.
  const MODULUS_VALUE = 1_000_000_000 + 7; // Using numeric separators for readability

  // Attempt to convert the raw string input into an integer.
  // The .trim() method removes leading/trailing whitespace, including newlines,
  // which is crucial for robust parsing from file inputs.
  // An explicit radix of 10 is provided to ensure decimal interpretation.
  const limitNumber = Number.parseInt(rawInputPayload.trim(), 10);

  // Implement a guard clause to validate the parsed numerical input.
  // If the parsing results in NaN (Not-a-Number) or if the number is negative,
  // it indicates an invalid input scenario. An error message is logged,
  // and the function terminates early to prevent erroneous calculations.
  if (Number.isNaN(limitNumber) || limitNumber < 0) {
    console.error('Error: The provided input is invalid. Please ensure it is a non-negative integer.');
    return; // Exit the function to prevent further processing with bad data.
  }

  // Initialize an accumulator variable to store the running product.
  // Starting with 1 correctly handles the factorial of 0 (0! = 1).
  let accumulatedProduct = 1;

  // Initialize a counter variable for the iterative process.
  // This will serve as the multiplier in each step of the factorial calculation.
  let currentMultiplier = 1;

  // Utilize a 'while' loop for the factorial calculation, offering an alternative
  // control flow structure compared to a traditional 'for' loop.
  // The loop continues as long as the current multiplier does not exceed the limit number.
  while (currentMultiplier <= limitNumber) {
    // Perform the multiplication and immediately apply the modulo operation.
    // This strategy is vital for keeping intermediate products within the manageable
    // range of standard JavaScript numbers and preventing potential overflow issues
    // before the final modulo.
    accumulatedProduct = (accumulatedProduct * currentMultiplier) % MODULUS_VALUE;

    // Increment the current multiplier for the subsequent iteration.
    // Using explicit addition for clarity, rather than the shorthand '++' operator.
    currentMultiplier = currentMultiplier + 1;
  }

  // Assign the final computed value to a distinct variable before displaying it.
  // This intermediate step can be useful for debugging or further processing
  // before the ultimate output.
  const finalComputedResult = accumulatedProduct;

  // Output the final computed factorial value (modulo MODULUS_VALUE) to the console.
  console.log(finalComputedResult);
};

// --- Application Entry Point & Input Handling ---

// Define the canonical path for reading standard input in a Unix-like environment.
const standardInputSourcePath = '/dev/stdin';

// Obtain a reference to the Node.js file system module.
// This allows for file operations like reading content.
const fsModuleHandle = require('fs');

// Read the entire content of the standard input file synchronously.
// The 'utf8' encoding ensures the data is interpreted as a string of Unicode characters.
// The .trim() method is applied here as well to clean up any extraneous whitespace
// or newlines that might be present at the beginning or end of the file content.
const fileContentFromStdin = fsModuleHandle.readFileSync(standardInputSourcePath, { encoding: 'utf8' }).trim();

// Invoke the primary processing function with the data obtained from standard input.
// This initiates the factorial calculation and subsequent output.
processFactorialCalculation(fileContentFromStdin);