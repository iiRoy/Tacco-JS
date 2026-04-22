/* This script processes a list of numbers to find a specific increasing sequence. */

"use strict";

const solutionSolver = (rawDataLines) => {
  // The first line of input specifies the total count of items.
  let totalItems = Number.parseInt(rawDataLines[0]);

  // The second line contains space-separated numeric values, converted to an array.
  let numericValues = Array.from(rawDataLines[1].split(" "), stringPart => Number.parseInt(stringPart));

  let currentExpected = 1; // This variable tracks the next number we anticipate in the sequence (1, 2, 3...).

  // Iterate over each individual value in the processed numeric array.
  for (let singleValue of numericValues) {
    // If the current number matches our expectation, we increment the expectation.
    if (singleValue === currentExpected) {
      currentExpected += 1;
    }
  }

  // Calculate the final result. If 'currentExpected' is still 1, it means no sequence was found, so return -1.
  // Otherwise, the result is the total number of items minus the count of sequence elements found.
  return currentExpected === 1 ? -1 : totalItems - currentExpected + 1;
};

// Main execution block: reads input from standard input, processes it, and prints the outcome.
console.log(solutionSolver(require("fs").readFileSync("/dev/stdin", "utf-8")
  .trim()
  .split("\n")
));