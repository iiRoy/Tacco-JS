const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n'); // Read input from standard input, split by newlines

let comparisonCount = 0; // Initialize a counter for comparisons during merging

/**
 * Merges two sorted subarrays into one sorted array.
 * This function is a core part of the merge sort algorithm.
 * @param {Array<number>} targetArray - The array containing the subarrays to be merged.
 * @param {number} startIndex - The starting index of the first subarray.
 * @param {number} middleIndex - The ending index of the first subarray (exclusive) and starting index of the second subarray.
 * @param {number} endIndex - The ending index of the second subarray (exclusive).
 */
const combineSortedParts = (targetArray, startIndex, middleIndex, endIndex) => {
    // Calculate the sizes of the two subarrays
    const leftPartSize = middleIndex - startIndex;
    const rightPartSize = endIndex - middleIndex;

    // Create temporary arrays to hold the elements of the subarrays
    const leftTemp = [];
    const rightTemp = [];

    // Populate the left temporary array
    for (let leftIdx = 0; leftIdx < leftPartSize; leftIdx++) {
        leftTemp[leftIdx] = targetArray[startIndex + leftIdx];
    }

    // Populate the right temporary array
    for (let rightIdx = 0; rightIdx < rightPartSize; rightIdx++) {
        rightTemp[rightIdx] = targetArray[middleIndex + rightIdx];
    }

    // Add sentinels (infinity) to the end of temporary arrays to simplify comparison logic
    leftTemp[leftPartSize] = 1 / 0; // Represents positive infinity
    rightTemp[rightPartSize] = 1 / 0;

    let leftIdx = 0; // Pointer for the left temporary array
    let rightIdx = 0; // Pointer for the right temporary array

    // Merge the temporary arrays back into the original array
    for (let mainIdx = startIndex; mainIdx < endIndex; mainIdx++) {
        comparisonCount++; // Increment the comparison counter
        if (leftTemp[leftIdx] <= rightTemp[rightIdx]) {
            targetArray[mainIdx] = leftTemp[leftIdx];
            leftIdx++;
        } else {
            targetArray[mainIdx] = rightTemp[rightIdx];
            rightIdx++;
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
    // Base case: if the segment has 0 or 1 element, it's already sorted
    if (startIndex + 1 < endIndex) {
        // Calculate the middle point to divide the array
        const middleIndex = Math.floor((startIndex + endIndex) / 2);

        // Recursively sort the left half
        performMergeSort(targetArray, startIndex, middleIndex);
        // Recursively sort the right half
        performMergeSort(targetArray, middleIndex, endIndex);

        // Merge the two sorted halves
        combineSortedParts(targetArray, startIndex, middleIndex, endIndex);
    }
};

// Parse the input data: the second line contains space-separated numbers
const numericData = inputLines[1].split(' ').map(Number);

// Perform merge sort on the numeric data
performMergeSort(numericData, 0, numericData.length);

// Output the sorted array elements joined by spaces
console.log(numericData.join(' '));
// Output the total number of comparisons made during the merge process
console.log(comparisonCount);
