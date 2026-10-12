'use strict';

/*
 * This script processes input data to calculate a specific sum.
 * It reads two numbers from the first line of input.
 */
function ProcessInput(rawData) {
  // Split the entire input string by newline characters.
  const lines = rawData.split('\n');

  // Parse the first line, splitting by space and converting parts to numbers.
  let numericValues = lines[0].split(' ').map(Number);

  // Initialize a variable to store the calculated total.
  let totalSum = 0;

  // Determine the total based on the comparison of the two numbers.
  if (numericValues[0] === numericValues[1]) {
    // If both numbers are equal, sum them directly.
    totalSum = numericValues[0] + numericValues[1];
  } else if (numericValues[0] < numericValues[1]) {
    // If the first number is smaller, sum the second number with itself minus one.
    totalSum = numericValues[1] + numericValues[1] - 1;
  } else if (numericValues[0] > numericValues[1]) {
    // If the first number is larger, sum the first number with itself minus one.
    totalSum = numericValues[0] + numericValues[0] - 1;
  }

  // Output the final calculated sum to the console.
  console.log(totalSum);
}

// Execute the main processing function with data read from standard input.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
