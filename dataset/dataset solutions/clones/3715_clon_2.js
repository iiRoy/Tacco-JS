/* This function serves as the primary entry point for processing a given input string.
 * It's designed to solve a problem involving partitioning an array of numbers into four segments
 * such that the difference between the maximum and minimum segment sum is minimized.
 */
function ProcessInput(inputStr) {
  // Split the entire input string into an array of individual lines, using the newline character as a delimiter.
  let lineSegments = inputStr.split('\n');

  // Extract the first line, which represents the total count of numerical elements, and convert it to a number.
  const elementCount = Number(lineSegments[0]);

  // Take the second line, split it by spaces to get individual string numbers,
  // then map each string to its numerical equivalent.
  const numericValues = lineSegments[1].split(' ').map(val => Number(val));

  // Declare an array to store the cumulative (prefix) sums of the numeric values.
  // `prefixSums[k]` will hold the sum of `numericValues[0]` through `numericValues[k]`.
  const prefixSums = [];

  // Calculate the prefix sums for the `numericValues` array.
  // The `reduce` method is used to iterate through the array and build the `prefixSums` array in place.
  // The final accumulated sum (total sum) is then assigned to the last element of `prefixSums`.
  prefixSums[elementCount - 1] = numericValues.reduce((accumulator, currentVal, currentIndex) => {
    // For all elements except the very first one (where currentIndex is 0),
    // store the running sum *before* adding the current value into the `prefixSums` array.
    // This effectively stores `sum(numericValues[0]...numericValues[currentIndex-1])` at `prefixSums[currentIndex-1]`.
    if (currentIndex > 0) {
      prefixSums[currentIndex - 1] = accumulator;
    }
    // Update the accumulator by adding the `currentVal` for the next iteration.
    return accumulator + currentVal;
  });

  // Initialize a variable to keep track of the smallest difference found between max and min segment sums.
  // Set it to a very large number initially to ensure any valid difference will be smaller.
  let minDifference = 9000000000; // Represents 9 billion.

  // The core logic iterates through possible positions for the second split point (let's call it `idx2`).
  // The array is divided into four parts: P1 | P2 | P3 | P4.
  // `currentIdx` corresponds to the end of P2 (or start of P3).
  // The loop range `2` to `elementCount - 2` ensures there are at least two elements before `currentIdx`
  // and at least two elements after `currentIdx` to form four non-empty segments.
  for (let currentIdx = 2; currentIdx < elementCount - 1; currentIdx++) {

    // Calculate target sums for finding the first and third split points using a binary search.
    // `targetLeftSum` aims for P1 to be roughly half of (P1 + P2).
    // `prefixSums[currentIdx - 1]` is the sum of P1 + P2.
    const targetLeftSum = Math.floor(prefixSums[currentIdx - 1] / 2);

    // `targetRightSum` helps find `idx3` (end of P3). It's half of (total sum + sum of P1+P2).
    // This heuristic attempts to balance the overall segments.
    const targetRightSum = Math.floor((prefixSums[elementCount - 1] + prefixSums[currentIdx - 1]) / 2);

    // Find the optimal index for the first split point (`idx1`, between P1 and P2).
    // `findLowerBound` searches for a prefix sum close to `targetLeftSum` within the range `[0, currentIdx - 2]`.
    // The `leftSplitIdx` returned is `idx1 + 1` (where `prefixSums[idx1]` is the sum of P1).
    const leftSplitIdx = findLowerBound(prefixSums, 1, currentIdx - 1, targetLeftSum);

    // Find the optimal index for the third split point (`idx3`, between P3 and P4).
    // `findLowerBound` searches for a prefix sum close to `targetRightSum` within the range `[currentIdx, elementCount - 2]`.
    // The `rightSplitIdx` returned is `idx3 + 1` (where `prefixSums[idx3]` is the sum of P1+P2+P3).
    const rightSplitIdx = findLowerBound(prefixSums, currentIdx + 1, elementCount - 1, targetRightSum);

    // Construct an array containing the sums of the four segments based on the current split points.
    // P1: Sum from 0 to `leftSplitIdx - 1`.
    // P2: Sum from `leftSplitIdx` to `currentIdx - 1`.
    // P3: Sum from `currentIdx` to `rightSplitIdx - 1`.
    // P4: Sum from `rightSplitIdx` to `elementCount - 1`.
    let segmentSums = [
      prefixSums[leftSplitIdx - 1],                                     // Segment 1 sum
      prefixSums[currentIdx - 1] - prefixSums[leftSplitIdx - 1],        // Segment 2 sum
      prefixSums[rightSplitIdx - 1] - prefixSums[currentIdx - 1],       // Segment 3 sum
      prefixSums[elementCount - 1] - prefixSums[rightSplitIdx - 1]      // Segment 4 sum
    ];

    // Update the overall minimum difference by comparing with the current segments' max-min difference.
    minDifference = Math.min(minDifference, Math.max(...segmentSums) - Math.min(...segmentSums));

    // Explore alternative split points by shifting `leftSplitIdx` one position to the right.
    // This check `currentIdx - leftSplitIdx > 1` ensures that `leftSplitIdx` is not directly adjacent to `currentIdx`,
    // allowing `leftSplitIdx + 1` to be a valid, distinct split point.
    if (currentIdx - leftSplitIdx > 1) {
      // Re-calculate segment sums with the shifted first split point (`leftSplitIdx` becomes `leftSplitIdx+1` effectively).
      segmentSums = [
        prefixSums[leftSplitIdx],                                   // Shifted Segment 1
        prefixSums[currentIdx - 1] - prefixSums[leftSplitIdx],      // Shifted Segment 2
        prefixSums[rightSplitIdx - 1] - prefixSums[currentIdx - 1], // Segment 3 (unchanged)
        prefixSums[elementCount - 1] - prefixSums[rightSplitIdx - 1] // Segment 4 (unchanged)
      ];
      minDifference = Math.min(minDifference, Math.max(...segmentSums) - Math.min(...segmentSums));

      // If `leftSplitIdx` was shifted, also check if `rightSplitIdx` can be shifted.
      // This condition `elementCount - rightSplitIdx > 1` ensures `rightSplitIdx` is not directly adjacent to `elementCount - 1`.
      if (elementCount - rightSplitIdx > 1) {
        // Re-calculate segment sums with both first and third split points shifted.
        segmentSums = [
          prefixSums[leftSplitIdx],                                // Shifted Segment 1
          prefixSums[currentIdx - 1] - prefixSums[leftSplitIdx],   // Shifted Segment 2
          prefixSums[rightSplitIdx] - prefixSums[currentIdx - 1],  // Shifted Segment 3
          prefixSums[elementCount - 1] - prefixSums[rightSplitIdx] // Shifted Segment 4
        ];
        minDifference = Math.min(minDifference, Math.max(...segmentSums) - Math.min(...segmentSums));
      }
    }

    // Separately, check an alternative for the third split point by shifting `rightSplitIdx` one position to the right.
    // This check is independent of whether `leftSplitIdx` was shifted.
    if (elementCount - rightSplitIdx > 1) {
      // Re-calculate segment sums with the original first split point and the shifted third split point.
      segmentSums = [
        prefixSums[leftSplitIdx - 1],                               // Segment 1 (original)
        prefixSums[currentIdx - 1] - prefixSums[leftSplitIdx - 1],  // Segment 2 (original)
        prefixSums[rightSplitIdx] - prefixSums[currentIdx - 1],     // Shifted Segment 3
        prefixSums[elementCount - 1] - prefixSums[rightSplitIdx]    // Shifted Segment 4
      ];
      minDifference = Math.min(minDifference, Math.max(...segmentSums) - Math.min(...segmentSums));
    }
  }

  // Print the final minimum difference found to the console.
  console.log(minDifference);
}

