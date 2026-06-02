'use strict'; /* Enforce strict parsing and error handling in the script. */

/**
 * Processes an input string to calculate a specific time value.
 * @param {string} inputString - The raw string input, expected to contain numbers.
 */
function processInput(inputString) {
  // First, we'll parse the incoming data.
  // The input string is split by newline, taking only the first line.
  // That line is then split by spaces, and each part is converted to a number.
  const numericValues = inputString.split('\n')[0].split(' ').map(currentNumStr => Number(currentNumStr));

  // Extract the first numerical component from the parsed array.
  const firstVal = numericValues[0];
  // Extract the second numerical component from the parsed array.
  const secondVal = numericValues[1];

  // Calculate the sum of the two values and then apply a modulo operation
  // to keep the result within a 24-hour cycle.
  const resultantTime = (firstVal + secondVal) % 24;

  // Output the final computed time to the standard console.
  console.log(resultantTime);
}

// The program execution begins here.
// It reads content from standard input using Node.js file system module,
// then passes that content to our primary processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
