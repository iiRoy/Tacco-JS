"use strict";

/*
 * This function processes an input string to find numbers divisible by a specific value
 * within a given range.
 */
function processInput(inputString) {
  // Parse the input string to extract the lower bound, upper bound, and divisor.
  // The input is expected to be on the first line, space-separated.
  let [lowerBound, upperBound, divisorVal] = inputString
    .trim()
    .split("\n")[0]
    .split(" ")
    .map(Number);

  // Initialize a counter for numbers that meet the divisibility criterion.
  let resultCount = 0;

  // Iterate through each number from the lower bound to the upper bound (inclusive).
  for (let currentNum = lowerBound; currentNum <= upperBound; currentNum++) {
    // Check if the current number is perfectly divisible by the specified divisor.
    if (currentNum % divisorVal === 0) {
      // If it is divisible, increment the counter.
      resultCount++;
    }
  }

  // Output the final count of divisible numbers to the console.
  console.log(resultCount);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
