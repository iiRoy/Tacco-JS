'use strict';

// This script processes numerical data from standard input.

const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

/**
 * Converts a space-separated string of numbers into an array of integers.
 * @param {string} inputString - The string to parse.
 * @returns {number[]} An array of parsed integers.
 */
const parseNumbersFromString = (inputString) => {
  return inputString.split(' ').map(val => parseInt(val, 10));
};

// Discard the first line, often a count or metadata.
inputLines.shift();

// Initialize a map to store counts of numbers, using BigInt for potentially large counts.
const numberCountsMap = {};

// Process the initial set of numbers from the second line of input.
parseNumbersFromString(inputLines.shift()).forEach(currentNum => {
  // Ensure the count is initialized to 0n if not present.
  numberCountsMap[currentNum] = numberCountsMap[currentNum] || 0n;
  // Increment the count for the current number.
  ++numberCountsMap[currentNum];
});

// Discard another line, possibly a separator or another metadata line.
inputLines.shift();

// Process subsequent lines until no more input is available.
while (inputLines.length > 0) {
  const currentOperationValues = parseNumbersFromString(inputLines.shift());

  // Check if the first number in the current line exists in our map.
  if (numberCountsMap[currentOperationValues[0]]) {
    // Get the current count of the first number.
    const transferAmount = BigInt(numberCountsMap[currentOperationValues[0]]);

    // Decrease the count of the first number by the transfer amount.
    numberCountsMap[currentOperationValues[0]] -= transferAmount;

    // Ensure the count for the second number is initialized to 0n if not present.
    numberCountsMap[currentOperationValues[1]] = numberCountsMap[currentOperationValues[1]] || 0n;
    // Increase the count of the second number by the transfer amount.
    numberCountsMap[currentOperationValues[1]] += transferAmount;
  }

  // Output the calculated sum after each operation.
  console.log(computeTotalSum());
}

/**
 * Calculates the sum of all numbers in the `numberCountsMap`,
 * where each number is added `count` times.
 * @returns {number} The total sum.
 */
function computeTotalSum() {
  const allKeys = Object.keys(numberCountsMap);
  let overallSum = 0;

  // Iterate over each unique number (key) in the map.
  allKeys.forEach(keyString => {
    // If the count for this number is non-zero.
    if (numberCountsMap[keyString]) {
      // Loop `count` times, adding the number to the sum in each iteration.
      for (let iterationIndex = 0, currentCount = numberCountsMap[keyString]; iterationIndex < currentCount; ++iterationIndex) {
        overallSum += parseInt(keyString, 10);
      }
    }
  });
  return overallSum;
}
