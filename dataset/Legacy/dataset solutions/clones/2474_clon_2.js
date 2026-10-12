"use strict";

// This function aims to find the largest proper divisor of a given number.
function findLargestFactor(inputNumber) {
  let currentLargestFactor = 1; // Initialize with 1, as it's always a divisor.
  const halfValue = parseInt(inputNumber) / 2; // We only need to check up to half the number.

  // Iterate from 2 up to (but not including) half the number.
  for (let iterator = 2; iterator < halfValue; iterator++) {
    // Check if 'iterator' divides 'inputNumber' evenly
    // and if it's greater than the current largest factor found.
    if (inputNumber % iterator === 0 && iterator > currentLargestFactor) {
      currentLargestFactor = iterator; // Update the largest factor.
    }
  }
  return currentLargestFactor; // Return the determined largest factor.
}

// The primary execution function that processes the input.
function processInput(rawData) {
  // Parse the first line of the input string into an integer.
  rawData = parseInt(rawData.split("\n")[0]);
  console.log(rawData); // Output the parsed input number.

  // Calculate the largest proper divisor for the processed number.
  let calculatedFactor = findLargestFactor(rawData);

  // Perform a specific calculation and output the result.
  // This calculation seems to be (factor - 1) + (number / factor - 1).
  console.log(calculatedFactor - 1 + rawData / calculatedFactor - 1);
}

// Read input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "UTF-8"));
