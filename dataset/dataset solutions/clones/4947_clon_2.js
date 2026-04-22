'use strict';

// Obtain input data from standard input stream
const inputData = require('node:fs')
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split('\n');

// Parse the first line for the array's dimension
const arrayDimension = Number(inputData[0]);

// Parse the second line for the array of numeric strings
const numericValuesAsStrings = inputData[1]
  .split(' ');

// Initialize a mapping for element positions
let elementPositions = [];
for (let currentPosition = 0; currentPosition < arrayDimension; currentPosition++) {
  // Store the actual value (converted to number) minus one as index,
  // and the current position as value.
  elementPositions[Number(numericValuesAsStrings[currentPosition]) - 1] = currentPosition;
}

// Initialize the total aggregated value and a processing queue
let totalAggregatedValue = 0;

// The queue holds segments: [segmentStart, segmentEnd, searchStartIndex]
const processingQueue = [[0, arrayDimension - 1, 0]];

// Process segments from the queue until it's empty
while (processingQueue.length > 0) {
  // Dequeue the next segment information
  const currentSegmentDetails = processingQueue.shift();

  // Extract segment boundaries and the current search index
  const segmentStart = currentSegmentDetails[0];
  const segmentEnd = currentSegmentDetails[1];
  let currentSearchIndex = currentSegmentDetails[2];

  // If the segment contains only one element, add its value directly
  if (segmentStart === segmentEnd) {
    totalAggregatedValue += Number(numericValuesAsStrings[segmentStart]);
    continue; // Move to the next iteration
  }

  // Find the smallest element (by its value, which is its index in `elementPositions`)
  // that falls within the current segment's boundaries.
  while (
    elementPositions[currentSearchIndex] < segmentStart ||
    elementPositions[currentSearchIndex] > segmentEnd
  ) {
    currentSearchIndex++; // Increment search index until a valid element is found
  }

  // The actual position of the found smallest element in the original array
  const pivotElementPosition = elementPositions[currentSearchIndex];

  // Calculate the contribution of this element to the total sum
  // This is the element's value multiplied by the number of subarrays it's the minimum of
  totalAggregatedValue +=
    Number(numericValuesAsStrings[pivotElementPosition]) *
    (pivotElementPosition - segmentStart + 1) *
    (segmentEnd - pivotElementPosition + 1);

  // Enqueue the left sub-segment if it exists
  if (segmentStart <= pivotElementPosition - 1) {
    processingQueue.push([segmentStart, pivotElementPosition - 1, currentSearchIndex + 1]);
  }

  // Enqueue the right sub-segment if it exists
  if (pivotElementPosition + 1 <= segmentEnd) {
    processingQueue.push([pivotElementPosition + 1, segmentEnd, currentSearchIndex + 1]);
  }
}

// Output the final calculated total aggregated value
console.log(totalAggregatedValue);