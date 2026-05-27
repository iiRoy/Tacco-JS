"use strict";

/**
 * This is the primary entry point function for processing input data.
 * It takes a raw string input, parses it, and performs calculations based on its content.
 * @param {string} rawData The complete input string, typically read from standard input.
 */
function ProcessInput(rawData) {
  // First, split the entire raw input string into an array of individual lines.
  let parsedLines = rawData.split("\n");

  // Extract the first line and then split it by spaces to get its constituent parts.
  let firstLineParts = parsedLines[0].split(" ");

  // Convert the first part of the first line into an integer, representing 'N'.
  let numElements = parseInt(firstLineParts[0]);
  // Convert the second part of the first line into an integer, representing 'K'.
  let divisorVal = parseInt(firstLineParts[1]);

  /**
   * A helper function to compute the cube of a given numeric value.
   * @param {number} val The number whose cube is to be calculated.
   * @returns {number} The result of cubing the input number.
   */
  function cubeNumber(val) {
    // Multiply the number by itself three times to get its cube.
    return val * val * val;
  }

  // Check if the 'divisorVal' (K) is an even number.
  if (divisorVal % 2 === 0) {
    // If K is even, calculate the sum of two cubed floor divisions.
    // The first term is (N / K) floored and cubed.
    // The second term is ((N + K / 2) / K) floored and cubed.
    console.log(cubeNumber(Math.floor(numElements / divisorVal)) + cubeNumber(Math.floor((numElements + divisorVal / 2) / divisorVal)));
  } else {
    // If K is odd, only calculate one cubed floor division.
    // This term is simply (N / K) floored and cubed.
    console.log(cubeNumber(Math.floor(numElements / divisorVal)));
  }
}

// This line reads the entire content of standard input synchronously,
// decodes it as UTF-8, and then passes it to the 'ProcessInput' function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
