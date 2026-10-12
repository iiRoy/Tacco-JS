var totalInversions = 0;

(function processInput() {
  // Read input from standard input, parse it, and prepare for sorting.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const arraySize = Number(inputLines.shift());
  let inputNumbers = inputLines.shift().split(' ').map(Number);

  // Perform the merge sort operation and count inversions.
  sortAndCount(inputNumbers, 0, arraySize);

  // The original code had a commented-out line for printing the sorted array.
  // console.log(inputNumbers.join(' '));
  // Output the total count of inversions found.
  console.log(totalInversions);
})();

/**
 * Merges two sorted subarrays back into the main array and counts inversions.
 * @param {Array<number>} dataArray The array containing the elements.
 * @param {number} startIdx The starting index of the first subarray.
 * @param {number} middleIdx The ending index of the first subarray (exclusive) and starting of the second.
 * @param {number} endIdx The ending index of the second subarray (exclusive).
 */
function combineSortedHalves(dataArray, startIdx, middleIdx, endIdx) {
  // Create temporary arrays for the left and right halves.
  let leftSubArray = dataArray.slice(startIdx, middleIdx);
  let rightSubArray = dataArray.slice(middleIdx, endIdx);

  // Add sentinels to simplify comparison logic.
  leftSubArray.push(Number.POSITIVE_INFINITY);
  rightSubArray.push(Number.POSITIVE_INFINITY);

  let leftPtr = 0; // Pointer for the left subarray.
  let rightPtr = 0; // Pointer for the right subarray.

  // Iterate through the original array segment and merge elements.
  for (let currentIdx = startIdx; currentIdx < endIdx; currentIdx++) {
    if (leftSubArray[leftPtr] <= rightSubArray[rightPtr]) {
      dataArray[currentIdx] = leftSubArray[leftPtr++];
    } else {
      dataArray[currentIdx] = rightSubArray[rightPtr++];
      // An inversion is found when an element from the right subarray is chosen
      // before remaining elements in the left subarray.
      totalInversions += (middleIdx - startIdx) - leftPtr;
    }
  }
}

/**
 * Sorts an array using the merge sort algorithm and counts inversions.
 * @param {Array<number>} dataArray The array to be sorted.
 * @param {number} startIdx The starting index of the current segment.
 * @param {number} endIdx The ending index of the current segment (exclusive).
 */
function sortAndCount(dataArray, startIdx, endIdx) {
  // Base case: if the segment has 0 or 1 element, it's already sorted.
  if (startIdx + 1 < endIdx) {
    // Find the middle point to divide the array into two halves.
    let middlePoint = Math.floor((startIdx + endIdx) / 2);

    // Recursively sort the left half.
    sortAndCount(dataArray, startIdx, middlePoint);
    // Recursively sort the right half.
    sortAndCount(dataArray, middlePoint, endIdx);

    // Merge the two sorted halves and count inversions.
    combineSortedHalves(dataArray, startIdx, middlePoint, endIdx);
  }
}
