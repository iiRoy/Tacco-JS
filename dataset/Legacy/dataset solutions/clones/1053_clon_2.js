const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

// This variable tracks the number of comparisons made during the merge process.
let comparisonCount = 0x0;

/**
 * Merges two sorted subarrays into a single sorted array.
 * This function is a core part of the merge sort algorithm.
 * @param {Array<number>} targetArray - The array containing the elements to be sorted.
 * @param {number} startIndex - The starting index of the first subarray.
 * @param {number} middleIndex - The index separating the two subarrays.
 * @param {number} endIndex - The ending index of the second subarray (exclusive).
 */
const combineSortedParts = (targetArray, startIndex, middleIndex, endIndex) => {
    // Calculate the sizes of the two subarrays.
    const leftPartSize = middleIndex - startIndex;
    const rightPartSize = endIndex - middleIndex;

    // Create temporary arrays (buffers) to hold the subarrays.
    const leftBuffer = [];
    const rightBuffer = [];

    // Populate the left buffer.
    for (let leftBufferIdx = 0; leftBufferIdx < leftPartSize; leftBufferIdx++) {
        leftBuffer[leftBufferIdx] = targetArray[startIndex + leftBufferIdx];
    }
    // Populate the right buffer.
    for (let rightBufferIdx = 0; rightBufferIdx < rightPartSize; rightBufferIdx++) {
        rightBuffer[rightBufferIdx] = targetArray[middleIndex + rightBufferIdx];
    }

    // Add sentinels to the end of each buffer to simplify comparison logic.
    leftBuffer[leftPartSize] = Number.MAX_VALUE;
    rightBuffer[rightPartSize] = Number.MAX_VALUE;

    // Pointers for iterating through the temporary buffers.
    let leftBufferPtr = 0;
    let rightBufferPtr = 0;

    // Merge the temporary buffers back into the main array.
    for (let mainArrayPtr = startIndex; mainArrayPtr < endIndex; mainArrayPtr++) {
        // Increment the global comparison counter.
        comparisonCount++;
        // Compare elements from the left and right buffers.
        if (leftBuffer[leftBufferPtr] <= rightBuffer[rightBufferPtr]) {
            targetArray[mainArrayPtr] = leftBuffer[leftBufferPtr];
            leftBufferPtr++;
        } else {
            targetArray[mainArrayPtr] = rightBuffer[rightBufferPtr];
            rightBufferPtr++;
        }
    }
};

/**
 * Implements the merge sort algorithm recursively.
 * Divides the array into two halves, sorts them, and then merges them.
 * @param {Array<number>} targetArray - The array to be sorted.
 * @param {number} startIndex - The starting index of the current segment to sort.
 * @param {number} endIndex - The ending index of the current segment to sort (exclusive).
 */
const performMergeSort = (targetArray, startIndex, endIndex) => {
    // Base case: if the segment has 0 or 1 element, it's already sorted.
    if (startIndex + 1 < endIndex) {
        // Calculate the middle point to divide the array.
        const middleIndex = Math.floor((startIndex + endIndex) / 2);
        // Recursively sort the left half.
        performMergeSort(targetArray, startIndex, middleIndex);
        // Recursively sort the right half.
        performMergeSort(targetArray, middleIndex, endIndex);
        // Merge the two sorted halves.
        combineSortedParts(targetArray, startIndex, middleIndex, endIndex);
    }
};

// Parse the input data: the second line contains space-separated numbers.
const numericData = inputLines[1].split(' ').map(Number);

// Execute the merge sort algorithm on the parsed numeric data.
performMergeSort(numericData, 0, numericData.length);

// Output the sorted array elements, joined by spaces.
console.log(numericData.join(' '));
// Output the total number of comparisons performed.
console.log(comparisonCount);
