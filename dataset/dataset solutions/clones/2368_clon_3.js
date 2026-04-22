// This module provides a utility function to calculate a base amount (price before tax)
// given a final price that includes an 8% tax, where the tax calculation is truncated.
// The function iterates through possible base amounts to find one that, when multiplied
// by 1.08 and then truncated to an integer, equals the provided target amount.

function processCalculationRequest(dataLines) {
  // Define constants for important magic numbers and string literals for better readability
  // and easier maintenance.
  const TAX_MULTIPLIER = 1.08;
  const NO_MATCH_INDICATOR = ":("; // This string indicates that no valid base amount was found.

  // --- Input Validation Phase ---
  // Ensure the input `dataLines` is a valid array and contains at least one element.
  if (!Array.isArray(dataLines) || dataLines.length === 0) {
    console.error("Error: Input data is malformed or empty. Expected an array with at least one line.");
    return NO_MATCH_INDICATOR; // Return the default 'no match' indicator for invalid input.
  }

  // Parse the first line of the input array to extract the desired target amount.
  // Using `Number.parseInt` with radix 10 ensures explicit base conversion and handles
  // potential non-numeric characters more robustly than implicit coercion.
  let desiredAmount = Number.parseInt(dataLines[0], 10);

  // Validate the parsed target amount: it must be a valid, positive number.
  if (Number.isNaN(desiredAmount) || desiredAmount <= 0) {
    console.error(`Error: The provided target amount '${dataLines[0]}' is invalid. It must be a positive integer.`);
    return NO_MATCH_INDICATOR; // Return 'no match' for invalid numeric input.
  }

  // Initialize a variable to store the found candidate. It defaults to the 'no match' indicator.
  let foundCandidate = NO_MATCH_INDICATOR;
  // A boolean flag to explicitly track if a match has been successfully identified during iteration.
  let matchIdentified = false;

  // --- Iteration and Calculation Phase ---
  // Determine an appropriate upper bound for the iteration loop.
  // The candidate base number 'currentCheckNumber' must be approximately 'desiredAmount / TAX_MULTIPLIER'.
  // We add a small buffer (e.g., +2) to `Math.floor(desiredAmount / TAX_MULTIPLIER)`
  // to ensure that all potential candidates are checked, accounting for truncation effects
  // and to provide a slightly different loop boundary from the original `i < n`.
  const maxCheckLimit = Math.floor(desiredAmount / TAX_MULTIPLIER) + 2;


  // Loop through potential base numbers, starting from 1.
  // We iterate up to `maxCheckLimit` because a base number larger than this
  // would, after multiplication and truncation, almost certainly exceed `desiredAmount`.
  for (let currentCheckNumber = 1; currentCheckNumber <= maxCheckLimit; ++currentCheckNumber) {
    // Calculate the value of the current candidate number after applying the tax multiplier.
    let computedValueWithTax = currentCheckNumber * TAX_MULTIPLIER;

    // Truncate the fractional part of the computed value to get an integer.
    // This simulates the specific rounding behavior described in the problem.
    let truncatedValue = Math.trunc(computedValueWithTax);

    // Check if the truncated value exactly matches the desired target amount.
    if (truncatedValue === desiredAmount) {
      foundCandidate = currentCheckNumber; // If a match is found, store this candidate.
      matchIdentified = true;              // Set the flag to true.
      break;                               // Exit the loop immediately as the first match is sufficient.
    }
  }

  // Return the final result: either the found base amount or the 'no match' indicator.
  return foundCandidate;
}

// --- Main Execution Block ---
// This block handles reading input from standard input, processing it, and outputting the result.
try {
  // Read the entire content of standard input as a UTF-8 string.
  const inputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Split the input string into an array of lines.
  const inputLines = inputBuffer.split("\n");

  // Call the primary processing function with the gathered input lines.
  const finalResult = processCalculationRequest(inputLines);

  // Output the computed result to the console.
  console.log(finalResult);
} catch (error) {
  // Catch and report any errors that occur during file reading or initial processing.
  console.error("An unhandled error occurred during input processing or file I/O:", error.message);
  // As a fallback, print the 'no match' indicator if an unexpected error prevents normal execution.
  console.log(":(");
}