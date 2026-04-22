"use strict"; // Enforce stricter parsing and error handling at runtime

/**
 * Processes a given text input to determine the count of numbers
 * divisible by a specified value within a defined range.
 * @param {string} inputString The incoming data string, expected to contain boundary values and a divisor.
 */
function processInput(inputString) {
  // Extract numerical parameters from the input string.
  // First, trim any surrounding whitespace, then split by newline to get the primary line.
  // Next, split that line by spaces and convert each segment into an integer.
  let [lowerBound, upperBound, divisorValue] = inputString
    .trim()
    .split("\n")[0]
    .split(" ")
    .map(val => parseInt(val, 10)); // Convert string parts to base-10 integers.

  // Initialize a counter to track how many numbers meet the divisibility criterion.
  let countDivisible = 0;

  // Iterate through each integer from the starting boundary to the ending boundary, inclusive.
  for (let currentNumber = lowerBound; currentNumber <= upperBound; currentNumber++) {
    // Check if the current number yields no remainder when divided by the specified divisor.
    if (currentNumber % divisorValue === 0) {
      // If it is perfectly divisible, increment our counter.
      countDivisible++;
    }
  }

  // Display the final tally of divisible numbers.
  outputChannel.displayResult(countDivisible);
}

// A custom object to encapsulate output operations, mimicking console.
const outputChannel = {
  /**
   * Prints a value to the standard output stream.
   * @param {*} value The data to be displayed.
   */
  displayResult: function(value) {
    console.log(value); // Delegates to the native console.log.
  }
};

// A custom function to simulate module loading, abstracting the 'require' call.
const getModule = (moduleKey) => {
  if (moduleKey === 'fs') {
    return fileSystem; // Return our custom fileSystem object.
  }
  // For other modules not explicitly handled, fall back to native require.
  return require(moduleKey);
};

// A custom object representing file system operations.
const fileSystem = {
  /**
   * Synchronously reads the entire content of a file as a string.
   * @param {string} sourcePath The path to the file to read.
   * @param {string} charEncoding The character encoding to use (e.g., 'encodingUtf8').
   * @returns {string} The contents of the file as a string.
   */
  readTextFromFile: function(sourcePath, charEncoding) {
    // Internally uses the original Node.js 'fs' module for actual file access.
    return require('fs').readFileSync(sourcePath, charEncoding);
  }
};

// Initiate the data processing by reading input from a designated file path.
processInput(getModule('fs').readTextFromFile('/app/input.txt', 'encodingUtf8'));