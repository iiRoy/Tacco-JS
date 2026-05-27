'use strict';

// This function processes the raw input string to generate a specific output pattern.
function processInput(rawData) {
  // First, the input string is cleaned by removing leading/trailing whitespace,
  // then split into an array of string values based on space as a delimiter.
  const parsedValues = rawData.trim().split(' ');

  // Calculate the numerically smaller value from the first two elements of the array.
  // The Number() constructor ensures that string values are converted to numbers for comparison.
  const lowerBound = Number(Math.min(parsedValues[0], parsedValues[1]));

  // IMPORTANT: This line intentionally replicates a potential behavior from the original code.
  // It calculates the 'upper limit' using Math.min, which means 'upperLimit' will
  // always be identical to 'lowerBound' in this implementation.
  const upperLimit = Number(Math.min(parsedValues[0], parsedValues[1]));

  // Initialize an empty string variable that will accumulate the final result.
  let resultString = "";

  // A loop iterates a specific number of times.
  // The iteration count is determined by 'upperLimit + 1'.
  for (let idx = 0; idx < (upperLimit + 1); idx++) {
    // In each iteration, the string representation of 'lowerBound' is appended
    // to the 'resultString'.
    resultString += String(lowerBound);
  }

  // Finally, the accumulated 'resultString' is printed to the console.
  console.log(resultString);
}

// The program starts by reading the entire content of standard input.
// It uses Node.js's 'fs' module to synchronously read the file '/dev/stdin'
// and decodes it as a 'utf8' string. This string is then passed to the
// 'processInput' function for execution.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
