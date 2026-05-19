function ProcessInput(rawData) {
  'use strict';
  // Parse the input string: trim whitespace, split by spaces, and convert each part to an integer.
  const parsedNumbers = rawData.trim().split(' ').map(numStr => parseInt(numStr, 10));

  // Calculate the integer quotient of the first number divided by the sum of the second and third.
  const quotient = Math.floor(parsedNumbers[0] / (parsedNumbers[1] + parsedNumbers[2]));

  // Determine the remainder of the division.
  const remainder = parsedNumbers[0] % (parsedNumbers[1] + parsedNumbers[2]);

  // Compute an intermediate value based on a conditional check.
  // If the second number is less than the remainder, use the second number; otherwise, use the remainder.
  const intermediateValue = (parsedNumbers[1] < remainder) ? parsedNumbers[1] : remainder;

  // Output the final computed result to the console.
  console.log(quotient * parsedNumbers[1] + intermediateValue);
}

// Read the entire content from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
