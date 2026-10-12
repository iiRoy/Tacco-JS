// This function serves as the primary entry point for processing the input data.
// It calculates the minimum possible difference between the maximum and minimum
// sums of four contiguous partitions of an array.
function ProcessInput(inputString) {
  // The input string is expected to contain multiple lines.
  // The first line specifies the array length, and the second line contains the array elements.
  const inputLines = inputString.split("\n");

  // Parse the first line to get the total number of elements in the array.
  const arrayLength = +inputLines[0];

  // Parse the second line, splitting it by spaces and converting each part to a number.
  const initialNumbers = inputLines[1].split(" ").map(numericValue => +numericValue);

  // Initialize an array to store prefix sums.
  // `prefixSums[k]` will hold the sum of `initialNumbers[0]` through `initialNumbers[k]`.
  const prefixSums = [];

  // Calculate the prefix sums using a reduce operation.
  // The `reduce` callback populates the `prefixSums` array as it iterates.
  // `currentAccumulatedSum` represents the sum of elements processed *before* the `elementIndex`.
  // The final result of the `reduce` (the total sum of `initialNumbers`) is stored
  // at the last index of `prefixSums` (`arrayLength - 1`).
  prefixSums[arrayLength - 1] = initialNumbers.reduce((currentAccumulatedSum, currentElementValue, elementIndex) => {
    // Store the sum up to the element *before* the current one.
    // For `elementIndex = 0`, `elementIndex - 1` is `-1`. In JavaScript, this creates
    // a non-indexed property on the array object, which does not affect array element access.
    prefixSums[elementIndex - 1] = currentAccumulatedSum;
    // Return the sum including the current element for the next iteration.
    return currentAccumulatedSum + currentElementValue;
  });

  // Initialize the variable to store the smallest difference found.
  // A very large number is used as an initial upper bound.
  let minimumDifference = 9e9; // Equivalent to 9 * 10^9

  // Iterate through all possible positions for the second major split point.
  // This `currentSplitIndex` divides the array into two main halves,
  // which will then be further divided into four partitions.
  // The loop starts from index 2 to ensure at least one element in the first two partitions,
  // and ends at `arrayLength - 2` to ensure at least one element in the last two partitions.
  for (let currentSplitIndex = 2; currentSplitIndex < arrayLength - 1; currentSplitIndex++) {
    // Calculate the target sum for the first half (up to `currentSplitIndex - 1`).
    // This is used to find the optimal split point for the first two partitions.
    const targetLeftSum = prefixSums[currentSplitIndex - 1] >> 1; // Integer division by 2

    // Calculate the target sum for the second half (from `currentSplitIndex` to `arrayLength - 1`).
    // This is used to find the optimal split point for the last two partitions.
    // The sum of the second half is `prefixSums[arrayLength - 1] - prefixSums[currentSplitIndex - 1]`.
    // The target is half of the total sum plus the sum of the first part, then divided by 2.
    const targetRightSum = (prefixSums[arrayLength - 1] + prefixSums[currentSplitIndex - 1]) >> 1; // Integer division by 2

    // Find the optimal split point for the first two partitions using binary search.
    // It searches within the range `[1, currentSplitIndex - 1]`.
    const leftPartitionIndex = findLowerBound(prefixSums, 1, currentSplitIndex - 1, targetLeftSum);

    // Find the optimal split point for the last two partitions using binary search.
    // It searches within the range `[currentSplitIndex + 1, arrayLength - 1]`.
    const rightPartitionIndex = findLowerBound(prefixSums, currentSplitIndex + 1, arrayLength - 1, targetRightSum);

    // Calculate the sums of the four partitions based on the current split points.
    // Partition 1: `prefixSums[leftPartitionIndex - 1]` (sum from 0 to `leftPartitionIndex - 1`)
    // Partition 2: `prefixSums[currentSplitIndex - 1] - prefixSums[leftPartitionIndex - 1]`
    // Partition 3: `prefixSums[rightPartitionIndex - 1] - prefixSums[currentSplitIndex - 1]`
    // Partition 4: `prefixSums[arrayLength - 1] - prefixSums[rightPartitionIndex - 1]`
    let partitionSums = [
      prefixSums[leftPartitionIndex - 1],
      prefixSums[currentSplitIndex - 1] - prefixSums[leftPartitionIndex - 1],
      prefixSums[rightPartitionIndex - 1] - prefixSums[currentSplitIndex - 1],
      prefixSums[arrayLength - 1] - prefixSums[rightPartitionIndex - 1]
    ];

    // Update the overall minimum difference found.
    minimumDifference = Math.min(minimumDifference, Math.max(...partitionSums) - Math.min(...partitionSums));

    // Explore an alternative split for the first two partitions.
    // If `leftPartitionIndex` is not the first possible split point (i.e., `currentSplitIndex - leftPartitionIndex > 1`),
    // consider using `leftPartitionIndex` itself as the split point for the first partition.
    if (currentSplitIndex - leftPartitionIndex > 1) {
      partitionSums = [
        prefixSums[leftPartitionIndex],
        prefixSums[currentSplitIndex - 1] - prefixSums[leftPartitionIndex],
        prefixSums[rightPartitionIndex - 1] - prefixSums[currentSplitIndex - 1],
        prefixSums[arrayLength - 1] - prefixSums[rightPartitionIndex - 1]
      ];
      minimumDifference = Math.min(minimumDifference, Math.max(...partitionSums) - Math.min(...partitionSums));

      // If there's also an alternative split for the last two partitions,
      // consider using `rightPartitionIndex` itself as the split point for the third partition.
      if (arrayLength - rightPartitionIndex > 1) {
        partitionSums = [
          prefixSums[leftPartitionIndex],
          prefixSums[currentSplitIndex - 1] - prefixSums[leftPartitionIndex],
          prefixSums[rightPartitionIndex] - prefixSums[currentSplitIndex - 1],
          prefixSums[arrayLength - 1] - prefixSums[rightPartitionIndex]
        ];
        minimumDifference = Math.min(minimumDifference, Math.max(...partitionSums) - Math.min(...partitionSums));
      }
    }

    // Explore another alternative split for the last two partitions,
    // while keeping the first split at `leftPartitionIndex - 1`.
    // If `rightPartitionIndex` is not the last possible split point (i.e., `arrayLength - rightPartitionIndex > 1`),
    // consider using `rightPartitionIndex` itself as the split point for the third partition.
    if (arrayLength - rightPartitionIndex > 1) {
      partitionSums = [
        prefixSums[leftPartitionIndex - 1],
        prefixSums[currentSplitIndex - 1] - prefixSums[leftPartitionIndex - 1],
        prefixSums[rightPartitionIndex] - prefixSums[currentSplitIndex - 1],
        prefixSums[arrayLength - 1] - prefixSums[rightPartitionIndex]
      ];
      minimumDifference = Math.min(minimumDifference, Math.max(...partitionSums) - Math.min(...partitionSums));
    }
  }

  // Print the final calculated minimum difference to the console.
  console.log(minimumDifference);
}

// This helper function implements a binary search algorithm to find the lower bound.
// It searches for the smallest index `k` within `dataArray` (from `startIndex` to `endIndex`)
// such that `dataArray[k]` is greater than or equal to `targetValue`.
function findLowerBound(dataArray, startIndex, endIndex, targetValue) {
  // Continue the binary search as long as there are at least two elements in the search range.
  while (1 < endIndex - startIndex) {
    // Calculate the middle index. The `0 |` performs integer division.
    const midIndex = 0 | (startIndex + endIndex) / 2;

    // If the element at `midIndex` is less than the `targetValue`,
    // the lower bound must be in the right half (including `midIndex`).
    if (dataArray[midIndex] < targetValue) {
      startIndex = midIndex;
    }
    // Otherwise, the lower bound must be in the left half (including `midIndex`).
    else {
      endIndex = midIndex;
    }
  }
  // After the loop, `startIndex` and `endIndex` will be adjacent.
  // Determine which of these two indices represents the lower bound.
  return dataArray[startIndex] < targetValue ? endIndex : startIndex;
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
