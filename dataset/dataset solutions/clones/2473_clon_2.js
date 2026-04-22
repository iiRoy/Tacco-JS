'use strict'; // Enforce strict mode for cleaner code.

/**
 * Main function to process the input data and calculate the result.
 * It finds factors of a given number and determines a specific minimum value.
 * @param {string[]} dataLines - An array of strings, where the first element contains the number to process.
 */
const analyzeInput = dataLines => {
  // Parse the first line of input to get the target number.
  const primaryNumber = parseInt(dataLines[0]);

  // Initialize a variable to store the smallest calculated value found so far.
  // Set it to a very large number initially to ensure any valid calculation will be smaller.
  let smallestResult = 100000000000000000;

  // Iterate through potential factors up to the square root of the primary number.
  // This optimization covers both factors (i and n/i) efficiently.
  for (let currentDivisor = 1; currentDivisor <= Math.floor(Math.sqrt(primaryNumber)); currentDivisor++) {
    // Check if the currentDivisor is a perfect factor of the primaryNumber.
    if (primaryNumber % currentDivisor === 0) {
      // If it's a factor, calculate the expression: currentDivisor - 2 + (primaryNumber / currentDivisor).
      // Compare this calculated value with the smallestResult found so far.
      if (smallestResult > currentDivisor - 2 + primaryNumber / currentDivisor) {
        // If the new calculation is smaller, update smallestResult.
        smallestResult = currentDivisor - 2 + primaryNumber / currentDivisor;
      }
    }
  }

  // Output the final smallest calculated result to the console.
  console.log(smallestResult);
};

// Read input from standard input, decode it as UTF-8, and split it into lines.
// Then, pass the array of lines to the main processing function.
analyzeInput( require("fs").readFileSync("/dev/stdin", "utf8").split('\n') );