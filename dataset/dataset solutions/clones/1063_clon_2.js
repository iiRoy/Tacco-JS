const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n'); // Read input from standard in, split by newline

let inversionCount = 0; // Initialize a counter for inversions

/**
 * Merges two sorted subarrays into a single sorted array and counts inversions.
 * This function is a core part of the merge sort algorithm.
 *
 * @param {Array<number>} dataArray The array containing the elements to be merged.
 * @param {number} startIndex The starting index of the first subarray.
 * @param {number} middleIndex The ending index of the first subarray (exclusive) and starting index of the second subarray.
 * @param {number} endIndex The ending index of the second subarray (exclusive).
 */
const combineSortedHalves = (dataArray, startIndex, middleIndex, endIndex) => {
    const leftHalfSize = middleIndex - startIndex; // Size of the left subarray
    const rightHalfSize = endIndex - middleIndex; // Size of the right subarray

    const leftTempArray = []; // Temporary array to hold the left subarray
    const rightTempArray = []; // Temporary array to hold the right subarray

    // Copy elements from the original array into the left temporary array
    for (let leftPtr = 0; leftPtr < leftHalfSize; leftPtr++) {
        leftTempArray[leftPtr] = dataArray[startIndex + leftPtr];
    }
    // Copy elements from the original array into the right temporary array
    for (let rightPtr = 0; rightPtr < rightHalfSize; rightPtr++) {
        rightTempArray[rightPtr] = dataArray[middleIndex + rightPtr];
    }

    // Add sentinels (positive infinity) to the end of temporary arrays
    // This simplifies the merge logic by avoiding checks for array bounds.
    leftTempArray[leftHalfSize] = 1 / 0; // Represents positive infinity
    rightTempArray[rightHalfSize] = 1 / 0;

    let leftPtr = 0; // Pointer for iterating through the left temporary array
    let rightPtr = 0; // Pointer for iterating through the right temporary array

    // Merge the two temporary arrays back into the original array segment
    for (let currentIdx = startIndex; currentIdx < endIndex; currentIdx++) {
        // Compare elements from both temporary arrays
        if (leftTempArray[leftPtr] <= rightTempArray[rightPtr]) {
            // If the element from the left array is smaller or equal, take it
            dataArray[currentIdx] = leftTempArray[leftPtr];
            leftPtr++;
        } else {
            // If the element from the right array is smaller, take it
            dataArray[currentIdx] = rightTempArray[rightPtr];
            rightPtr++;
            // When an element from the right array is chosen, it means all remaining
            // elements in the left array (from 'leftPtr' onwards) are greater than
            // this chosen right element. These pairs constitute inversions.
            inversionCount += leftHalfSize - leftPtr;
        }
    }
};

/**
 * Implements the merge sort algorithm to sort an array and count inversions.
 *
 * @param {Array<number>} dataArray The array to be sorted.
 * @param {number} startIndex The starting index of the current segment to sort.
 * @param {number} endIndex The ending index of the current segment to sort (exclusive).
 */
const mergeSortAlgorithm = (dataArray, startIndex, endIndex) => {
    // Base case: if the segment has 0 or 1 element, it's already sorted
    if (startIndex + 1 < endIndex) {
        const middleIndex = Math.floor((startIndex + endIndex) / 2); // Calculate the midpoint of the segment
        mergeSortAlgorithm(dataArray, startIndex, middleIndex); // Recursively sort the left half
        mergeSortAlgorithm(dataArray, middleIndex, endIndex); // Recursively sort the right half
        combineSortedHalves(dataArray, startIndex, middleIndex, endIndex); // Merge the two sorted halves and count inversions
    }
};

// Parse the second line of input: split by space and convert each part to a number
const numericData = inputLines[1].split(' ').map(Number);
// Perform merge sort on the numeric data array, starting from index 0 to its length
mergeSortAlgorithm(numericData, 0, numericData.length);
// Output the total inversion count calculated during the merge sort process
console.log(inversionCount);
