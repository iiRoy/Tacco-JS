"use strict";

// This file contains a JavaScript program designed to process game input
// and determine a winner based on a specific numerical game logic.
// It includes utility functions for robust input parsing and validation.

/**
 * Ensures that a provided value is a positive integer.
 * This function acts as a guard clause for critical numerical inputs.
 *
 * @param {any} valueToValidate The input value to be checked.
 * @param {string} specificErrorMessage A custom error message to use if validation fails.
 * @returns {number} The validated positive integer.
 * @throws {Error} If the value is not a positive integer (e.g., zero, negative, float, non-numeric).
 */
const validateAsPositiveInt = (valueToValidate, specificErrorMessage) => {
  const numericRepresentation = Number(valueToValidate);
  // Check if it's an integer and strictly greater than zero.
  if (!Number.isInteger(numericRepresentation) || numericRepresentation <= 0) {
    throw new Error(specificErrorMessage || "Value must be a positive integer.");
  }
  return numericRepresentation;
};

/**
 * Determines if a given integer is an odd number.
 * Utilizes a bitwise AND operation for efficiency.
 *
 * @param {number} checkingNumber The number whose parity is to be checked.
 * @returns {boolean} `true` if the number is odd, `false` otherwise.
 */
const checkParityIsOdd = (checkingNumber) => (checkingNumber & 1) !== 0;

/**
 * Parses a string containing space-separated numbers into an array of integers.
 * Includes basic error handling for non-numeric tokens.
 *
 * @param {string} textLine The string input expected to contain numbers.
 * @returns {Array<number>} An array of successfully parsed integers.
 * @throws {TypeError} If the input `textLine` is not a string.
 * @throws {Error} If any part of the string cannot be parsed into an integer.
 */
const parseNumericStringToArray = (textLine) => {
  if (typeof textLine !== 'string') {
    throw new TypeError("Input for number array parsing must be a string type.");
  }
  // Split by one or more whitespace characters, filtering out any empty strings that might result.
  return textLine.split(/\s+/).filter(Boolean).map((token) => {
    const numericValue = parseInt(token, 10);
    if (isNaN(numericValue)) {
      // Provide detailed error message for failed parsing.
      throw new Error(`Invalid number format encountered: '${token}' could not be converted to an integer.`);
    }
    return numericValue;
  });
};

/**
 * Orchestrates the main game logic:
 * 1. Reads raw input data.
 * 2. Parses the number of game elements (N) and the actual element values.
 * 3. Sorts the game elements.
 * 4. Applies a specific game rule iteratively to determine the winner.
 * 5. Prints the result ('first' or 'second' player).
 *
 * @param {string} systemInputData The entire raw input string from standard input.
 */
function initiateGameComputation(systemInputData) {
  // Defensive programming: check for valid input before processing.
  if (!systemInputData || typeof systemInputData !== 'string' || systemInputData.trim().length === 0) {
    console.error("No valid input data provided for game computation. Exiting.");
    return; // Terminate execution gracefully for invalid input.
  }

  // Split the monolithic input into individual lines, trimming overall whitespace.
  const allDataLines = systemInputData.trim().split('\n');
  if (allDataLines.length === 0) {
    console.error("Input data contains no processable lines. Exiting.");
    return;
  }

  // The very first line should specify the count of numbers (N) that follow.
  const firstLineParsedNumbers = parseNumericStringToArray(allDataLines[0]);
  if (firstLineParsedNumbers.length === 0) {
    console.error("The first line is empty or does not contain a number for element count. Exiting.");
    return;
  }

  // Extract and validate the count of elements, ensuring it's a positive integer.
  const gameElementCount = validateAsPositiveInt(firstLineParsedNumbers[0],
    "The initial element count 'N' must be a positive whole number.");

  // Combine and parse all subsequent lines to get the actual game numbers.
  // We take lines from index 1 up to 'gameElementCount' elements later.
  const gameValuesCollection = parseNumericStringToArray(
    allDataLines.slice(1, gameElementCount + 1).join(' ')
  );

  // Critical validation: ensure the number of provided game values matches the declared count.
  if (gameValuesCollection.length !== gameElementCount) {
    console.error(`Data integrity error: Declared ${gameElementCount} elements, but found ${gameValuesCollection.length}. Aborting.`);
    return;
  }

  // Sort the collection of game values in ascending numerical order.
  // This step is crucial for the game's logic, which depends on element order.
  gameValuesCollection.sort((valA, valB) => valA - valB);

  // Initialize the game's outcome. 'true' implies the 'first' player wins, 'false' for 'second'.
  // The starting advantage is determined by the parity of the largest number in the sorted list.
  let isFirstPlayerAdvantage = checkParityIsOdd(gameValuesCollection[gameElementCount - 1]);

  // Iterate backwards through the sorted numbers, starting from the second largest.
  // The game rule applies to elements other than the largest one.
  let currentPosition = gameElementCount - 2;

  while (currentPosition >= 0) {
    const valueAtCurrentPosition = gameValuesCollection[currentPosition];

    // Apply the game rule: if a number is greater than 1 and is odd,
    // it causes a flip in the current winning advantage.
    if (valueAtCurrentPosition > 1 && checkParityIsOdd(valueAtCurrentPosition)) {
      isFirstPlayerAdvantage = !isFirstPlayerAdvantage; // Toggle the advantage state.
    }
    currentPosition--; // Move to the next smaller element.
  }

  // Announce the final winner based on the determined advantage.
  const finalWinnerDesignation = isFirstPlayerAdvantage ? 'first' : 'second';
  console.log(finalWinnerDesignation);
}

// Execute the game processing by reading input from standard input.
// Using 'node:fs' for explicit Node.js module access.
initiateGameComputation(require('node:fs').readFileSync('/dev/stdin', 'utf8'));

// --- Removed Components ---
// The original `_slicedToArray`, `_nonIterableRest`, `_iterableToArrayLimit`, `_arrayWithHoles`
// Babel helper functions were removed by refactoring array destructuring
// into direct array indexing and custom parsing logic.
//
// The `solve` recursive function was identified as unused in the original `main` function's
// execution path and has been completely removed to simplify the codebase,
// as per Type III clone requirements (deletion of non-essential statements).