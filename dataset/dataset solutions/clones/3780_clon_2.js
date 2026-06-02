"use strict";

// Obtain the initial input value from standard input
let inputNumber = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')[0]);

// Initialize the variable to store the minimum digit sum found
let minimumDigitSum = inputNumber;

// Iterate through possible splits of the input number
for (let currentVal = 1; currentVal < parseInt(inputNumber / 2) + 1; currentVal++) {
  // Calculate the complementary value
  let complementVal = inputNumber - currentVal;

  // Calculate the sum of digits for both parts
  let currentSum = calculateDigitSum(currentVal.toString().split("")) + calculateDigitSum(complementVal.toString().split(""));

  // Update the minimum digit sum if a smaller one is found
  if (minimumDigitSum > currentSum) {
    minimumDigitSum = currentSum;
  }
}

// Output the final minimum digit sum
console.log(minimumDigitSum);

/**
 * Calculates the sum of digits for an array of digit strings.
 * @param {string[]} digitStrings - An array where each element is a digit character.
 * @returns {number} The sum of the digits.
 */
function calculateDigitSum(digitStrings) {
  let totalSum = 0; // Initialize accumulator for digit sum

  // Iterate over each digit character in the array
  digitStrings.forEach(function(digitChar) {
    totalSum += parseInt(digitChar); // Convert character to integer and add to sum
  });

  return totalSum; // Return the computed sum
}
