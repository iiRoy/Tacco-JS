"use strict";

/**
 * This function processes a raw string input,
 * parses it into numerical values, and then
 * performs a conditional calculation based on these values.
 *
 * @param {string} incomingString The raw input string, expected to contain space-separated numbers.
 */
function ProcessData(incomingString) {
  // First, clean the input string by removing leading/trailing whitespace,
  // then split it into an array of strings by spaces,
  // and finally convert each string element into a number.
  incomingString = incomingString.trim().split(' ').map(Number);

  // Evaluate the first numerical value against a specific threshold.
  if (incomingString[0] <= 10) {
    // If the first value is less than or equal to ten,
    // calculate a modified result by adding a bonus based on the difference from ten.
    console.log(incomingString[1] + (100 * (10 - incomingString[0])));
  } else {
    // Otherwise (if the first value is greater than ten),
    // simply output the second numerical value without any modification.
    console.log(incomingString[1]);
  }
}

// Read the entire content of standard input synchronously,
// assuming it's UTF-8 encoded, and then pass it to the processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
