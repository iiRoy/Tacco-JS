"use strict";

/*
 * This module processes an input string to find specific integer solutions.
 * It searches for three positive integers (h, n, w) that satisfy a given equation
 * derived from the input target value.
 */
const processInput = (inputData) => {
  // Clean up the raw input: remove leading/trailing whitespace and split by newline.
  let processedInput = inputData.trim().split("\n");

  // Parse the first line of input as the target integer value.
  const targetValue = parseInt(processedInput[0], 10); // Using radix 10 for clarity.

  // Iterate through possible values for the first variable, 'heightVar'.
  // The problem constraints typically suggest a range up to 3500.
  for (let heightVar = 1; heightVar <= 3500; heightVar++) {
    // For each 'heightVar', iterate through possible values for the second variable, 'numeratorVar'.
    for (let numeratorVar = 1; numeratorVar <= 3500; numeratorVar++) {
      // Calculate the potential value for the third variable, 'resultantVar',
      // based on the equation: N * h * n / (4 * h * n - N * n - N * h)
      // This formula is derived from 1/N = 1/h + 1/n + 1/w
      let resultantVar =
        (targetValue * heightVar * numeratorVar) /
        (4 * heightVar * numeratorVar -
          targetValue * numeratorVar -
          targetValue * heightVar);

      // Check if 'resultantVar' is a positive integer.
      // 'w % 1 === 0' efficiently checks for an integer value.
      // We also need to ensure it's positive, as per problem constraints.
      if (resultantVar > 0 && resultantVar % 1 === 0) {
        // If a valid integer solution is found, print it to the console
        // in the format "h n w" and then exit the function.
        console.log(
          heightVar + " " + numeratorVar + " " + resultantVar
        );
        return; // Terminate execution after finding the first solution.
      }
    }
  }
};

// Read the input from standard input and pass it to the processing function.
// This assumes the script is run in an environment where '/dev/stdin' is available
// for reading standard input, common in competitive programming setups.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
