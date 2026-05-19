"use strict";

/**
 * Primary function to process the provided input data and compute a specific count.
 * @param {string} inputData - The raw string input, typically read from a file or standard input.
 */
function processInput(inputData) {
  // Extract the numerical upper bound from the first line of the input.
  const upperBound = Number(inputData.split("\n")[0].split(" ").map(Number)[0]);
  // Determine the total number of digits in the upper bound.
  const maxDigits = String(upperBound).length;

  let totalPairs = 0; // Initialize a variable to accumulate the count of valid pairs.

  // Iterate through each integer starting from one, up to (but not including) the upper bound.
  for (let currentNum = 1; currentNum < upperBound; currentNum++) {
    // Retrieve the first and last digits of the current number.
    const numTips = extractEnds(currentNum);

    // Calculate the digit count for the current number.
    const currentNumDigits = String(currentNum).length;

    // Loop through potential digit lengths for the second number in a pair,
    // ranging from one up to the maximum digits of the upper bound.
    for (let targetDigits = 1; targetDigits <= maxDigits; targetDigits++) {
      // Scenario 1: The current number (left part of the pair) consists of a single digit.
      if (currentNumDigits === 1) {
        // Sub-scenario 1.1: The target number (right part) also has a single digit.
        if (targetDigits === 1) {
          totalPairs++; // Increment count for pairs like [X, X].
        }
        // Sub-scenario 1.2: The target number has two digits.
        // This is valid if the first and last digits of 'currentNum' are identical (always true for single digits).
        if (targetDigits === 2 && numTips[0] === numTips[1]) {
          totalPairs++; // Increment count for pairs like [X, XX].
        }
        // Sub-scenario 1.3: The target number has more than two digits.
        // This involves constructing numbers with a middle digit, e.g., 'XkX'.
        if (targetDigits > 2 && numTips[0] === numTips[1]) {
          // Continuously construct numbers by inserting a middle digit.
          for (let middleDigit = 0; ; middleDigit++) {
            // Form the potential second number.
            const constructedNum = Number(currentNum.toString() + middleDigit.toString() + currentNum.toString());
            // If the constructed number exceeds the upper bound, terminate this inner loop.
            if (constructedNum > upperBound) break;
            totalPairs++; // Increment count for a valid pair.
          }
        }
      }
      // Scenario 2: The current number (left part of the pair) has multiple digits.
      else if (currentNumDigits > 1) {
        // Sub-scenario 2.1: The target number (right part) has a single digit.
        if (targetDigits === 1) {
          // Valid if the first digit of 'currentNum' matches its last digit.
          if (numTips[0] === numTips[1]) {
            totalPairs++; // Increment count for pairs like [XYZ, X].
          }
        }
        // Sub-scenario 2.2: The target number has two digits.
        if (targetDigits === 2) {
          // Valid if the first digit of 'currentNum' matches its last digit.
          if (numTips[0] === numTips[1]) {
            totalPairs++; // Increment count for pairs like [XYZ, XX].
          }
        }
        // Sub-scenario 2.3: The target number has more than two digits.
        // This involves constructing numbers using the last and first digits of 'currentNum', e.g., 'ZkX'.
        if (targetDigits > 2) {
          // Continuously construct numbers by inserting a middle digit.
          for (let middleDigit = 0; ; middleDigit++) {
            // Form the potential second number using the last and first digits.
            const constructedNum = Number(numTips[1].toString() + middleDigit.toString() + numTips[0].toString());
            // If the constructed number exceeds the upper bound, terminate this inner loop.
            if (constructedNum > upperBound) break;
            totalPairs++; // Increment count for a valid pair.
          }
        }
      }
    }
  }
  // Output the final computed total number of pairs.
  console.log(totalPairs);
}

// Execute the main processing function by reading input from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Obtains the first and last digits of a given integer.
 * If the number is a single digit, that digit is returned twice.
 * @param {number} inputVal - The integer from which to extract digits.
 * @returns {number[]} An array containing the first digit and the last digit.
 */
function extractEnds(inputVal) {
  const valString = inputVal.toString(); // Convert the number to its string representation.
  const valLength = valString.length; // Get the total count of digits.

  // For a single-digit number, return the digit as both first and last.
  if (valLength === 1) {
    return [Number(valString), Number(valString)];
  }
  // For multi-digit numbers, return the first character converted to a number
  // and the last character converted to a number.
  return [Number(valString[0]), Number(valString[valLength - 1])];
}
