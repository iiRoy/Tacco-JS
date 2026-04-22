// This module provides utilities for number decomposition and input processing.

function primeFactors(inputNumber) {
  let currentDivisor = 2; // Initialize the smallest possible prime divisor.
  let remainderValue = inputNumber; // The value whose prime factors are being extracted.
  const resultList = []; // A collection to hold all identified prime factors.

  while (remainderValue > 1) { // Continue the process until the value is fully factored.
    if (remainderValue % currentDivisor === 0) { // Check if the current divisor divides evenly.
      remainderValue /= currentDivisor; // Reduce the remainder by this factor.
      resultList.push(currentDivisor); // Add the found prime factor to the list.
    } else {
      currentDivisor++; // If not divisible, increment to the next potential divisor.
    }

    // Performance optimization: if the square of the current divisor
    // exceeds the remaining value, the remainder itself must be a prime factor.
    if (currentDivisor ** 2 > remainderValue) {
      resultList.push(remainderValue); // Include the final prime factor.
      break; // Terminate the factorization process.
    }
  }

  return resultList; // Return the comprehensive list of prime factors.
}

function ProcessInput(rawData) {
  rawData = rawData.split("\n"); // Segment the raw input string into lines.

  // Eliminate any empty line that might be present at the end of the input.
  if (rawData[rawData.length - 1] === '') {
    rawData.pop();
  }

  // Extract and convert numerical parameters from the initial line of input.
  const inputLineParts = rawData[0].split(' ');
  let firstValue = inputLineParts[0] - 0; // Convert string to numeric type.
  let secondValue = inputLineParts[1] - 0; // Convert string to numeric type.
  let thirdValue = inputLineParts[2] - 0; // Convert string to numeric type.

  // Execute a trigonometric calculation and display the computed result.
  console.log(180 / Math.PI * Math.atan(firstValue * secondValue * secondValue / thirdValue / 2));
}


/*  The subsequent line is responsible for handling standard input/output operations; direct alteration is not advised.  */
ProcessInput(
  require("fs").readFileSync("/dev/stdin", "utf8")
);