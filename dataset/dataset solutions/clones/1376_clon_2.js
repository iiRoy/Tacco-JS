/*
 * This module processes numerical input from standard input
 * to find specific combinations of numbers.
 */
function obtainInput() {
  // Utilize Node.js 'fs' module to read from the standard input stream.
  const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
  // Split the entire input string into an array of individual lines.
  // Handles both Unix-style (\n) and Windows-style (\r\n) line endings.
  return inputData.split(/\n\r?/);
}

// Iterate over each line obtained from the standard input.
// The 'every' method continues as long as the callback returns a truthy value.
obtainInput().every(function(currentLine) {
  // Parse the current line, splitting it by spaces.
  const partsArray = currentLine.split(' ');
  // Convert the first part to a number, representing the upper bound (N).
  const upperBound = +partsArray[0];
  // Convert the second part to a number, representing the target sum (X).
  const targetSum = +partsArray[1];
  // Initialize a counter for valid triplets.
  let countTriplets = 0;

  // Outer loop for the first number in the triplet.
  // It ranges from 1 up to 'upperBound'.
  for (let firstNum = 1; firstNum <= upperBound; firstNum++) {
    // Middle loop for the second number.
    // It starts from 'firstNum' to ensure distinct numbers and order.
    for (let secondNum = firstNum; secondNum <= upperBound; secondNum++) {
      // Skip if the second number is the same as the first, as triplets must be distinct.
      if (secondNum === firstNum) {
        continue;
      }
      // Inner loop for the third number.
      // It starts from 'secondNum'.
      for (let thirdNum = secondNum; thirdNum <= upperBound; thirdNum++) {
        // Skip if the third number is the same as the second or first.
        // Ensures all three numbers in the triplet are distinct.
        if (thirdNum === secondNum || thirdNum === firstNum) {
          continue;
        }
        // Check if the sum of the three distinct numbers equals the 'targetSum'.
        // The '!!' converts the boolean result of the comparison to 0 or 1.
        if (firstNum + secondNum + thirdNum === targetSum) {
          countTriplets++; // Increment the counter if a valid triplet is found.
        }
      }
    }
  }

  // Check for the termination condition: if both N and X are zero.
  // If N and X are both 0, return false to stop the 'every' iteration.
  // Otherwise, print the 'countTriplets' to the console.
  // console.log(countTriplets) returns undefined, so !console.log(countTriplets) evaluates to true,
  // allowing 'every' to continue for subsequent lines.
  return !upperBound && !targetSum ? false : !console.log(countTriplets);
});
