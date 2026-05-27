"use strict";

/*
 * This module processes a given input string to calculate a specific value.
 * It demonstrates basic string manipulation, array indexing, and conditional logic.
 */
const processInput = (inputString) => {
  // Parse the input string into an array of numbers.
  // The input is expected to be space-separated numeric values.
  let numericValues = inputString.split(" ").map(currentValue => +currentValue);

  // Calculate the result based on specific indices of the numeric array.
  // The calculation is (third_value + second_value - first_value).
  // If this sum is negative, the result is 0; otherwise, it's the sum itself.
  let finalResult = (numericValues[2] + numericValues[1] - numericValues[0] >= 0)
    ? (numericValues[2] + numericValues[1] - numericValues[0])
    : 0;

  // Output the computed result to the console.
  console.log(finalResult);
};

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
