'use strict';

// Utility function for logging messages to the console.
const outputWriter = (messageContent) => console.log(messageContent);

/*
  Original comments:
  // let a,b,c,d;
  // [a,b,c,d] = input[0].trim().split(" ").map(i => parseInt(i));
*/

/**
 * Processes the input data to determine if a number divisible by K exists
 * within the range [A, B].
 * @param {string[]} rawInputLines - An array of strings, where each string is a line of input.
 */
function analyzeRangeForDivisibility(rawInputLines) {
  // Extract the divisor value from the first line of input.
  let divisorValue = rawInputLines[0].split(" ")[0];

  // Declare variables for the start and end of the range.
  let rangeStart, rangeEnd;

  // Parse the start and end of the range from the second line of input.
  [rangeStart, rangeEnd] = rawInputLines[1].split(" ").map(strItem => parseInt(strItem));

  // A boolean indicator to track if a divisible number is found.
  let foundDivisibleNumber = false;

  // Iterate through the numbers in the specified range.
  for (let currentNumber = rangeStart; currentNumber < rangeEnd + 1; currentNumber++) {
    // Check if the current number is perfectly divisible by the divisor.
    if (Math.floor(currentNumber % divisorValue) === 0) {
      outputWriter('OK'); // Output 'OK' if a divisible number is found.
      foundDivisibleNumber = true; // Set the flag to true.
      return; // Exit the function immediately as the condition is met.
    }
  }

  // If the loop completes and no divisible number was found.
  if (!foundDivisibleNumber) {
    outputWriter('NO'); // Output 'NO'.
  }
}

// Read input from standard input, process it, and then call the main logic.
analyzeRangeForDivisibility(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
