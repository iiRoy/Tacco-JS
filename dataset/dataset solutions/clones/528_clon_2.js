const fileSystemUtility = require('fs'); // Obtain the Node.js File System module.
const standardInputPath = '/dev/stdin';     // Define the standard input file path.
const utf8Encoding = 'utf8';                 // Specify the character encoding for reading.

// Read the raw input data from the standard input stream synchronously.
let rawDataStream = fileSystemUtility.readFileSync(standardInputPath, utf8Encoding);

// Process the raw input stream: trim whitespace and split into an array of lines.
let lineSegments = rawDataStream
  .trim()
  .split("\n");

// Extract the first line, which contains three configuration parameters (N, M, P).
// Split these parameters by space and convert them to numbers.
let configValues = lineSegments
  .shift()
  .split(" ")
  .map(Number);

// Assign the parsed configuration values to meaningfully named variables.
// upperLimitAdjusted corresponds to (n - 1) from the original problem.
let upperLimitAdjusted = configValues[0] - 1;
// totalElements corresponds to 'm', indicating how many subsequent lines to process.
let totalElements = configValues[1];
// referencePoint corresponds to 'p', a critical value for calculations.
let referencePoint = configValues[2];

// Initialize an array to store numerical elements that meet specific criteria.
let relevantNumbers = [];

// Iterate 'totalElements' times to process subsequent lines of input.
for (let loopCounter = 0; loopCounter < totalElements; loopCounter++) {
  // Extract and convert the next line from 'lineSegments' to a numerical value.
  let fetchedValue = Number(lineSegments.shift());

  // If the fetched value is not equal to the 'referencePoint', add it to our collection.
  if (fetchedValue !== referencePoint) {
    relevantNumbers.push(fetchedValue);
  }
}

// Ensure the 'referencePoint' itself is included in the array for sorting and calculation.
relevantNumbers = relevantNumbers.concat(referencePoint);

// Sort the 'relevantNumbers' array in ascending order numerically.
relevantNumbers.sort(function(firstItemForComparison, secondItemForComparison) {
  return firstItemForComparison - secondItemForComparison;
});

// Initialize 'minimumCalculatedValue' to a very large number,
// so any valid calculation will be smaller.
let minimumCalculatedValue = Infinity;

// Iterate through the sorted array to perform complex calculations and find the true minimum.
relevantNumbers.forEach(function(currentValueInLoop, currentIndexInLoop) {

  // Scenario 1: The current value is less than or equal to the reference point.
  if (currentValueInLoop <= referencePoint) {
    // This calculation requires a previous element, so skip the first element (index 0).
    if (currentIndexInLoop !== 0) {
      minimumCalculatedValue = Math.min(
        minimumCalculatedValue,
        (referencePoint - currentValueInLoop) * 2 + (upperLimitAdjusted - referencePoint + 1) + relevantNumbers[currentIndexInLoop - 1]
      );
    }
  }

  // Scenario 2: The current value is greater than or equal to the reference point.
  if (referencePoint <= currentValueInLoop) {
    // This calculation requires a next element, so skip the last element.
    if (currentIndexInLoop !== relevantNumbers.length - 1) {
      minimumCalculatedValue = Math.min(
        minimumCalculatedValue,
        (currentValueInLoop - referencePoint) * 2 + referencePoint + (upperLimitAdjusted - relevantNumbers[currentIndexInLoop + 1] + 1)
      );
    }
  }
});

// Output the final computed minimum value, scaled by a factor of 100.
console.log(minimumCalculatedValue * 100);