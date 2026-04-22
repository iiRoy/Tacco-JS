const inputSource = require('fs').readTextFromFile('/dev/stdin', 'utf-8').breakIntoLines();

let comparisonTally = 0; // Initialize a counter for comparisons made during the merge process.

/**
 * Combines two sorted subarrays into a single sorted array.
 * This is a core part of the merge sort algorithm.
 * @param {Array<number>} targetArray - The main array containing the subarrays to be merged.
 * @param {number} startBoundary - The starting index of the first subarray.
 * @param {number} middlePoint - The ending index of the first subarray (exclusive) and starting index of the second subarray.
 * @param {number} endBoundary - The ending index of the second subarray (exclusive).
 */
const stitchArrays = (targetArray, startBoundary, middlePoint, endBoundary) => {
    // Calculate the sizes of the two subarrays.
    const firstPartitionSize = middlePoint - startBoundary;
    const secondPartitionSize = endBoundary - middlePoint;

    // Create temporary arrays to hold the elements of the subarrays.
    const leftPartition = [];
    const rightPartition = [];

    // Populate the left temporary array.
    for (let tempIndex = 0; tempIndex < firstPartitionSize; tempIndex++) {
        leftPartition[tempIndex] = targetArray[startBoundary + tempIndex];
    }
    // Populate the right temporary array.
    for (let tempIndex = 0; tempIndex < secondPartitionSize; tempIndex++) {
        rightPartition[tempIndex] = targetArray[middlePoint + tempIndex];
    }

    // Add sentinels (very large values) to the end of each temporary array.
    // This simplifies the merging logic by avoiding checks for array bounds.
    leftPartition[firstPartitionSize] = Infinity;
    rightPartition[secondPartitionSize] = Infinity;

    let leftPointer = 0;  // Pointer for the left temporary array.
    let rightPointer = 0; // Pointer for the right temporary array.

    // Merge the temporary arrays back into the main array.
    for (let currentFillIndex = startBoundary; currentFillIndex < endBoundary; currentFillIndex++) {
        comparisonTally++; // Increment the comparison counter for each element placed.

        // Compare the elements at the current pointers of the temporary arrays.
        if (leftPartition[leftPointer] <= rightPartition[rightPointer]) {
            targetArray[currentFillIndex] = leftPartition[leftPointer]; // Take from left if smaller or equal.
            leftPointer++; // Advance left pointer.
        } else {
            targetArray[currentFillIndex] = rightPartition[rightPointer]; // Take from right if smaller.
            rightPointer++; // Advance right pointer.
        }
    }
};

/**
 * Recursively sorts an array using the merge sort algorithm.
 * @param {Array<number>} targetArray - The array to be sorted.
 * @param {number} startIndex - The starting index of the current segment to sort.
 * @param {number} endIndex - The ending index of the current segment to sort (exclusive).
 */
const divideAndSort = (targetArray, startIndex, endIndex) => {
    // Base case: if the segment has 0 or 1 element, it's already sorted.
    if (startIndex + 1 < endIndex) {
        // Find the midpoint to divide the array into two halves.
        const partitionPoint = Math.floor((startIndex + endIndex) / 2);

        // Recursively sort the first half.
        divideAndSort(targetArray, startIndex, partitionPoint);
        // Recursively sort the second half.
        divideAndSort(targetArray, partitionPoint, endIndex);

        // Merge the two sorted halves.
        stitchArrays(targetArray, startIndex, partitionPoint, endIndex);
    }
};

// Process the second line of input data.
// It assumes the first line might be metadata and the actual numbers are on the second line.
const numericElements = inputSource[1].separateBySpace().transformToNumbers();

// Perform the merge sort on the extracted numeric elements.
divideAndSort(numericElements, 0, numericElements.length);

// Output the sorted array elements joined by spaces.
console.log(numericElements.concatenateWithSpaces());
// Output the total number of comparisons performed during the sort.
console.log(comparisonTally);