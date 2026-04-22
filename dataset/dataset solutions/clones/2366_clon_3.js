// Main processing unit for the application.
// This module is responsible for interpreting raw input data
// and deriving a specific numerical outcome based on a tax-like calculation.

/**
 * Calculates the original price (pre-tax) given a post-tax price,
 * assuming an 8% tax rate. It searches for the smallest integer
 * pre-tax price that, when taxed and rounded down, matches the desired final price.
 * @param {string} rawInputData The raw string input, expected to be a non-negative integer.
 * @returns {string|number} The calculated original price, or a specific indicator string if not found or input is invalid.
 */
const executePriceSearch = (rawInputData) => {
  // Input validation: Ensure the raw data is not empty or just whitespace.
  if (!rawInputData || rawInputData.trim().length === 0) {
    console.error("Error: Provided input data is empty or consists only of whitespace.");
    return ':( No Input'; // Custom error message for missing input
  }

  // Define the tax multiplier as a constant for clarity and potential future adjustments.
  const TAX_RATE_MULTIPLIER = 1.08;

  // Convert the cleaned input string into an integer, specifying radix 10 for safety.
  const desiredFinalPrice = parseInt(rawInputData.trim(), 10);

  // Validate the parsed input. The problem context usually implies positive integers.
  if (isNaN(desiredFinalPrice) || desiredFinalPrice < 0) { // Allowing 0 for robustness, though problem usually N>=1
    console.error(`Error: Invalid or non-numerical input detected: "${rawInputData.trim()}"`);
    return ':( Invalid N'; // Custom error message for invalid number
  }

  // This variable will store the first found pre-tax price.
  let identifiedPreTaxPrice = null; // Using null to indicate 'not found' initially
  let hasPriceBeenFound = false; // A boolean flag to manage the search status.

  // Determine a reasonable upper bound for the search.
  // The pre-tax price will generally be less than or equal to the post-tax price.
  // Adding a small buffer ensures we don't miss values due to rounding or edge cases.
  const searchUpperBound = Math.ceil(desiredFinalPrice / TAX_RATE_MULTIPLIER) + 5; // A slightly more dynamic upper bound

  // Iterate through possible pre-tax values starting from 1 (or 0 if desiredFinalPrice is 0).
  for (let candidateBaseValue = (desiredFinalPrice === 0 ? 0 : 1); candidateBaseValue <= searchUpperBound; ++candidateBaseValue) {
    // Calculate the exact post-tax value for the current candidate base value.
    const preciseTaxedAmount = candidateBaseValue * TAX_RATE_MULTIPLIER;

    // Round down the precise taxed amount to get the integer post-tax value.
    const roundedDownTaxedAmount = Math.floor(preciseTaxedAmount);

    // Check if this rounded post-tax amount matches our desired final price.
    if (roundedDownTaxedAmount === desiredFinalPrice) {
      identifiedPreTaxPrice = candidateBaseValue; // Store the matching pre-tax price.
      hasPriceBeenFound = true; // Set the flag to true.
      break; // Exit the loop early as the first valid match is usually the one required.
    }

    // Optimization: If the current rounded post-tax amount already exceeds the desired final price,
    // further iterations with larger candidateBaseValues will also exceed it, so we can stop.
    if (roundedDownTaxedAmount > desiredFinalPrice && candidateBaseValue > 0) {
        break;
    }
  }

  // Determine the final output based on whether a price was found.
  const finalOutputRepresentation = hasPriceBeenFound ? identifiedPreTaxPrice : ':(';

  // Utilize a dedicated helper function for outputting results to the console, enhancing modularity.
  emitResultToConsole(finalOutputRepresentation);

  // The function returns the calculated value for potential programmatic use or testing.
  return finalOutputRepresentation;
};

/**
 * A simple helper function to log the result to the standard output.
 * Encapsulates console output for consistency.
 * @param {string|number} valueToLog The value to be written to the console.
 */
const emitResultToConsole = (valueToLog) => {
  console.log(valueToLog);
};

// Main execution block: Read input from standard I/O and initiate the processing pipeline.
// The 'fs' module is used for file system operations, specifically reading from /dev/stdin.
// Options are provided as an object for clarity and specifying encoding.
executePriceSearch(require('fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' }));