var operationCount = 0; // Global counter for merge operations

/**
 * Main execution block for the sorting process.
 * Reads input, performs merge sort, and prints results.
 */
(function executeSortingProcess() {
  // Read input from stdin, trim whitespace, and split into lines
  const inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line contains the size of the array
  const arraySize = Number(inputDataRows.shift());

  // The second line contains the array elements, parsed as numbers
  let dataCollection = inputDataRows.shift().split(' ').map(Number);

  // Perform the merge sort on the data collection
  recursiveMergeSort(dataCollection, 0, arraySize);

  // Output the sorted array elements joined by a space
  console.log(dataCollection.join(' '));

  // Output the total count of merge operations
  console.log(operationCount);
})();

/**
 * Merges two sorted subarrays back into the main array.
 * @param {Array<number>} dataCollection The main array being sorted.
 * @param {number} startIdx The starting index of the first subarray.
 * @param {number} middleIdx The ending index of the first subarray (exclusive) and starting of the second.
 * @param {number} endIdx The ending index of the second subarray (exclusive).
 */
function combineSubarrays(dataCollection, startIdx, middleIdx, endIdx) {
  // Create left and right temporary subarrays
  let leftPartition = dataCollection.slice(startIdx, middleIdx);
  let rightPartition = dataCollection.slice(middleIdx, endIdx);

  // Add sentinels to simplify comparison logic
  leftPartition.push(Infinity);
  rightPartition.push(Infinity);

  let leftPtr = 0;  // Pointer for the left partition
  let rightPtr = 0; // Pointer for the right partition

  // Iterate through the original array segment and place elements in sorted order
  for (let currentIdx = startIdx; currentIdx < endIdx; currentIdx++) {
    if (leftPartition[leftPtr] <= rightPartition[rightPtr]) {
      dataCollection[currentIdx] = leftPartition[leftPtr++];
    } else {
      dataCollection[currentIdx] = rightPartition[rightPtr++];
    }
    operationCount++; // Increment the global operation counter for each comparison/placement
  }
}

/**
 * Recursively sorts an array segment using the merge sort algorithm.
 * @param {Array<number>} dataCollection The array to be sorted.
 * @param {number} startIdx The starting index of the segment to sort.
 * @param {number} endIdx The ending index of the segment to sort (exclusive).
 */
function recursiveMergeSort(dataCollection, startIdx, endIdx) {
  // Base case: if the segment has 0 or 1 element, it's already sorted
  if (startIdx + 1 < endIdx) {
    // Calculate the middle point to divide the array
    let middleIdx = Math.floor((startIdx + endIdx) / 2);

    // Recursively sort the left half
    recursiveMergeSort(dataCollection, startIdx, middleIdx);
    // Recursively sort the right half
    recursiveMergeSort(dataCollection, middleIdx, endIdx);

    // Merge the two sorted halves
    combineSubarrays(dataCollection, startIdx, middleIdx, endIdx);
  }
}
