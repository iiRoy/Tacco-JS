/*
 * This module provides functionality to analyze a positive integer
 * and determine the smallest possible maximum number of digits
 * found within any pair of its factors.
 * For example, if the number is 100, its factor pairs are:
 * (1, 100) -> max digits = max(1, 3) = 3
 * (2, 50)  -> max digits = max(1, 2) = 2
 * (4, 25)  -> max digits = max(1, 2) = 2
 * (5, 20)  -> max digits = max(1, 2) = 2
 * (10, 10) -> max digits = max(2, 2) = 2
 * The minimum of these maximums is 2.
 */

/**
 * Calculates the number of decimal digits in a given numerical value.
 * This helper function treats the absolute value of the number for digit counting.
 *
 * @param {number} numericVal The number whose digit count is to be determined.
 * @returns {number} The count of digits in the number. Returns 1 for 0, and 0 for non-finite numbers.
 */
function determineDigitCount(numericVal) {
  // Input validation: Ensure a valid finite number is provided.
  if (typeof numericVal !== 'number' || !Number.isFinite(numericVal)) {
    // Returning 0 for invalid inputs, as they don't have a meaningful digit count in this context.
    return 0;
  }

  // Special case for zero, which conventionally has one digit.
  if (numericVal === 0) {
    return 1;
  }

  // Convert the absolute value of the number to a string and get its length.
  // This correctly handles negative numbers by counting digits of their positive counterpart.
  return String(Math.abs(numericVal)).length;
}

/**
 * Processes a string representation of a positive integer to find the
 * minimum of the maximum digit counts among its factor pairs.
 *
 * @param {string} incomingTextualValue The input string representing a positive integer.
 * @returns {number} The calculated minimum maximum digit count, or a default value (e.g., 0 or 1)
 *                   for invalid or edge-case inputs as per problem constraints.
 */
function analyzeIntegerFactorsForMinMaxDigits(incomingTextualValue) {
  // Pre-processing and validation of the raw string input.
  if (typeof incomingTextualValue !== 'string' || incomingTextualValue.trim() === '') {
    // If the input is not a string or is empty/whitespace, return 0 or throw an error.
    // For this problem, we'll assume valid numeric string input based on typical competitive programming scenarios.
    return 0;
  }

  // Convert the trimmed string input into an integer. The radix 10 is specified for safety.
  const parsedNumericEntity = Number.parseInt(incomingTextualValue.trim(), 10);

  // Further validation for the parsed numerical entity.
  // The problem typically deals with positive integers.
  if (Number.isNaN(parsedNumericEntity) || parsedNumericEntity <= 0) {
    // For non-positive or invalid numbers, the factor logic is not applicable as intended.
    // For the number 1, its only factor pair is (1,1), max digits is 1.
    return parsedNumericEntity === 1 ? 1 : 0; // Return 1 for 1, 0 for others like 0 or negative.
  }

  // Initialize a variable to keep track of the smallest maximum digit count found so far.
  // The digit count of the number itself (as a factor with 1) serves as an initial upper bound.
  let currentMinimumMaxFactorDigits = determineDigitCount(parsedNumericEntity);

  // Calculate the square root of the number once to optimize the loop condition.
  // Factors always come in pairs (a, b) such that a * b = N. If a <= sqrt(N), then b >= sqrt(N).
  // Thus, iterating up to sqrt(N) is sufficient to find all unique factor pairs.
  const upperLimitForDivisorScan = Math.sqrt(parsedNumericEntity);

  // Begin iterating through potential divisors starting from 1.
  // The loop runs up to and including the square root of the number.
  for (let potentialDivisor = 1; potentialDivisor <= upperLimitForDivisorScan; ++potentialDivisor) {
    // Check if the current 'potentialDivisor' is indeed a factor of the 'parsedNumericEntity'.
    if ((parsedNumericEntity % potentialDivisor) === 0) {
      // If it's a factor, calculate its complementary factor in the pair.
      const correspondingFactor = parsedNumericEntity / potentialDivisor;

      // Obtain the digit counts for both factors in the current pair.
      const digitsOfFirstFactor = determineDigitCount(potentialDivisor);
      const digitsOfSecondFactor = determineDigitCount(correspondingFactor);

      // Determine the maximum digit count within this specific factor pair.
      const maxDigitsInCurrentPair = Math.max(digitsOfFirstFactor, digitsOfSecondFactor);

      // If this pair's maximum digit count is smaller than the smallest maximum found previously,
      // update the tracking variable.
      if (maxDigitsInCurrentPair < currentMinimumMaxFactorDigits) {
        currentMinimumMaxFactorDigits = maxDigitsInCurrentPair;
      }
    }
  }

  // Return the final result: the smallest maximum digit count among all factor pairs.
  return currentMinimumMaxFactorDigits;
}

/**
 * Main application entry point responsible for reading input and outputting results.
 * This function handles the environment-specific I/O operations.
 *
 * @param {string} pathToInputFile The file path from which to read the numerical input.
 */
function executeFactorAnalysisProgram(pathToInputFile) {
  // Utilize the Node.js 'fs' module to synchronously read the input from the specified path.
  // The input is expected to be UTF-8 encoded.
  const fileContentsBuffer = require("fs").readFileSync(pathToInputFile, "utf8");

  // Pass the raw string content from the file to the core processing logic.
  const computedOutcome = analyzeIntegerFactorsForMinMaxDigits(fileContentsBuffer);

  // Output the final computed result to the standard console output.
  // Ensuring the output is a string is good practice for console logging.
  console.log(String(computedOutcome));
}

// Invoke the program's execution flow, specifying standard input as the source.
executeFactorAnalysisProgram("/dev/stdin");