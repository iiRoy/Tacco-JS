'use strict';

// This function processes the main input data.
function processInput(rawData) {
  const lineSegments = rawData.split('\n'); // Split the raw input into lines.
  const numberString = lineSegments[0]; // The first line contains space-separated numbers.
  const iterationsCount = parseInt(lineSegments[1], 10); // The second line is the number of iterations.

  // Parse the numbers string into an array of integers.
  let currentValues = numberString.split(' ').map(strNum => parseInt(strNum, 10));

  // Perform the amplification operation 'iterationsCount' times.
  for (let loopCounter = 0; loopCounter < iterationsCount; loopCounter++) {
    currentValues = amplifyMaximum(currentValues); // Replace the array with the modified one.
  }

  // Calculate the sum of all elements in the final array and print it.
  console.log(currentValues.reduce((accumulator, elementValue) => accumulator + elementValue));
}

// This helper function finds the maximum value in an array, doubles it, and returns a new array.
function amplifyMaximum(inputArray) {
  const modifiedArray = [...inputArray]; // Create a shallow copy to avoid modifying the original array directly.
  const greatestValue = Math.max(...inputArray); // Find the largest number in the array.
  const maxIndexPosition = modifiedArray.indexOf(greatestValue); // Get the index of the first occurrence of the maximum.

  // Double the value at the found index.
  modifiedArray[maxIndexPosition] = greatestValue * 2;

  return modifiedArray; // Return the array with the doubled maximum.
}

// Execute the primary function with data read from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
