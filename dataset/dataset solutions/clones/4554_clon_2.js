"use strict";

/*
 * This module processes a specific input format to calculate a result.
 * It's designed for competitive programming scenarios.
 */
const processInput = (inputData) => {
  // Normalize the input string by trimming whitespace and splitting into lines.
  inputData = inputData.trim().split("\n");

  // Parse the numerical parameters from the first line of input.
  // The first number is 'countVal'.
  const countVal = parseInt(inputData[0].split(" ")[0], 10);
  // The second number is 'paramOne'.
  const paramOne = parseInt(inputData[0].split(" ")[1], 10);
  // The third number is 'paramTwo'.
  const paramTwo = parseInt(inputData[0].split(" ")[2], 10);

  // Calculate the upper and lower bounds based on the given formula.
  // The 'upperBound' represents the maximum possible value.
  const upperBound = paramOne + (paramTwo * (countVal - 1));
  // The 'lowerBound' represents the minimum possible value.
  const lowerBound = paramTwo + (paramOne * (countVal - 1));

  // Initialize the final result with a default calculation.
  let finalResult = upperBound - lowerBound + 1;

  // Apply conditional logic to adjust the result based on parameter values.
  if (paramOne > paramTwo) {
    // If paramOne is greater than paramTwo, the result is zero.
    finalResult = 0;
  } else if (countVal === 1) {
    // If countVal is one, check if paramOne and paramTwo are equal.
    // Result is 1 if they are equal, otherwise 0.
    finalResult = (paramOne === paramTwo) ? 1 : 0;
  }

  // Output the computed final result to the console.
  console.log(finalResult);
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
