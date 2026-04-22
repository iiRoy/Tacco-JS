'use strict';

/*
 * This module processes an input string to calculate a specific count.
 * The calculation involves iterating through a range and performing nested operations
 * based on divisibility and stepping.
 */
const processInput = (dataString) => {
  // Parse the input string into an array of numbers
  const parsedNumbers = dataString.split(' ').map(val => Number(val));

  // Extract key numerical parameters from the parsed array
  const beginPoint = parsedNumbers[0]; // The starting value for the range
  const finishPoint = parsedNumbers[1]; // The ending value for the range
  const stepSize = parsedNumbers[2];     // The divisor and step increment value

  let totalMatches = 0; // Initialize a counter for the occurrences

  // Outer loop: Iterate from the beginning to the end point
  for (let currentNum = beginPoint; currentNum <= finishPoint; currentNum++) {
    // Check if the current number is divisible by the step size
    if (currentNum % stepSize === 0) {
      // Inner loop: If divisible, start from currentNum and step by stepSize
      // This loop effectively jumps 'currentNum' forward to 'innerNum'
      for (let innerNum = currentNum; innerNum <= finishPoint; innerNum += stepSize) {
        totalMatches++; // Increment the match counter
        currentNum = innerNum; // Update the outer loop iterator to the inner loop's current value
      }
    }
  }
  // Output the final calculated count to the console
  console.log(totalMatches);
};

// Execute the main processing function with data read from standard input
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));