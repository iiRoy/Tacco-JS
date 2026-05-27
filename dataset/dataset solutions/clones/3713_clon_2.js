// This function serves as the primary entry point, processing the raw input string.
function ProcessInput(inputStr) {
  // The input string is expected to contain multiple lines, separated by newline characters.
  // We split it into an array of strings, where each element is a line from the input.
  inputStr = inputStr.split("\n");

  // The first line of the input (inputStr[0]) contains a number N.
  // We convert it to a numeric type and subtract 1. This 'segmentCount' likely represents
  // the number of possible cut points or array indices, rather than the total number of segments.
  let segmentCount = +inputStr[0] - 1;

  // The second line (inputStr[1]) contains space-separated numeric values.
  // We split this line by spaces and then use the `map` function to convert each
  // string representation of a number into an actual numeric type.
  let initialValues = inputStr[1].split(" ").map(val => +val);

  // An array to store prefix sums. This allows for efficient calculation of sums
  // over various sub-arrays later in the algorithm.
  let prefixSums = [];

  // Calculate the prefix sums for the `initialValues` array.
  // The `reduce` method iterates through `initialValues`.
  // `acc` accumulates the sum, `currentVal` is the current element, `idx` is its index.
  // `prefixSums[idx-1]` stores the sum of elements from `initialValues[0]` up to `initialValues[idx-1]`.
  // The final accumulated sum (total sum of `initialValues`) is stored at `prefixSums[segmentCount]`.
  prefixSums[segmentCount] = initialValues.reduce((acc, currentVal, idx) => {
    // For each iteration, store the current accumulated sum in the `prefixSums` array.
    // The index `idx - 1` is used because `reduce` without an initial value starts `idx` from 1.
    prefixSums[idx - 1] = acc;
    // Return the updated accumulator for the next iteration.
    return acc + currentVal;
  });

  // Initialize `minDifference` to a very large number. This variable will hold the
  // smallest difference between the maximum and minimum partition sums found.
  let minDifference = 9e15; // Represents a very large number (9 * 10^15)

  // This loop iterates through possible positions for the second cut point (P2 in a P1|P2|P3|P4 division).
  // The loop runs from `1` to `segmentCount - 2` to ensure there are at least two elements
  // to the left of `currentIdx` and at least one element to its right, allowing for four partitions.
  for (let currentIdx = 1; currentIdx < segmentCount - 1; currentIdx++) {
    // Calculate target sums for the binary search.
    // `targetLeftSum` is half of the sum of elements up to `currentIdx`.
    // `targetRightSum` is half of the sum of elements from `currentIdx` to `segmentCount`.
    let targetLeftSum = prefixSums[currentIdx] / 2;
    let targetRightSum = (prefixSums[segmentCount] + prefixSums[currentIdx]) / 2;

    // Use `findLowerBound` to find the optimal split points for the first and third cuts.
    // `leftBoundIdx` is the index for the first cut (P1|P2). It searches in the range [0, currentIdx-1].
    let leftBoundIdx = findLowerBound(prefixSums, 0, currentIdx - 1, targetLeftSum);
    // `rightBoundIdx` is the index for the third cut (P3|P4). It searches in the range [currentIdx+1, segmentCount-1].
    let rightBoundIdx = findLowerBound(prefixSums, currentIdx + 1, segmentCount - 1, targetRightSum);

    // Calculate the four partition sums based on the found `leftBoundIdx` and `rightBoundIdx`.
    // P1: Sum from 0 to leftBoundIdx
    // P2: Sum from leftBoundIdx+1 to currentIdx
    // P3: Sum from currentIdx+1 to rightBoundIdx
    // P4: Sum from rightBoundIdx+1 to segmentCount
    let partitionSums = [
      prefixSums[leftBoundIdx],
      prefixSums[currentIdx] - prefixSums[leftBoundIdx],
      prefixSums[rightBoundIdx] - prefixSums[currentIdx],
      prefixSums[segmentCount] - prefixSums[rightBoundIdx]
    ].sort((valA, valB) => valA - valB); // Sort to easily find the min (index 0) and max (index 3) sums.

    // Update `minDifference` if the current difference (max sum - min sum) is smaller.
    minDifference = Math.min(minDifference, partitionSums[3] - partitionSums[0]);

    // Explore an alternative position for the first cut: `leftBoundIdx - 1`.
    // This is only possible if `leftBoundIdx` is not the very first element (index 0).
    if (leftBoundIdx > 0) {
      partitionSums = [
        prefixSums[leftBoundIdx - 1],
        prefixSums[currentIdx] - prefixSums[leftBoundIdx - 1],
        prefixSums[rightBoundIdx] - prefixSums[currentIdx],
        prefixSums[segmentCount] - prefixSums[rightBoundIdx]
      ].sort((valA, valB) => valA - valB);
      minDifference = Math.min(minDifference, partitionSums[3] - partitionSums[0]);

      // If there's also room to explore an alternative position for the third cut: `rightBoundIdx - 1`.
      // This condition ensures `rightBoundIdx - 1` is a valid index for the third cut,
      // meaning `rightBoundIdx` must be at least `currentIdx + 2`.
      if (rightBoundIdx - currentIdx > 1) {
        partitionSums = [
          prefixSums[leftBoundIdx - 1],
          prefixSums[currentIdx] - prefixSums[leftBoundIdx - 1],
          prefixSums[rightBoundIdx - 1] - prefixSums[currentIdx],
          prefixSums[segmentCount] - prefixSums[rightBoundIdx - 1]
        ].sort((valA, valB) => valA - valB);
        minDifference = Math.min(minDifference, partitionSums[3] - partitionSums[0]);
      }
    }

    // Explore an alternative position for the third cut: `rightBoundIdx - 1`.
    // This is only possible if `rightBoundIdx` is not the first possible index for the third cut.
    // The condition `rightBoundIdx - currentIdx > 1` ensures `rightBoundIdx - 1` is a valid index.
    if (rightBoundIdx - currentIdx > 1) {
      partitionSums = [
        prefixSums[leftBoundIdx],
        prefixSums[currentIdx] - prefixSums[leftBoundIdx],
        prefixSums[rightBoundIdx - 1] - prefixSums[currentIdx],
        prefixSums[segmentCount] - prefixSums[rightBoundIdx - 1]
      ].sort((valA, valB) => valA - valB);
      minDifference = Math.min(minDifference, partitionSums[3] - partitionSums[0]);
    }
  }
  // After checking all possible cut combinations, print the smallest difference found.
  console.log(minDifference);
}

