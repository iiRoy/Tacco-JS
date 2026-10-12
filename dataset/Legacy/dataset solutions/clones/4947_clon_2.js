'use strict';

// This script reads an array of numbers from standard input,
// then calculates a specific sum based on sub-array minimums.

// Import the Node.js file system module to read input synchronously.
const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// The first line contains the size of the array.
const arraySize = Number(inputData[0]);

// The second line contains space-separated numbers, which form the input array.
const inputArray = inputData[1].split(' ');

// Create a mapping from value (1-indexed) to its original index in the inputArray.
// This allows for efficient lookup of the position of the smallest element.
let positionMap = [];
for (let idx = 0; idx < arraySize; idx++) {
    // Values are 1-indexed, so we store the index at (value - 1).
    positionMap[Number(inputArray[idx]) - 1] = idx;
}

// Initialize the total sum that will be calculated.
let totalValue = 0;

// Initialize a queue for processing sub-ranges.
// Each element in the queue is an array: [start_index, end_index, min_value_search_start_index].
// The min_value_search_start_index helps optimize finding the minimum in a range.
let processingQueue = [[0, arraySize - 1, 0]];

// Process ranges from the queue until it becomes empty.
while (processingQueue.length > 0) {
    // Dequeue the current range information.
    let currentRangeInfo = processingQueue.shift();
    const rangeStart = currentRangeInfo[0];
    const rangeEnd = currentRangeInfo[1];
    let currentMinSearchIdx = currentRangeInfo[2]; // Index in positionMap to start looking for the minimum value.

    // If the current range contains only one element, add its value to the total sum.
    if (rangeStart === rangeEnd) {
        totalValue += Number(inputArray[rangeStart]);
        continue; // Move to the next range in the queue.
    }

    // Find the actual index of the smallest element within the current [rangeStart, rangeEnd].
    // We iterate through positionMap (which is sorted by value) until we find an element
    // whose original index falls within the current range.
    while (positionMap[currentMinSearchIdx] < rangeStart || positionMap[currentMinSearchIdx] > rangeEnd) {
        currentMinSearchIdx++;
    }
    const pivotIndex = positionMap[currentMinSearchIdx]; // This is the index of the minimum element in the current range.

    // Calculate the contribution of this minimum element to the total sum.
    // The minimum element contributes to all sub-arrays where it is the minimum.
    // The number of such sub-arrays is (number of possible left boundaries) * (number of possible right boundaries).
    // (pivotIndex - rangeStart + 1) is the count of valid left boundaries.
    // (rangeEnd - pivotIndex + 1) is the count of valid right boundaries.
    totalValue += Number(inputArray[pivotIndex]) * (pivotIndex - rangeStart + 1) * (rangeEnd - pivotIndex + 1);

    // If there is a sub-range to the left of the pivot element, add it to the queue.
    // The search for the minimum in this new sub-range can start from currentMinSearchIdx + 1,
    // as the current minimum has already been processed.
    if (rangeStart <= pivotIndex - 1) {
        processingQueue.push([rangeStart, pivotIndex - 1, currentMinSearchIdx + 1]);
    }

    // If there is a sub-range to the right of the pivot element, add it to the queue.
    // Similarly, the minimum search index is incremented.
    if (pivotIndex + 1 <= rangeEnd) {
        processingQueue.push([pivotIndex + 1, rangeEnd, currentMinSearchIdx + 1]);
    }
}

// Output the final calculated total sum to standard output.
console.log(totalValue);
