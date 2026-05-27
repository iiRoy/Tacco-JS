'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes a numerical input to calculate a specific value.
 * This function takes a string or number, converts it to an integer,
 * and then computes the smallest multiple of 111 that is greater than or equal to the input.
 * @param {string | number} dataValue - The raw input data, expected to be a number or a string representation of a number.
 */
function processInput(dataValue) {
  // Convert the input to an integer using a bitwise NOT operator twice.
  // This is a common, albeit sometimes less readable, way to achieve floor(Number(dataValue)).
  let numericValue = ~~dataValue;

  // Calculate the ceiling of the division by 111, then multiply by 111.
  // This effectively finds the smallest multiple of 111 that is greater than or equal to numericValue.
  let result = Math.ceil(numericValue / 111) * 111;

  // Output the computed result to the console.
  console.log(result);
}

// Read the input from standard input, assuming it's a UTF-8 encoded string.
// The 'fs' module is used for file system operations, and 'readFileSync' reads the file synchronously.
// '/dev/stdin' is a common path for standard input on Unix-like systems.
const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');

// Call the main processing function with the obtained input.
processInput(rawInput);
