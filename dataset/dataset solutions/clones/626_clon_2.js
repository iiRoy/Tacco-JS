/*
 * This script processes numerical data from standard input.
 * It reads a sequence of numbers, duplicates them to create a larger array,
 * and then performs calculations to find a specific maximum value based on segment sums.
 */

// Obtain the raw data from the standard input stream.
const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input string into an array of individual lines.
const textRows = dataSource.split('\n');

// The first line contains the count of original numbers, converted to an integer.
const arraySize = Number(textRows[0]);

// Initialize an array to hold the processed numerical sequence.
const dataSequence = [];

// Declare loop counters for various iterations.
let outerIdx, innerIdx, subIdx;

// Populate the data sequence by reading numbers from input lines.
// Each number is duplicated twice to extend the sequence (original, original, original).
for (outerIdx = 0; outerIdx < arraySize; outerIdx++) {
  // Convert the input line (after the first one) to a number.
  dataSequence[outerIdx] = Number(textRows[outerIdx + 1]);
  // Duplicate the current number at an offset.
  dataSequence[outerIdx + arraySize] = dataSequence[outerIdx];
  // Duplicate it again at a further offset.
  dataSequence[outerIdx + arraySize + arraySize] = dataSequence[outerIdx];
}

// Define a simple function for summing two numbers.
const additionOp = function (accumulator, currentVal) {
  return accumulator + currentVal;
};

// Initialize variables to store the maximum and minimum values found during calculations.
let greatestValue = 0;
let lowestValue = 0;

// Temporary variable to hold the sum of a current segment, and an array for remaining elements.
let currentSegmentSum = 0, remainingSegment;

// Main processing loop: Iterate through possible lengths of the first segment.
// The loop runs from 1 up to (arraySize - 3) to ensure valid segment lengths.
for (outerIdx = 1; outerIdx < arraySize - 2; outerIdx++) {
  // Inner loop: Iterate through all possible starting positions for the first segment.
  for (innerIdx = 0; innerIdx < arraySize; innerIdx++) {
    // Calculate the sum of the first segment using 'slice' and 'reduce'.
    currentSegmentSum = dataSequence.slice(innerIdx, innerIdx + outerIdx).reduce(additionOp, 0);

    // Extract the remaining part of the sequence after the first segment.
    remainingSegment = dataSequence.slice(innerIdx + outerIdx, innerIdx + arraySize);

    // Innermost loop: Iterate through possible split points for the remaining segment.
    for (subIdx = 1; subIdx < remainingSegment.length; subIdx++) {
      // Split the remaining segment into two parts and find the minimum of their sums.
      lowestValue = Math.min(
        remainingSegment.slice(0, subIdx).reduce(additionOp, 0),
        remainingSegment.slice(subIdx, remainingSegment.length).reduce(additionOp, 0)
      );

      // If the current segment sum is less than or equal to the minimum of the two remaining parts' sums,
      // then update the overall greatest value found so far.
      if (currentSegmentSum <= lowestValue) {
        greatestValue = Math.max(greatestValue, currentSegmentSum);
      }
    }
  }
}

// Output the final calculated greatest value to the console.
console.log(greatestValue);