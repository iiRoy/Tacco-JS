"use strict"; // Enforce strict mode for cleaner code

/**
 * Processes the raw input string to determine if the sum of the first two numbers
 * is greater than or equal to the third number.
 * @param {string} rawInputString - The input string containing space-separated numbers.
 */
const ProcessInputData = (rawInputString) => {
  // Split the input string into an array of string tokens based on spaces.
  const parsedTokens = rawInputString.split(" ");

  // Convert the first token to an integer, using base 10.
  const valueOne = parseInt(parsedTokens[0], 10);

  // Convert the second token to an integer, using base 10.
  const valueTwo = parseInt(parsedTokens[1], 10);

  // Convert the third token to an integer, using base 10.
  const valueThree = parseInt(parsedTokens[2], 10);

  // Determine the outcome based on the condition (valueOne + valueTwo) >= valueThree.
  // If true, the outcome is "Yes"; otherwise, it's "No".
  const finalOutcome = (valueOne + valueTwo) >= valueThree ? "Yes" : "No";

  // Output the determined outcome to the console.
  console.log(finalOutcome);
};

// Read the input from standard input (usually a file in competitive programming environments)
// and pass it to the main processing function.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
