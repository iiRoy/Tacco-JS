'use strict'; // Enforce strict parsing and error handling in the script.

/**
 * Processes an input string to determine a winner based on numerical values.
 * @param {string} inputString - The raw input data, typically from standard input.
 */
const processInput = inputString => {
  // First, parse the input string.
  // It's expected to be a single line containing space-separated numbers.
  // We take the first line, split it by spaces, and convert each part to a number.
  const numericValues = inputString
    .split('\n')[0] // Get the very first line of the input.
    .split(' ')     // Divide the line into individual string components based on spaces.
    .map(numStr => Number(numStr)); // Transform each string component into its numerical equivalent.

  // Extract the specific values required for the calculation.
  // The problem implies these are at specific indices after parsing.
  const firstVal = numericValues[1];  // Retrieve the second number from the parsed array.
  const secondVal = numericValues[2]; // Retrieve the third number from the parsed array.

  // Perform the core logic: check the parity of the difference between the two numbers.
  // If the difference is even, 'Alice' wins; otherwise, 'Borys' wins.
  const resultMessage = ((firstVal - secondVal) % 2 === 0)
    ? 'Alice' // Outcome for an even difference.
    : 'Borys'; // Outcome for an odd difference.

  // Output the determined winner to the console.
  console.log(resultMessage);
};

// Execute the main processing function by reading input from standard input.
// This uses Node.js's file system module to synchronously read the entire content
// of /dev/stdin (standard input) as a UTF-8 encoded string.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
