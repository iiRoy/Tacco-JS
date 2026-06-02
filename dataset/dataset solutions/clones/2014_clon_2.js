"use strict";

/**
 * Calculates and returns an array containing all positive integer divisors of a given number.
 * The order of divisors in the array is not guaranteed to be strictly ascending,
 * but it will include 1 and the number itself.
 * @param {number} inputNumber The positive integer for which to find divisors.
 * @returns {number[]} An array of divisors.
 */
function obtainFactors(inputNumber) {
  // Initialize an array to store the found factors.
  const factorList = new Array();
  // The number 1 is always a divisor of any positive integer.
  factorList[0] = 1;

  // Iterate from 2 up to the square root of the input number.
  // This approach efficiently finds one part of each divisor pair (d, inputNumber/d).
  for (let loopCounter = 2; loopCounter <= Math.sqrt(inputNumber); loopCounter++) {
    // If 'loopCounter' divides 'inputNumber' without a remainder, it's a divisor.
    if (inputNumber % loopCounter === 0) {
      factorList.push(loopCounter); // Add this divisor to our collection.
    }
  }

  // Store the number of divisors found in the initial pass (up to sqrt(inputNumber)).
  const initialFactorCount = factorList.length;

  // This conditional block handles the "other half" of the last divisor pair found.
  // If 'inputNumber' is not a perfect square, or if the square root itself was not
  // the last element added (e.g., if the square root is 1, or no divisors > 1 were found),
  // then we need to add the corresponding larger divisor for the last smaller divisor.
  // For perfect squares, Math.sqrt(inputNumber) will be equal to factorList[initialFactorCount - 1],
  // so this block will be skipped, preventing duplication of the square root.
  if (Math.sqrt(inputNumber) !== factorList[initialFactorCount - 1]) {
    // Add the larger divisor corresponding to the last smaller divisor found.
    factorList.push(inputNumber / factorList[initialFactorCount - 1]);
  }

  // Now, iterate backwards through the smaller divisors (excluding 1 and potentially the last one
  // if it was handled above) and add their corresponding larger divisors.
  // This ensures all divisors are included without duplicates for perfect squares.
  for (let loopCounter = initialFactorCount - 2; 0 <= loopCounter; loopCounter--) {
    factorList.push(inputNumber / factorList[loopCounter]);
  }

  return factorList; // Return the complete array of divisors.
}

// This is an Immediately Invoked Function Expression (IIFE)
// that serves as the main entry point for the program.
(function processInput(rawInputString) {
  // Convert the raw string input to a number, removing any leading/trailing whitespace.
  const processedNumber = Number(rawInputString.trim());

  // Calculate the number of divisors for (processedNumber - 1),
  // then subtract 1 to exclude the divisor '1' from this count.
  const countForNMinusOne = obtainFactors(processedNumber - 1).length - 1;

  // Initialize a counter for specific divisors of 'processedNumber'.
  let countForN = 0;

  // Get all divisors of 'processedNumber'.
  const factorsOfProcessedNumber = obtainFactors(processedNumber);
  // Remove the first element, which is always 1, as per the problem's requirements.
  factorsOfProcessedNumber.shift();

  // Iterate over each remaining divisor of 'processedNumber'.
  for (let currentDivisor of factorsOfProcessedNumber) {
    let temporaryValue = processedNumber; // Use a temporary variable for division.

    // Repeatedly divide 'temporaryValue' by 'currentDivisor' as long as it is perfectly divisible.
    do {
      temporaryValue /= currentDivisor;
    } while (temporaryValue % currentDivisor === 0);

    // After the loop, 'temporaryValue' holds the part of 'processedNumber'
    // that is no longer divisible by 'currentDivisor'.

    // Condition 1: If 'temporaryValue' is 1, it means 'processedNumber' was a power of 'currentDivisor'.
    if (temporaryValue === 1) {
      countForN++; // Increment the counter.
    }
    // Condition 2: If 'temporaryValue' is not 1, check if 'currentDivisor' is a divisor
    // of (temporaryValue - 1).
    else if (obtainFactors(temporaryValue - 1).indexOf(currentDivisor) > -1) {
      countForN++; // Increment the counter.
    }
  }

  // Output the sum of the two calculated counts to the standard console.
  console.log(countForNMinusOne + countForN);

  // The input for this IIFE is read synchronously from standard input.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
