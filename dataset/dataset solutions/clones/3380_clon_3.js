"use strict"; // Enforcing strict mode for cleaner code practices

/**
 * Processes raw input data to determine a game outcome based on a sequence of numbers.
 * This function simulates a game where players take turns manipulating numbers,
 * with the outcome depending on the parity of the numbers.
 *
 * @param {string} rawData - The complete input string, typically from stdin.
 */
function processGameOutcome(rawData) {
  // Guard against empty input
  if (!rawData || rawData.trim().length === 0) {
    console.error("Input data is empty or invalid.");
    return;
  }

  // Parse all numbers from the input string, handling potential whitespace and newlines.
  // The first number is expected to be the count of subsequent elements.
  const allParsedNumbers = extractIntegerSequence(rawData);

  // Validate if any numbers were successfully extracted.
  if (allParsedNumbers.length === 0) {
    console.error("No valid numeric data found in the input.");
    return;
  }

  // The first element in the sequence is the total count of items to consider.
  const totalElementsCount = allParsedNumbers[0];

  // Basic validation for the total elements count.
  if (totalElementsCount <= 0) {
    // If there are no elements, the second player wins by default or it's an invalid game state.
    console.log('second');
    return;
  }

  // Extract the actual numeric data array, excluding the count itself.
  // It takes 'totalElementsCount' elements starting from the second position.
  const relevantNumericData = allParsedNumbers.slice(1, totalElementsCount + 1);

  // Ensure the number of extracted elements matches the declared count.
  if (relevantNumericData.length !== totalElementsCount) {
    console.error(`Data count mismatch: Expected ${totalElementsCount} elements, but found ${relevantNumericData.length}.`);
    return;
  }

  // Sort the numeric data in ascending order. This is a critical step for the game logic.
  // The comparison function ensures numerical sorting.
  relevantNumericData.sort((valueA, valueB) => valueA - valueB);

  // Initialize the game outcome flag.
  // The game starts by considering the parity of the largest number.
  // If the largest number is odd, the flag is true ('first' player's advantage), otherwise false.
  const lastItemIndex = totalElementsCount - 1;
  let currentGameStatus = (relevantNumericData[lastItemIndex] % 2 !== 0); // True if odd, false if even

  // Iterate through the sorted numbers from the second largest down to the smallest.
  // Each iteration flips the game outcome status based on the parity of the current number.
  const loopStartPos = totalElementsCount - 2; // Start from the second-to-last element

  for (let currentPos = loopStartPos; currentPos >= 0; currentPos--) {
    const valueAtCurrentPos = relevantNumericData[currentPos];

    // Determine if the current number is odd.
    // An odd number (value % 2 !== 0) causes a flip in the game status.
    const isCurrentValueOdd = (valueAtCurrentPos % 2 !== 0);

    // If the current value is odd, toggle the game status.
    // This is equivalent to 'currentGameStatus = !currentGameStatus;'.
    if (isCurrentValueOdd) {
      currentGameStatus = (currentGameStatus === false);
    }
  }

  // Based on the final game status flag, determine the winner.
  const finalWinnerMessage = currentGameStatus ? 'first' : 'second';
  console.log(finalWinnerMessage);
}

/**
 * Helper function to parse a string into an array of integers.
 * It handles multiple numbers on a single line or across multiple lines,
 * splitting by any whitespace.
 *
 * @param {string} textContent - The string containing numbers separated by whitespace.
 * @returns {number[]} An array of parsed integers. Returns an empty array if no valid numbers are found.
 */
function extractIntegerSequence(textContent) {
  // Split the input string by one or more whitespace characters.
  const rawNumberStrings = textContent.split(/\s+/);

  // Filter out any empty strings that might result from multiple spaces or leading/trailing spaces,
  // then map the remaining strings to integers.
  const parsedNumbers = rawNumberStrings
    .filter(str => str.trim() !== '') // Ensure only non-empty strings are processed
    .map(strValue => {
      const numValue = parseInt(strValue, 10); // Parse as base-10 integer

      // Log a warning if a non-numeric string was found, and return 0 or handle as needed.
      // For this problem, we'll treat invalid numbers as 0 or simply filter them out.
      if (isNaN(numValue)) {
        console.warn(`Encountered non-numeric input '${strValue}'. Skipping or treating as 0.`);
        return 0; // Or filter this out, depending on desired behavior.
      }
      return numValue;
    });

  // Filter out any 0s that resulted from invalid number parsing if that's the desired behavior.
  // For this problem, we'll keep them as the original problem's parseInt would return 0 for non-numbers.
  return parsedNumbers;
}

// Entry point: Read input from standard input and process it.
processGameOutcome(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));