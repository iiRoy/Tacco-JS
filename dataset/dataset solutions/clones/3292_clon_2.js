'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf8');
// This section contains utility methods
const findHighestElement = (numberSequence) => {
  let traversalIndex = numberSequence.length;
  let currentMaximum = -Infinity; // Initialize with the smallest possible value
  while (traversalIndex--) {
    if (numberSequence[traversalIndex] > currentMaximum) {
      currentMaximum = numberSequence[traversalIndex];
    }
  }
  return currentMaximum;
};
const findLowestElement = (numberSequence) => {
  let traversalIndex = numberSequence.length;
  let currentMinimum = Infinity; // Initialize with the largest possible value
  while (traversalIndex--) {
    if (numberSequence[traversalIndex] < currentMinimum) {
      currentMinimum = numberSequence[traversalIndex];
    }
  }
  return currentMinimum;
};
const ProcessInputData = (rawInputText) => {
  // The first line of input becomes the first element of the array, and so on.
  rawInputText = rawInputText.split("\n");

  // totalElements will hold the count of items from the first line
  let totalElements = parseInt(rawInputText[0]);

  // heightMeasurements stores the numerical values from the second line
  let heightMeasurements = (rawInputText[1].split(" ").map(Number));
  let loopCounter = totalElements;
  // The following commented block was for generating random data, now disabled.
  // while (loopCounter--) {
  //   heightMeasurements[loopCounter] = Math.floor(Math.random() * 100);
  // }

  // Initialize an array to store the calculated minimum costs
  let computedCosts = new Array(totalElements).fill(Infinity);
  console.log(heightMeasurements); // Output the parsed height values for debugging

  computedCosts[0] = 0; // The cost to reach the first element is zero
  computedCosts[1] = Math.abs(heightMeasurements[0] - heightMeasurements[1]); // Cost to reach the second element

  // Iterate through the remaining elements to calculate minimum costs using dynamic programming
  for (loopCounter = 2; loopCounter < totalElements; loopCounter++) {
    computedCosts[loopCounter] = Math.min(
      computedCosts[loopCounter - 2] + Math.abs(heightMeasurements[loopCounter] - heightMeasurements[loopCounter - 2]),
      computedCosts[loopCounter - 1] + Math.abs(heightMeasurements[loopCounter] - heightMeasurements[loopCounter - 1])
    );
  }
  // Remember to use parseInt for converting string values to integers.
  console.log(computedCosts, computedCosts[totalElements - 1]); // Display all costs and the final minimum cost
};
// Do not modify the lines below this point; they handle standard input/output and call the primary processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());