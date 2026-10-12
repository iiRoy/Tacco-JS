'use strict';

// This function processes the input data to find a specific minimum value.
const processInputData = inputLines => {
  // Parse the first line of input as an integer.
  const inputNum = parseInt(inputLines[0]);

  // Initialize a variable to store the minimum calculated value.
  // Using a very large number as an initial upper bound.
  let resultVal = 1e13; // Represents 10,000,000,000,000

  // Iterate from 1 up to the square root of the input number.
  // This optimization helps find divisors efficiently.
  for (let currentDivisor = 1; currentDivisor <= Math.floor(Math.sqrt(inputNum)); currentDivisor++) {
    // Check if 'currentDivisor' is a perfect divisor of 'inputNum'.
    if (inputNum % currentDivisor === 0) {
      // If it is a divisor, calculate a potential new minimum value.
      // The formula is currentDivisor - 2 + inputNum / currentDivisor.
      // Compare it with the current 'resultVal' and update if smaller.
      if (resultVal > currentDivisor - 2 + inputNum / currentDivisor) {
        resultVal = currentDivisor - 2 + inputNum / currentDivisor;
      }
    }
  }

  // Output the final calculated minimum value to the console.
  console.log(resultVal);
};

// Read input from standard input, decode as UTF-8, and split by newlines.
// Then, pass the array of lines to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
