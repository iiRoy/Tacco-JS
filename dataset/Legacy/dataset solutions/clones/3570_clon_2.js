'use strict';

/**
 * This function serves as the primary entry point for processing input data.
 * It calculates a specific value based on two numeric inputs.
 * @param {string} rawData - The raw string content read from standard input.
 */
function processInput(rawData) {
  // Remove leading/trailing whitespace and split the string by spaces
  // to get an array of string representations of numbers.
  let parsedData = rawData.trim().split(' ');

  // Extract the first number from the parsed data.
  // The unary plus operator (or `- 0`) is used for explicit type conversion to a number.
  const firstNum = parsedData[0] - 0;

  // Extract the second number from the parsed data.
  const secondNum = parsedData[1] - 0;

  // Initialize the result variable.
  // Calculate the cube of the floor division of firstNum by secondNum.
  let finalResult = Math.pow(Math.floor(firstNum / secondNum), 3);

  // Check if the second number is an even number.
  if (secondNum % 2 === 0) {
    // If secondNum is even, add another component to the final result.
    // This component is the cube of the floor division of (firstNum + secondNum/2) by secondNum.
    finalResult += Math.pow(Math.floor((firstNum + secondNum / 2) / secondNum), 3);
  }

  // Print the calculated final result to the console.
  console.log(finalResult);
}

// Read the entire content of standard input as a UTF-8 string,
// then pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
