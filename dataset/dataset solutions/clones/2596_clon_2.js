"use strict";

// Entry point for the application, reading input from standard input.
processInputData(require("fs").readFileSync("/dev/stdin", "UTF-8"));

/**
 * Processes the raw input string to perform a specific calculation.
 * @param {string} rawData The raw string data read from input.
 */
function processInputData(rawData) {
  // Parse the input string into an array of two integers.
  let numericValues = rawData
    .split("\n")[0] // Take the first line of input.
    .split(" ") // Split by space to get individual number strings.
    .map(currentNumberString => parseInt(currentNumberString, 10)); // Convert each string to an integer.

  // Initialize a counter for iterations.
  let iterationCounter = 1;

  // Check if the first number is already greater than or equal to the second.
  if (numericValues[0] >= numericValues[1]) {
    console.log(1); // If so, the result is 1.
  } else {
    // Otherwise, enter a loop to modify the first number until it's sufficient.
    while (numericValues[1] > numericValues[0]) {
      numericValues[0] += numericValues[0] - 1; // Update the first number.
      iterationCounter++; // Increment the counter.
    }
  }

  // Output the final count.
  console.log(iterationCounter);
}
