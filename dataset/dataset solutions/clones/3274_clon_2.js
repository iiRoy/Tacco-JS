"use strict";

// Enable standard input processing
process.stdin.resume();
process.stdin.setEncoding("utf8");

// Array to store parsed input lines
let inputDataRows = [];

// Create an interface for reading input line by line
const inputProcessor = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each line of input
inputProcessor.on("line", (currentLineText) => {
  // Split the line by whitespace, parse each part as an integer, and add to our data rows
  inputDataRows.push(currentLineText.split(/\s/).map((parsedValue) => parseInt(parsedValue, 10)));
});

// Event listener for when input stream closes
inputProcessor.on("close", () => {
  // Extract problem parameters from the collected input
  const elementCount = inputDataRows.shift(); // First line: N
  const firstArray = inputDataRows.shift();   // Second line: array A
  const secondArray = inputDataRows.shift();  // Third line: array B

  // Calculate the sum of elements in the first array
  const firstArrayTotal = firstArray.reduce((accumulatorVal, currentNum) => accumulatorVal + currentNum);
  // Calculate the sum of elements in the second array
  const secondArrayTotal = secondArray.reduce((accumulatedVal, itemVal) => accumulatedVal + itemVal);

  // If the sum of the first array is less than the second, it's impossible
  if (firstArrayTotal < secondArrayTotal) {
    console.log(-1);
    return; // Exit early
  }

  // Initialize variables for tracking differences
  let negativeDiffCount = 0;
  let positiveDifferences = [];
  let sumOfPositiveDiffs = 0;
  let sumOfNegativeDiffs = 0;
  let positiveDiffIndex = 0;

  // Iterate through the arrays to find differences
  for (let loopIterator = 0; loopIterator < elementCount; loopIterator++) {
    const currentDifference = firstArray[loopIterator] - secondArray[loopIterator];
    if (currentDifference > 0) {
      // If difference is positive, store it
      positiveDifferences.push(currentDifference);
    } else {
      // If difference is zero or negative, increment count and add to negative sum
      negativeDiffCount += 1;
      sumOfNegativeDiffs += currentDifference;
    }
  }

  // Sort positive differences in descending order to prioritize larger values
  positiveDifferences.sort((valA, valB) => valB - valA);

  // While the combined sum of positive and negative differences is still negative,
  // add the largest available positive differences
  while (sumOfPositiveDiffs + sumOfNegativeDiffs < 0) {
    sumOfPositiveDiffs += positiveDifferences[positiveDiffIndex];
    positiveDiffIndex++;
  }

  // The result is the count of negative differences plus the number of positive differences used
  console.log(negativeDiffCount + positiveDiffIndex);
});