/* This is a helper function that performs a binary search to find the "lower bound"
 * of a `targetValue` within a specified, sorted portion of an array.
 * The lower bound is defined as the index of the first element that is
 * greater than or equal to the `targetValue`.
 *
 * @param {Array<number>} dataArray - The sorted array in which to perform the search.
 * @param {number} startIndex - The inclusive starting index of the search range.
 * @param {number} endIndex - The inclusive ending index of the search range.
 * @param {number} targetValue - The value for which to find the lower bound.
 * @returns {number} The index of the lower bound within the `dataArray`.
 */
function findLowerBound(dataArray, startIndex, endIndex, targetValue) {
  let middleIndex;
  // Continue the binary search as long as there are at least two elements in the current range.
  // The condition `1 < endIndex - startIndex` implies `endIndex` is at least `startIndex + 2`.
  while (1 < endIndex - startIndex) {
    // Calculate the middle index of the current search range, ensuring it's an integer.
    middleIndex = Math.floor((startIndex + endIndex) / 2);

    // If the element at the `middleIndex` is less than the `targetValue`,
    // it means the lower bound must be in the right half (elements after `middleIndex`).
    if (dataArray[middleIndex] < targetValue) {
      startIndex = middleIndex; // Adjust the `startIndex` to `middleIndex`.
    }
    // Otherwise (if `dataArray[middleIndex]` is >= `targetValue`),
    // the lower bound is in the left half (including `middleIndex`).
    else {
      endIndex = middleIndex; // Adjust the `endIndex` to `middleIndex`.
    }
  }
  // After the loop, `endIndex` will be exactly one position greater than `startIndex`.
  // We check which of these two remaining elements (`dataArray[startIndex]` or `dataArray[endIndex]`)
  // is the actual lower bound.
  return dataArray[startIndex] < targetValue ? endIndex : startIndex;
}


// Read the entire content of standard input synchronously using Node.js's file system module.
// The input is expected to be UTF-8 encoded.
// Then, pass this raw input string to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));