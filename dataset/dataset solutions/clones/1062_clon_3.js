let swapTally = 0; // Global counter for inversions / swaps

// Entry point for the sorting and analysis process
(function processInputAndSort() {
  // Require the file system module for input operations
  const fileSystem = require('fs');
  const INPUT_SOURCE_PATH = '/dev/stdin'; // Standard input file path

  let rawDataLines;
  try {
    // Read all content from the input source, trim whitespace, and split into individual lines.
    const fileContent = fileSystem.readFileSync(INPUT_SOURCE_PATH, 'utf8').trim();
    rawDataLines = fileContent.split('\n');
  } catch (errorReadingFile) {
    console.error("Error reading input file:", errorReadingFile.message);
    process.exit(1); // Exit with an error code
  }

  // Ensure there are at least two lines for array size and elements
  if (rawDataLines.length < 2) {
    console.error("Insufficient input lines. Expected at least two.");
    process.exit(1);
  }

  // Parse the first line to get the number of elements
  const declaredElementCount = parseInt(rawDataLines.shift(), 10);
  if (isNaN(declaredElementCount) || declaredElementCount < 0) {
    console.error("Invalid element count provided in input.");
    process.exit(1);
  }

  // Parse the second line into an array of numbers
  // Each string element is converted to an integer using parseInt with radix 10
  let targetCollection = rawDataLines.shift()
                                   .split(' ')
                                   .map(valStr => parseInt(valStr, 10));

  // Filter out any NaN values that might result from non-numeric strings
  targetCollection = targetCollection.filter(num => !isNaN(num));

  // Adjust the actual size if the parsed array length differs from the declared count
  const actualElementCount = targetCollection.length;
  if (actualElementCount !== declaredElementCount) {
    console.warn(`Warning: Declared element count (${declaredElementCount}) does not match actual elements parsed (${actualElementCount}). Using actual count.`);
  }

  // Initiate the recursive sorting process on the entire collection
  divideAndConquerSort(targetCollection, 0, actualElementCount);

  // Output the total number of inversions counted during the sort
  console.log(swapTally);
})();


/**
 * Merges two sorted sub-arrays back into the main collection
 * while counting inversions.
 *
 * @param {number[]} collection The main array containing elements to be merged.
 * @param {number} start The starting index of the left sub-array.
 * @param {number} midpoint The index dividing the left and right sub-arrays.
 * @param {number} end The ending index (exclusive) of the right sub-array.
 */
function interleaveAndCount(collection, start, midpoint, end) {
  const HUGE_VAL = Number.MAX_SAFE_INTEGER; // Sentinel value for comparison

  // Calculate lengths of the temporary sub-arrays
  const leftSubArrayLength = midpoint - start;
  const rightSubArrayLength = end - midpoint;

  // Create temporary arrays for the left and right halves
  const leftTempArr = new Array(leftSubArrayLength);
  const rightTempArr = new Array(rightSubArrayLength);

  // Populate the left temporary array by copying elements
  for (let l_idx = 0; l_idx < leftSubArrayLength; ++l_idx) {
    leftTempArr[l_idx] = collection[start + l_idx];
  }

  // Populate the right temporary array by copying elements
  for (let r_idx = 0; r_idx < rightSubArrayLength; ++r_idx) {
    rightTempArr[r_idx] = collection[midpoint + r_idx];
  }

  // Add sentinel values to the end of temporary arrays to simplify merge logic
  leftTempArr.push(HUGE_VAL);
  rightTempArr.push(HUGE_VAL);

  let leftCursor = 0;  // Pointer for the left temporary array
  let rightCursor = 0; // Pointer for the right temporary array

  // Merge the two temporary arrays back into the original collection
  for (let mergeCursor = start; mergeCursor < end; ++mergeCursor) {
    // Compare elements from left and right temporary arrays
    if (leftTempArr[leftCursor] <= rightTempArr[rightCursor]) {
      collection[mergeCursor] = leftTempArr[leftCursor++];
    } else {
      collection[mergeCursor] = rightTempArr[rightCursor++];
      // If an element from the right sub-array is chosen, it means
      // all remaining elements in the left sub-array (from leftCursor onwards)
      // are greater than the current right sub-array element.
      // This constitutes an inversion.
      swapTally += (leftSubArrayLength - leftCursor);
    }
  }
}


/**
 * Recursively sorts a portion of an array using the merge sort algorithm
 * and utilizes 'interleaveAndCount' to tally inversions.
 *
 * @param {number[]} collection The array to be sorted.
 * @param {number} start The starting index of the portion to sort (inclusive).
 * @param {number} end The ending index of the portion to sort (exclusive).
 */
function divideAndConquerSort(collection, start, end) {
  // Base case: if the segment has 0 or 1 element, it's already sorted.
  // The condition (start + 1 < end) means there are at least two elements.
  if (start >= end - 1) {
    return;
  }

  // Calculate the midpoint using a bitwise shift for efficiency
  const midpoint = (start + end) >>> 1;

  // Recursively sort the left half
  divideAndConquerSort(collection, start, midpoint);
  // Recursively sort the right half
  divideAndConquerSort(collection, midpoint, end);

  // Merge the two sorted halves and count inversions
  interleaveAndCount(collection, start, midpoint, end);
}