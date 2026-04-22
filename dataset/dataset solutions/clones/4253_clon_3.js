/**
 * This JavaScript module is designed to identify the largest perfect square
 * that is less than or equal to a given input number, while also being
 * strictly greater than one. It includes robust input handling and
 * a structured search mechanism.
 */

/**
 * Determines if a given integer is a perfect square.
 * A perfect square is an integer that can be expressed as the square of another integer.
 * This utility focuses on non-negative integers for practicality within this context.
 *
 * @param {number} testValue - The number to check for being a perfect square.
 * @returns {boolean} True if `testValue` is a perfect square, false otherwise.
 */
const verifyPerfectSquare = (testValue) => {
  // Perfect squares cannot be negative.
  if (testValue < 0) {
    return false;
  }
  // Zero is considered a perfect square (0 * 0 = 0).
  if (testValue === 0) {
    return true;
  }

  // Calculate the square root.
  const calculatedRoot = Math.sqrt(testValue);

  // Utilize `Number.isInteger` for a precise and explicit check
  // to see if the square root is a whole number.
  return Number.isInteger(calculatedRoot);
};

/**
 * Initiates the primary data processing flow. It takes a raw string input,
 * parses it into a number, and then searches for the largest perfect square
 * adhering to the problem's criteria.
 *
 * @param {string} rawInputString - The string content provided as input, expected to be a numeric value.
 */
const initiateSquareSearch = (rawInputString) => {
  // This variable will store the highest perfect square found during the search.
  // Initialized to `null` to clearly indicate that no valid square has been identified yet.
  let identifiedLargestSquare = null;

  // A simple counter to track how many numbers were checked.
  let processingSteps = 0;

  // --- Input Preparation and Validation ---
  // Remove any leading or trailing whitespace to ensure clean parsing.
  const cleanedInput = rawInputString.trim();

  // Convert the cleaned string into an integer. The radix (base 10) is specified
  // for robustness, preventing unexpected behavior with leading zeros.
  const initialNumericValue = parseInt(cleanedInput, 10);

  // Validate the parsed number. It must be a valid, non-floating-point integer.
  if (isNaN(initialNumericValue) || !Number.isInteger(initialNumericValue)) {
    console.error("Input Error: The provided value is not a valid integer. Please provide a whole number.");
    return; // Terminate execution if input is invalid.
  }

  // Apply a guard clause for values that cannot possibly yield a result
  // based on the search criteria (perfect square strictly greater than 1).
  if (initialNumericValue <= 1) {
    console.log("No perfect square greater than 1 exists for the given input (<= 1).");
    return;
  }

  // --- Iterative Search for the Target Square ---
  // The loop starts from the `initialNumericValue` and decrements.
  // It continues as long as `currentEvaluation` is greater than 1 (per problem statement)
  // AND no perfect square has been successfully identified yet (`identifiedLargestSquare` is still `null`).
  // This compound condition effectively replaces an explicit `break` statement.
  for (let currentEvaluation = initialNumericValue;
       currentEvaluation > 1 && identifiedLargestSquare === null;
       currentEvaluation--) {

    processingSteps++; // Increment the step counter with each iteration.

    // Utilize the `verifyPerfectSquare` helper to check the current number.
    if (verifyPerfectSquare(currentEvaluation)) {
      // If a perfect square is found, store it. Since we are decrementing,
      // the first one found will inherently be the largest.
      identifiedLargestSquare = currentEvaluation;
    }
  }

  // --- Outputting the Final Result ---
  if (identifiedLargestSquare !== null) {
    // If a perfect square was found, print its value.
    console.log(identifiedLargestSquare);
    // Provide additional context about the search process.
    console.log(`(Search concluded after examining ${processingSteps} candidates.)`);
  } else {
    // If the loop completed without finding any suitable perfect square.
    console.log(`No perfect square greater than 1 was found up to the initial value of ${initialNumericValue}.`);
    console.log(`(Total numbers checked: ${processingSteps}.)`);
  }
};

// --- Application Entry Point ---
// Reads the content of standard input (`/dev/stdin`) synchronously,
// using UTF-8 encoding, and then passes this content as a string
// to the main processing function `initiateSquareSearch`.
initiateSquareSearch(require('fs').readFileSync('/dev/stdin', 'utf8'));