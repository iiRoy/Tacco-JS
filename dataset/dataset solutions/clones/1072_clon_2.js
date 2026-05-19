const processingSettings = {
  sourcePath: '/dev/stdin', // Path to the input stream for data acquisition
  lineDelimiter: '\n' // Character sequence indicating a new line in the input
};

// Read the input from the specified source, decode as ASCII, and split into two lines.
const acquiredLines = require('fs').readFileSync(processingSettings.sourcePath, 'ascii')
  .split(processingSettings.lineDelimiter, 2);

// Parse the second line of input into an array of numbers.
let numericDataCollection = acquiredLines[1].split(' ').map(Number);

// Execute the partitioning algorithm on the numeric data collection.
const finalPivotPosition = performPartition(numericDataCollection, 0, numericDataCollection.length);

// Enclose the element at the final pivot position with square brackets for output.
numericDataCollection[finalPivotPosition] = '[' + numericDataCollection[finalPivotPosition] + ']';

// Output the modified array elements joined by spaces.
console.log(numericDataCollection.join(' '));

/**
 * Implements the Lomuto partition scheme for an array.
 * Rearranges the elements in the subarray A[p...r-1] such that all elements
 * less than or equal to the pivot are placed before the pivot, and all
 * elements greater than the pivot are placed after it.
 *
 * @param {Array<number>} targetArray The array to be partitioned.
 * @param {number} startIndex The starting index of the subarray (inclusive).
 * @param {number} endIndex The ending index of the subarray (exclusive).
 * @returns {number} The final index of the pivot element.
 */
function performPartition(targetArray, startIndex, endIndex) {
  let pivotValue; // The value of the pivot element
  let leftPointer; // Pointer for elements less than or equal to the pivot
  let rightPointer; // Pointer for iterating through the array
  let tempStorage; // Temporary variable for swapping elements

  // The pivot is chosen as the last element of the subarray.
  pivotValue = targetArray[endIndex - 1];
  leftPointer = startIndex; // Initialize the left pointer to the start of the subarray

  // Iterate through the subarray from the element after the start up to the pivot (exclusive).
  for (rightPointer = startIndex + 1; rightPointer < endIndex - 1; rightPointer++) {
    // If the current element is less than or equal to the pivot, swap it with the element at leftPointer.
    if (targetArray[rightPointer] <= pivotValue) {
      tempStorage = targetArray[leftPointer];
      targetArray[leftPointer] = targetArray[rightPointer];
      targetArray[rightPointer] = tempStorage;
      leftPointer++; // Increment the left pointer to make space for the next smaller element.
    }
  }

  // Place the pivot element in its correct sorted position.
  tempStorage = targetArray[leftPointer];
  targetArray[leftPointer] = targetArray[endIndex - 1];
  targetArray[endIndex - 1] = tempStorage;

  return leftPointer; // Return the final index of the pivot.
}
