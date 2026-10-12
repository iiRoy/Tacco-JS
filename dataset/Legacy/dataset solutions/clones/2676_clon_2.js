'use strict';

/*
 * This function processes an array of strings,
 * expecting the first element to contain space-separated numbers.
 */
const processInput = (inputData) => {
  // Parse the first line of input into an array of integers.
  // Each string value is converted to a base-10 integer.
  inputData = inputData[0].split(' ').map(numericString => parseInt(numericString, 10));

  // Destructure the parsed integer array into individual variables.
  const firstValue = inputData[0];
  const secondValue = inputData[1];
  const thirdValue = inputData[2];

  // Perform a conditional calculation and output the result.
  // If the sum of the second and third values is greater than the first,
  // calculate their difference; otherwise, output zero.
  console.log(secondValue + thirdValue > firstValue ? secondValue + thirdValue - firstValue : 0);
};

// Read the entire standard input, decode it as UTF-8,
// then split it into an array of lines, and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
