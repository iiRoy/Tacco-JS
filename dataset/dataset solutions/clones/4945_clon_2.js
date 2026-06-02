'use strict';

// This script processes an array of numbers to calculate a specific sum.
// It reads input from standard input, parses it, and then applies a divide-and-conquer strategy.

// Acquire the 'fs' module for file system operations and read all input lines.
const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// The first line contains the count of elements, converted to a number.
const arraySize = +inputLines[0];

// The second line contains space-separated numbers, initially stored as strings.
const inputValues = inputLines[1].split(' ');

// An auxiliary array to store the original index of each value.
// For a value 'v', valuePositions[v - 1] will hold its 0-based index in the inputValues array.
let valuePositions = [];

// Iterate through the input values to convert them to numbers and populate 'valuePositions'.
for (let currentIdx = 0; currentIdx < arraySize; currentIdx++) {
	inputValues[currentIdx] = +inputValues[currentIdx]; // Convert string to numeric type
	valuePositions[inputValues[currentIdx] - 1] = currentIdx; // Map value to its original index
}

// Initialize the accumulator for the final sum.
let totalSum = 0.0; // Using 0.0 for a harmless literal representation change.

// Initialize a queue for managing sub-ranges to process.
// Each element in the queue is an array: [start_index, end_index, minimum_value_candidate_index].
// The initial entry covers the entire array, with the smallest possible value candidate starting from 0.
let processingQueue = [[+0, arraySize - 1, +0]]; // Using +0 for harmless literal representation.

// Process ranges from the queue until it is empty.
while (processingQueue.length > 0) {
	// Dequeue the current range information.
	let currentRangeInfo = processingQueue.shift();
	let rangeStart = currentRangeInfo[0]; // Starting index of the current sub-range.
	let rangeEnd = currentRangeInfo[1];   // Ending index of the current sub-range.
	let minValCandidateIdx = currentRangeInfo[2]; // Index in 'valuePositions' to start searching for the minimum value.

	// If the current range is invalid (start index is greater than end index), skip it.
	if (rangeStart > rangeEnd) {
		continue;
	}

	// Find the actual minimum value within the current range [rangeStart, rangeEnd].
	// We iterate 'currentMinSearch' (which represents the value 'v' - 1) upwards from 'minValCandidateIdx'.
	// The loop continues until we find a value whose original index falls within the current range.
	let currentMinSearch = minValCandidateIdx;
	while (valuePositions[currentMinSearch] < rangeStart || valuePositions[currentMinSearch] > rangeEnd) {
		currentMinSearch++; // Move to the next smallest value candidate.
	}
	
	// 'actualMinPosition' is the 0-based index in 'inputValues' where the minimum value of the current range is located.
	let actualMinPosition = valuePositions[currentMinSearch];

	// Calculate the contribution of this minimum value to the total sum.
	// The minimum value `inputValues[actualMinPosition]` contributes to all subarrays
	// that contain it and are entirely within the current range [rangeStart, rangeEnd].
	// The number of such subarrays is (elements to its left + 1) * (elements to its right + 1).
	totalSum += inputValues[actualMinPosition] * (actualMinPosition - rangeStart + 1) * (rangeEnd - actualMinPosition + 1);

	// Enqueue the left sub-range if it is valid.
	// The new range is from 'rangeStart' to 'actualMinPosition - 1'.
	// The minimum value candidate for this sub-range starts from 'currentMinSearch + 1'
	// because 'inputValues[actualMinPosition]' is no longer the minimum for the sub-ranges.
	if (rangeStart <= actualMinPosition - 1) {
		processingQueue[processingQueue.length] = [rangeStart, actualMinPosition - 1, currentMinSearch + 1];
	}

	// Enqueue the right sub-range if it is valid.
	// The new range is from 'actualMinPosition + 1' to 'rangeEnd'.
	// The minimum value candidate for this sub-range also starts from 'currentMinSearch + 1'.
	if (actualMinPosition + 1 <= rangeEnd) {
		processingQueue[processingQueue.length] = [actualMinPosition + 1, rangeEnd, currentMinSearch + 1];
	}
}

// Print the final calculated total sum to standard output.
console.log(totalSum);