// This helper function performs a binary search to find the "lower bound" of a target value
// within a specified range of a sorted array. It returns the index of the first element
// that is greater than or equal to the `targetVal`. If all elements are less than `targetVal`,
// it returns `endIndex + 1` (or `endIndex` in this specific implementation's edge case handling).
function findLowerBound(dataArr, startIndex, endIndex, targetVal) {
  // The loop continues as long as there are at least two elements in the search range.
  while (1 < endIndex - startIndex) {
    // Calculate the middle index. The `0 |` performs a floor division (integer truncation).
    let midIndex = 0 | (startIndex + endIndex) / 2;
    // If the value at `midIndex` is less than the `targetVal`,
    // it means the lower bound must be in the right half (excluding `midIndex`).
    if (dataArr[midIndex] < targetVal) {
      startIndex = midIndex;
    } else {
      // Otherwise, the lower bound is in the left half (including `midIndex`).
      endIndex = midIndex;
    }
  }
  // After the loop, `startIndex` and `endIndex` will be adjacent.
  // We check `dataArr[startIndex]` against `targetVal`.
  // If `dataArr[startIndex]` is less than `targetVal`, then `endIndex` is the lower bound.
  // Otherwise, `startIndex` is the lower bound.
  return dataArr[startIndex] < targetVal ? endIndex : startIndex;
}

// Read the entire content of standard input synchronously using Node.js's `fs` module.
// The input is expected to be UTF-8 encoded.
// Then, pass this content to the `ProcessInput` function to begin computation.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
