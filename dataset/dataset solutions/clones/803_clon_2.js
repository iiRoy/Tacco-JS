/*
 * This module processes input data to calculate a specific score.
 * Original author: hiroqn, 2013-10-04.
 */

var fileSystem = require('fs');

// Determine the size of the standard input stream
var dataSize = fileSystem.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data
var dataBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer
var readBytesCount = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);

// Convert buffer to string, split by newlines, and store as an array of lines
var linesOfInput = dataBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Declare variables for processing each input set
var currentLineParts, numEntries, targetIndex, penaltyPercentage, scoreList;

/**
 * Computes a weighted score based on an array of values.
 * @param {number} num - Not directly used in calculation, but part of signature.
 * @param {number} targetIdx - The index of the value in valueArray to use as a divisor.
 * @param {number} penaltyPct - The percentage to subtract from 100 before multiplying the sum.
 * @param {number[]} valueArray - An array of numeric values.
 * @returns {number} The calculated integer score.
 */
function calculateScore(num, targetIdx, penaltyPct, valueArray) {
  // If the target value is zero, the score is zero to avoid division by zero.
  if (valueArray[targetIdx] === 0) {
    return 0;
  }

  // Calculate the sum of all values in the array.
  var totalValue = valueArray.reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  });

  // Apply the penalty percentage to the total sum.
  totalValue *= (100 - penaltyPct);

  // Divide the adjusted sum by the target value and truncate to an integer.
  return ~~(totalValue / valueArray[targetIdx]);
}

// Process input lines until the termination condition '0 0 0' is encountered.
while (linesOfInput[0] !== '0 0 0') {
  // Extract the first line, split it by spaces, and store the parts.
  currentLineParts = linesOfInput.shift().split(' ');

  // Initialize an empty array for scores.
  scoreList = [];

  // Parse the numerical values from the current line parts.
  numEntries = currentLineParts[0] - 0; // Convert string to number
  targetIndex = currentLineParts[1] - 1; // Convert string to number and adjust for 0-based index
  penaltyPercentage = currentLineParts[2] - 0; // Convert string to number

  // Read 'numEntries' subsequent lines as individual scores into the scoreList array.
  for (var idx = 0; idx < numEntries; idx++) {
    scoreList[idx] = linesOfInput.shift() - 0; // Convert string to number
  }

  // Calculate and print the score for the current set of inputs.
  console.log(calculateScore(numEntries, targetIndex, penaltyPercentage, scoreList));
}
