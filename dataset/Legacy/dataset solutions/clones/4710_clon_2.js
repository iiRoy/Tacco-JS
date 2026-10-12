'use strict'; // Enforce strict parsing and error handling

/**
 * Processes an input string to determine a winner based on two numeric values.
 * This function simulates a simple card game where '1' is treated as a high card (14).
 *
 * @param {string} inputString - The raw input string, expected to contain two space-separated numbers on the first line.
 */
function processInput(inputString) {
  // First, split the input by newline to get the first line,
  // then split that line by space, and finally convert each part to a number.
  const numericValues = inputString.split('\n')[0].split(' ').map(currentNumStr => Number(currentNumStr));

  // Extract the two primary values for comparison.
  let firstValue = numericValues[0];
  let secondValue = numericValues[1];

  // Special rule: if a value is 1, treat it as 14 for comparison purposes.
  if (firstValue === 1) {
    firstValue += 13; // 1 becomes 14
  }
  if (secondValue === 1) {
    secondValue += 13; // 1 becomes 14
  }

  // Initialize a variable to store the outcome message.
  let resultMessage = '';

  // Determine the winner or if it's a draw based on the adjusted values.
  if (firstValue > secondValue) {
    resultMessage = 'Alice'; // Alice wins if her value is greater
  }
  if (firstValue < secondValue) {
    resultMessage = 'Bob';   // Bob wins if his value is greater
  }
  if (firstValue === secondValue) {
    resultMessage = 'Draw';  // It's a draw if values are equal
  }

  // Output the final result to the console.
  console.log(resultMessage);
}

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
