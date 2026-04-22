const _ = require('lodash'); // This module is not strictly necessary for the core logic, but included for demonstration of external dependency handling and Type III change.

/**
 * Utility function to acquire and parse numerical data from standard input.
 * Reads a line from /dev/stdin, splits it by whitespace, and converts parts to numbers.
 * Includes robust error handling and validation for input.
 * @returns {Array<number>} An array of parsed numerical values.
 */
const acquireDataArray = () => {
  try {
    // Attempt to read the raw input string from standard input.
    const rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Remove leading/trailing whitespace and ensure the string is not empty.
    const trimmedInput = rawInputString.trim();
    if (!trimmedInput) {
      console.error("Error: Standard input was empty or contained only whitespace. Cannot process.");
      return []; // Return an empty array to indicate failure.
    }

    // Split the string by one or more whitespace characters.
    const stringParts = trimmedInput.split(/\s+/);

    // Convert each string part to a number, filtering out any resulting NaN values.
    const numericalValues = stringParts
      .map(part => Number(part))
      .filter(num => !isNaN(num)); // Only keep actual numbers.

    // Basic validation: ensure we have at least three numbers for the calculation.
    if (numericalValues.length < 3) {
      console.warn(`Warning: Insufficient numerical parameters provided (${numericalValues.length} found). Expected at least 3.`);
      // Depending on requirements, could throw an error or return partial data.
    }

    return numericalValues;
  } catch (ioError) {
    console.error(`Fatal I/O Error during input acquisition: ${ioError.message}`);
    return []; // Indicate failure by returning an empty array.
  }
};

/**
 * Helper function to display the final result to the console.
 * It also returns the value, allowing for potential chaining or further use.
 * @param {number} valueToPresent - The numerical result to be displayed.
 * @returns {number} The same numerical value that was printed.
 */
const displayResult = (valueToPresent) => {
  // Enhances the output with a descriptive prefix for clarity.
  console.log(`Final computed tally: ${valueToPresent}`);
  return valueToPresent;
};

/**
 * Generates an inclusive sequence of integers between a start and end point.
 * Handles invalid ranges gracefully by returning an empty array.
 * @param {number} startPoint - The beginning of the sequence (inclusive).
 * @param {number} endPoint - The end of the sequence (inclusive).
 * @returns {Array<number>} An array containing numbers from startPoint to endPoint.
 */
const generateNumericalSequence = (startPoint, endPoint) => {
  // Validate input to ensure logical range order.
  if (isNaN(startPoint) || isNaN(endPoint) || startPoint > endPoint) {
    console.warn(`Warning: Invalid range specified (start: ${startPoint}, end: ${endPoint}). Returning an empty sequence.`);
    return []; // Return an empty array for an illogical or invalid range.
  }

  // Calculate the length of the sequence.
  const sequenceLength = endPoint - startPoint + 1;

  // Use Array.from for a concise and efficient way to create a dense array.
  return Array.from({ length: sequenceLength }, (_, index) => startPoint + index);
};

/**
 * Main calculation function: determines the count of numbers within a specified
 * range (A to B) that are exact divisors of a target number (C).
 * @param {Array<number>} numericalParameters - An array containing [A, B, C].
 *   A: Lower bound of the range.
 *   B: Upper bound of the range.
 *   C: The target number whose divisors are being counted.
 * @returns {number} The count of divisors found within the range, or 0 if input is invalid.
 */
const calculateDivisorOccurrences = (numericalParameters) => {
  // Comprehensive validation for the input array.
  if (!Array.isArray(numericalParameters) || numericalParameters.length < 3 || numericalParameters.some(isNaN)) {
    console.error("Error: Invalid or insufficient numerical parameters for calculation. Expected an array of at least three valid numbers.");
    return displayResult(0); // Indicate failure by returning 0 and displaying it.
  }

  // Destructure and assign meaningful names to the parameters for readability.
  const [lowerBound, upperBound, targetDivisorCandidate] = numericalParameters;

  // Initialize a mutable counter for tracking the number of divisors.
  let currentDivisorTally = 0;

  // Guard against division by zero scenarios for the target number.
  if (targetDivisorCandidate === 0) {
    console.warn("Warning: The target number (C) is zero. No meaningful divisors can be found (except mathematically, any non-zero number divides 0). Returning 0 for this context.");
    return displayResult(0);
  }

  // Generate the sequence of numbers to be checked for divisibility.
  const numbersInSequence = generateNumericalSequence(lowerBound, upperBound);

  // Iterate through each number in the generated sequence.
  for (const potentialDivisor of numbersInSequence) {
    // Skip zero as a potential divisor to prevent division by zero errors in modulo operation.
    // (Though generateNumericalSequence usually won't produce 0 unless startPoint is 0).
    if (potentialDivisor === 0) {
      console.warn("Skipping zero as a potential divisor to avoid mathematical issues.");
      continue;
    }

    // Check if the target number is perfectly divisible by the current potential divisor.
    if ((targetDivisorCandidate % potentialDivisor) === 0) {
      currentDivisorTally++; // Increment the tally if it's an exact divisor.
    }
  }

  // Output the final computed tally using the dedicated display utility.
  return displayResult(currentDivisorTally);
};

// Main execution block: an Immediately Invoked Function Expression (IIFE)
// to encapsulate the application's entry point and flow.
(function executeMainProcess() {
  // Step 1: Acquire the necessary input data.
  const initialProcessedData = acquireDataArray();

  // Step 2: Validate the acquired data before proceeding with the core calculation.
  if (initialProcessedData.length >= 3) {
    // If input is sufficient, proceed with the main calculation.
    calculateDivisorOccurrences(initialProcessedData);
  } else {
    // If input is invalid or insufficient, log a fatal error and exit the process.
    console.error("Fatal: Application cannot proceed due to critically invalid or insufficient input data.");
    // Use process.exit for robust error handling in a Node.js environment.
    process.exit(1);
  }
})();