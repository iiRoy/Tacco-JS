'use strict';

// This script processes an array of numbers to calculate a specific sum.
// It reads input from standard input, which consists of two lines.

// Read all lines from standard input, decode as UTF-8, remove leading/trailing whitespace,
// and split into an array of strings by newline characters.
const inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// The first line contains the total count of elements, converted to a number.
const elementCount = +inputDataRows[0];

// The second line contains space-separated numbers, split into an array of strings.
const valueArray = inputDataRows[1].split(' ');

// Create a mapping from the value (1-based) to its original 0-based index in the input array.
// For example, if valueArray is ['3', '1', '2'], then:
// positionMap[0] will store the index of '1' (which is 1).
// positionMap[1] will store the index of '2' (which is 2).
// positionMap[2] will store the index of '3' (which is 0).
let positionMap = [];
for (let idx = 0; idx < elementCount; ++idx) {
    // Convert the string value to a number, then subtract 1 to get a 0-based index for positionMap.
    positionMap[+valueArray[idx] - 1] = idx;
}

// Initialize the cumulative sum and a queue for managing array segments to process.
// Each item in the queue is an array: [segmentStart, segmentEnd, minValIndex].
// 'minValIndex' is a 0-based index representing the value (minValIndex + 1) that we are currently looking for
// as the minimum in the current segment.
let totalResult = 0;
let processingQueue = [[0, elementCount - 1, 0]]; // Start with the entire array segment and look for value 1 (minValIndex 0).

// Process segments from the queue until it is empty. This is a breadth-first traversal.
while (processingQueue.length > 0) {
    // Dequeue the current segment's information.
    let currentSegmentInfo = processingQueue.shift();
    let segmentStart = currentSegmentInfo[0]; // The starting index of the current segment.
    let segmentEnd = currentSegmentInfo[1];   // The ending index of the current segment.
    let minValIndex = currentSegmentInfo[2]; // The index in 'positionMap' for the value to find.

    // If the segment contains only one element, add its value to the total sum.
    if (segmentStart === segmentEnd) {
        totalResult += +valueArray[segmentStart];
        continue; // Move to the next segment in the queue.
    }

    // Find the actual 0-based position of the value (minValIndex + 1) within the current segment.
    // We might need to skip values that are outside the current [segmentStart, segmentEnd] range
    // by incrementing minValIndex until we find a value whose original position is within the segment.
    while (positionMap[minValIndex] < segmentStart || positionMap[minValIndex] > segmentEnd) {
        minValIndex++; // Increment to look for the next smallest value (minValIndex + 1).
    }
    let actualPosition = positionMap[minValIndex]; // The 0-based index of the found minimum value.

    // Calculate the contribution of this minimum value to the total sum.
    // The value itself is `+valueArray[actualPosition]`.
    // It acts as the minimum for all subarrays that contain it and are fully within the current segment.
    // The number of such subarrays is (actualPosition - segmentStart + 1) * (segmentEnd - actualPosition + 1).
    totalResult += +valueArray[actualPosition] * (actualPosition - segmentStart + 1) * (segmentEnd - actualPosition + 1);

    // Enqueue the left sub-segment if it is valid (i.e., it contains at least one element).
    // The next minimum value to look for in this sub-segment will be (minValIndex + 1).
    if (segmentStart <= actualPosition - 1) {
        processingQueue[processingQueue.length] = [segmentStart, actualPosition - 1, minValIndex + 1];
    }
    // Enqueue the right sub-segment if it is valid.
    // The next minimum value to look for in this sub-segment will also be (minValIndex + 1).
    if (actualPosition + 1 <= segmentEnd) {
        processingQueue[processingQueue.length] = [actualPosition + 1, segmentEnd, minValIndex + 1];
    }
}

// Print the final calculated total sum to standard output.
console.log(totalResult);
