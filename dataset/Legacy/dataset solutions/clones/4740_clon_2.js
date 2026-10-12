'use strict'; // Enforce strict parsing and error handling

/**
 * Processes a numerical value to determine a specific output based on divisibility by six.
 * @param {number} val The numeric value to be processed.
 */
function processInput(val) {
  // Check if the provided value is perfectly divisible by six.
  if (val % 6 === 0) {
    // If it is, log the result of the division.
    console.log(val / 6);
  } else {
    // Otherwise, calculate the integer part of the division and add one, then log it.
    // This effectively rounds up the division result to the next whole number.
    console.log(parseInt(val / 6) + 1);
  }
}

// Read the input from standard input, convert it to a string, and then pass it to the processing function.
// The input is expected to be a number.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
