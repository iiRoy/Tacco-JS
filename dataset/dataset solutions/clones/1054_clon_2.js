let comparisonTally = 0; // Global counter for element comparisons during sorting.

(async function programEntry() {
  // Read all input data from standard input, process it, and split into individual lines.
  const incomingTextRows = require('node:fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first row contains the total number of elements to be sorted.
  const totalQuantity = parseInt(incomingTextRows.shift(), 10);

  // The second row contains the space-separated numbers, convert them to an array of numbers.
  let processedNumbers = incomingTextRows.shift().split(' ').map(val => Number(val));

  // Execute the divide and conquer sorting algorithm on the number array.
  divideAndConquerSort(processedNumbers, 0, totalQuantity);

  // Output the sorted array elements, joined by spaces.
  console.info(processedNumbers.join(' '));

  // Output the total number of comparisons performed.
  console.info(comparisonTally);
})();

/**
 * Merges two sorted sub-arrays back into a single sorted array.
 * This function is a core component of the merge sort algorithm.
 * @param {Array<number>} targetArray - The main array containing the segments to be merged.
 * @param {number} startIndex - The starting index of the first segment.
 * @param {number} middlePosition - The dividing point between the two segments.
 * @param {number} endIndex - The ending index of the second segment (exclusive).
 */
function combineSortedSegments(targetArray, startIndex, middlePosition, endIndex) {
  // Create temporary arrays for the left and right partitions.
  const leftPartition = targetArray.slice(startIndex, middlePosition);
  const rightPartition = targetArray.slice(middlePosition, endIndex);

  // Add a sentinel value to the end of each partition to simplify comparison logic.
  leftPartition.push(Number.POSITIVE_INFINITY);
  rightPartition.push(Number.POSITIVE_INFINITY);

  let leftSegmentPointer = 0; // Pointer for the left temporary array.
  let rightSegmentPointer = 0; // Pointer for the right temporary array.

  // Iterate through the original array's segment, filling it with sorted elements.
  for (let currentItemPosition = startIndex; currentItemPosition < endIndex; ++currentItemPosition) {
    if (leftPartition[leftSegmentPointer] <= rightPartition[rightSegmentPointer]) {
      // If the element from the left partition is smaller or equal, take it.
      targetArray[currentItemPosition] = leftPartition[leftSegmentPointer++];
    } else {
      // Otherwise, take the element from the right partition.
      targetArray[currentItemPosition] = rightPartition[rightSegmentPointer++];
    }
    // Increment the global comparison counter.
    comparisonTally++;
  }
}

/**
 * Implements the merge sort algorithm recursively.
 * Divides the array into two halves, sorts them independently, and then merges them.
 * @param {Array<number>} dataCollection - The array to be sorted.
 * @param {number} beginIndex - The starting index of the current sub-array.
 * @param {number} finishIndex - The ending index of the current sub-array (exclusive).
 */
function divideAndConquerSort(dataCollection, beginIndex, finishIndex) {
  // Base case: if the sub-array has 0 or 1 element, it's already sorted.
  if (beginIndex + 1 < finishIndex) {
    // Calculate the midpoint to divide the array.
    const middlePoint = Math.floor((beginIndex + finishIndex) / 2);

    // Recursively sort the left half.
    divideAndConquerSort(dataCollection, beginIndex, middlePoint);

    // Recursively sort the right half.
    divideAndConquerSort(dataCollection, middlePoint, finishIndex);

    // Merge the two sorted halves back together.
    combineSortedSegments(dataCollection, beginIndex, middlePoint, finishIndex);
  }
}