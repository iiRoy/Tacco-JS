'use strict'; // Enforce stricter parsing and error handling for better code quality.

// Acquire the file system module for reading input.
const fileSystemAccess = require('fs');

// Read the entire content from standard input, decode it as UTF-8,
// remove any leading or trailing whitespace, and then split it into an
// array of strings, where each string represents a line.
const inputDataLines = fileSystemAccess.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Convert the first line from a string to a numeric value, which represents
// the total count of elements in the main array.
const totalElementCount = Number(inputDataLines[0]);

// Split the second line of input into an array of strings. Each string
// in this array is a number that will be processed later.
const numericValueStrings = inputDataLines[1].split(' ');

// Initialize an array that will serve as a mapping from a value (minus 1,
// assuming 1-indexed values in the problem) to its original index in the
// 'numericValueStrings' array. This helps in quickly finding the original
// position of a value given its magnitude.
let valueToIndexMapping = [];
for (let currentArrayPosition = 0; currentArrayPosition < totalElementCount; currentArrayPosition++) {
  // Parse the string value to an integer, then subtract one to align with
  // zero-indexed array access for the mapping.
  const parsedValue = parseInt(numericValueStrings[currentArrayPosition], 10);
  valueToIndexMapping[parsedValue - 1] = currentArrayPosition;
}


// Initialize a variable to accumulate the final result.
let accumulatedSumResult = 0;
// Initialize a queue to manage the sub-ranges that need processing.
// Each item in the queue is an array: [start_boundary, end_boundary, value_search_pointer].
// The initial item covers the entire input array.
let processingRangeQueue = [[0, totalElementCount - 1, 0]];

// Continue processing as long as there are ranges in the queue.
while (processingRangeQueue.length > 0) {
  // Dequeue the next range definition for processing.
  let currentRangeDefinition = processingRangeQueue.shift();

  // Extract the lower and upper bounds of the current sub-array range.
  let rangeLowerBound = currentRangeDefinition[0];
  let rangeUpperBound = currentRangeDefinition[1];
  // Extract the pointer used to search for the smallest element's original index.
  let smallestValueSearchPointer = currentRangeDefinition[2];

  // Base condition: If the range contains only a single element.
  if (rangeLowerBound === rangeUpperBound) {
    // Add the numeric value of this single element to the total sum.
    accumulatedSumResult += Number(numericValueStrings[rangeLowerBound]);
    continue; // Move to the next range in the queue.
  }

  // Find the smallest value (by magnitude) whose *original index* falls
  // within the current [rangeLowerBound, rangeUpperBound] sub-array.
  // The 'smallestValueSearchPointer' iterates through 'valueToIndexMapping',
  // which is implicitly sorted by value magnitude.
  while (
    valueToIndexMapping[smallestValueSearchPointer] < rangeLowerBound ||
    valueToIndexMapping[smallestValueSearchPointer] > rangeUpperBound
  ) {
    smallestValueSearchPointer++; // Increment the pointer to check the next smallest value.
  }

  // The 'centralElementOriginalPosition' is the actual index in the original
  // 'numericValueStrings' array where the smallest element for the current
  // range is located.
  let centralElementOriginalPosition = valueToIndexMapping[smallestValueSearchPointer];

  // Calculate the contribution of this 'centralElementOriginalPosition' to the total sum.
  // This calculation is specific to problems like "sum of minimums in all sub-arrays".
  // It multiplies the element's value by the number of sub-arrays it can be the minimum in.
  // (centralElementOriginalPosition - rangeLowerBound + 1) represents the number of possible
  // start points for a sub-array that has this element as its minimum and ends at or before it.
  // (rangeUpperBound - centralElementOriginalPosition + 1) represents the number of possible
  // end points for a sub-array that has this element as its minimum and starts at or after it.
  accumulatedSumResult +=
    Number(numericValueStrings[centralElementOriginalPosition]) *
    (centralElementOriginalPosition - rangeLowerBound + 1) *
    (rangeUpperBound - centralElementOriginalPosition + 1);

  // If there's a valid sub-range to the left of the central element,
  // add it to the queue for further processing. The 'smallestValueSearchPointer'
  // is incremented because the current smallest element has been processed.
  if (rangeLowerBound <= centralElementOriginalPosition - 1) {
    processingRangeQueue.push([rangeLowerBound, centralElementOriginalPosition - 1, smallestValueSearchPointer + 1]);
  }

  // If there's a valid sub-range to the right of the central element,
  // add it to the queue.
  if (centralElementOriginalPosition + 1 <= rangeUpperBound) {
    processingRangeQueue.push([centralElementOriginalPosition + 1, rangeUpperBound, smallestValueSearchPointer + 1]);
  }
}

// Print the final calculated accumulated sum to standard output.
console.log(accumulatedSumResult);