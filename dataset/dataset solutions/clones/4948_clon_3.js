'use strict';

// This module provides file system utilities to read standard input.
const fileSystem = require('fs');

// Read all input lines from standard input, remove leading/trailing whitespace, and split into an array of lines.
const inputDataLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// The first line contains the count of numbers in the array.
// Convert it to an integer.
const arraySize = Number(inputDataLines[0]);

// The second line contains space-separated numbers.
// Split them and convert each string representation to an integer.
// For robustness, `parseInt` with a radix is preferred over unary `+`.
const sourceNumbers = inputDataLines[1].split(' ').map(element => parseInt(element, 10));

// --- Preprocessing Step: Map values to their first occurrence indices ---
// This map stores the original index for each value (value - 1 as key).
// For example, if array A is [3, 1, 2], then valueToOriginalIndexMap[0] (for value 1) would be 1,
// valueToOriginalIndexMap[1] (for value 2) would be 2, and valueToOriginalIndexMap[2] (for value 3) would be 0.
// Pre-allocate the array to its known size for potential minor performance gains.
const valueToOriginalIndexMap = new Array(arraySize);
for (let currentIdx = 0; currentIdx < arraySize; ++currentIdx) {
    // Convert string number to integer, then subtract 1 to use as a 0-based index.
    const numericValue = parseInt(sourceNumbers[currentIdx], 10);
    // Basic validation: ensure the value is within expected bounds (1 to arraySize).
    if (numericValue >= 1 && numericValue <= arraySize) {
        valueToOriginalIndexMap[numericValue - 1] = currentIdx;
    } else {
        // In a real-world scenario, robust error handling or a warning might be appropriate here.
        // For this problem, we assume valid input per constraints.
        // console.warn(`Input value ${numericValue} at index ${currentIdx} is out of expected range [1, ${arraySize}].`);
    }
}

// --- Main Calculation Logic: Sum of Minimums of All Subarrays ---
// This algorithm uses a breadth-first search (BFS) approach with a queue to process array segments.
// Each element in the `processingQueue` represents a segment of the array and the
// starting point for finding its minimum value.
// The format of a queue element is: [segmentStart, segmentEnd, minValSearchIndex]
// `minValSearchIndex` refers to an index in `valueToOriginalIndexMap` (which corresponds to a value minus 1).
let totalContribution = 0;
const processingQueue = [];

// Initialize the queue with the entire array segment.
// We start searching for the minimum value from the smallest possible value, which is 1 (index 0 in `valueToOriginalIndexMap`).
processingQueue.push([0, arraySize - 1, 0]);

// Continue processing segments until the queue becomes empty.
while (processingQueue.length > 0) {
    // Dequeue the next segment's information for processing.
    const currentSegmentInfo = processingQueue.shift();
    const segmentStart = currentSegmentInfo[0];
    const segmentEnd = currentSegmentInfo[1];
    let minValSearchIndex = currentSegmentInfo[2]; // This index will be iterated to find the minimum.

    // Guard clause: If the segment is invalid (e.g., start index is greater than end index), skip it.
    if (segmentStart > segmentEnd) {
        continue;
    }

    // --- Locate the actual minimum element within the current segment ---
    // The `minValSearchIndex` iterates through values (1, 2, 3, ...) by checking `valueToOriginalIndexMap`.
    // It searches for the smallest value whose original index falls within the current `[segmentStart, segmentEnd]` bounds.
    let minElementActualIndex;
    let minimumFoundInSegment = false;
    // Iterate while a minimum hasn't been found and we haven't exhausted all possible values.
    while (!minimumFoundInSegment && minValSearchIndex < arraySize) {
        const potentialMinOriginalIndex = valueToOriginalIndexMap[minValSearchIndex];
        // Check if the current minimum value (which is `minValSearchIndex + 1`) is present within this segment.
        if (potentialMinOriginalIndex >= segmentStart && potentialMinOriginalIndex <= segmentEnd) {
            minElementActualIndex = potentialMinOriginalIndex;
            minimumFoundInSegment = true; // We found the index of the minimum element for this segment.
        } else {
            // If the current value is not in the segment, increment to search for the next smallest value.
            minValSearchIndex++;
        }
    }

    // Another guard clause: If for some reason no minimum was found (should not happen for valid non-empty segments).
    if (!minimumFoundInSegment) {
        // This might indicate an unexpected state or an empty segment that wasn't caught by `segmentStart > segmentEnd`.
        continue;
    }

    // Retrieve the numeric value of the minimum element from the source array.
    const minimumElementValue = sourceNumbers[minElementActualIndex];

    // --- Calculate the contribution of this minimum element to the total sum ---
    // The number of subarrays where `minimumElementValue` is the minimum is calculated as:
    // (number of possible start positions for subarrays) * (number of possible end positions for subarrays).
    // A subarray must start at or before `minElementActualIndex` and end at or after it,
    // all within the current `[segmentStart, segmentEnd]` range.
    const countLeftSubarrays = minElementActualIndex - segmentStart + 1; // Number of ways to choose a start position.
    const countRightSubarrays = segmentEnd - minElementActualIndex + 1;   // Number of ways to choose an end position.
    const subarraysWhereThisIsMin = countLeftSubarrays * countRightSubarrays;

    // Add this element's total contribution to the running sum.
    totalContribution += minimumElementValue * subarraysWhereThisIsMin;

    // --- Enqueue sub-segments for subsequent processing ---
    // The identified minimum element (`minimumElementValue` at `minElementActualIndex`) divides the current
    // segment into two potential sub-segments: one to its left and one to its right.
    // These sub-segments are then added to the queue to find their own minimums.
    // For these new sub-segments, we continue the minimum search from `minValSearchIndex + 1`,
    // as the current minimum element has already been processed for this overall segment.

    // Left sub-segment: from `segmentStart` to `minElementActualIndex - 1`
    const leftSubsegmentStart = segmentStart;
    const leftSubsegmentEnd = minElementActualIndex - 1;
    if (leftSubsegmentStart <= leftSubsegmentEnd) { // Only enqueue if it's a valid, non-empty segment.
        processingQueue.push([leftSubsegmentStart, leftSubsegmentEnd, minValSearchIndex + 1]);
    }

    // Right sub-segment: from `minElementActualIndex + 1` to `segmentEnd`
    const rightSubsegmentStart = minElementActualIndex + 1;
    const rightSubsegmentEnd = segmentEnd;
    if (rightSubsegmentStart <= rightSubsegmentEnd) { // Only enqueue if it's a valid, non-empty segment.
        processingQueue.push([rightSubsegmentStart, rightSubsegmentEnd, minValSearchIndex + 1]);
    }
}

// Output the final calculated total sum of minimums across all subarrays.
console.log(totalContribution);