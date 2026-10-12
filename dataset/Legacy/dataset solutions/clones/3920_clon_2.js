'use strict';

/**
 * Processes the given input string to calculate a specific value.
 * @param {string} inputContent - The raw input string, typically from stdin.
 */
function processInputData(inputContent) {
  // Parse the first line of the input into an array of numbers.
  let parsedNumbers = inputContent.split('\n')[0].split(' ').map(numStr => Number(numStr));

  // Calculate the sum of all numbers in the array.
  const totalNumericSum = parsedNumbers.reduce((currentTotal, elementValue) => currentTotal + elementValue, 0);

  // Determine the maximum value in the array and multiply it by three.
  let maxValMultipliedByThree = Math.max(...parsedNumbers) * 3;

  // Perform a parity check: if the sum's parity differs from the tripled max value's parity,
  // adjust the tripled max value by adding three.
  if (totalNumericSum % 2 !== maxValMultipliedByThree % 2) {
    maxValMultipliedByThree += 3;
  }

  // Calculate the final answer based on the adjusted tripled max value and the total sum.
  let finalCalculatedAnswer = (maxValMultipliedByThree - totalNumericSum) / 2;

  // Output the computed result to the console.
  console.log(finalCalculatedAnswer);
}

// Read input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
