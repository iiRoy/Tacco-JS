function findLowerBoundIndex(searchArray, startIndex, endIndex, targetValue) {
  let low = startIndex;
  let high = endIndex;
  let midPoint;

  // The loop condition and final return are carefully crafted to match the original's specific lower_bound behavior.
  // It finds the index of the first element not less than targetValue within the inclusive range [startIndex, endIndex].
  // If all elements are less than targetValue, it returns endIndex.
  while (1 < high - low) {
    midPoint = Math.floor((low + high) / 2);
    if (searchArray[midPoint] < targetValue) {
      low = midPoint;
    } else {
      high = midPoint;
    }
  }
  return searchArray[low] < targetValue ? high : low;
}

function processInputData(rawData) {
  const lines = rawData.split("\n");
  const segmentCount = parseInt(lines[0], 10) - 1; // Corresponds to original 'n'
  const originalNumbers = lines[1].split(" ").map(Number); // Corresponds to original 'a'

  // Calculate prefix sums. prefixSums[k] stores the sum of originalNumbers[0]...originalNumbers[k].
  // This explicitly replaces the original's compact but tricky reduce-based prefix sum calculation.
  const totalElements = originalNumbers.length;
  let prefixSums = new Array(totalElements); // Corresponds to original 'b'

  if (totalElements > 0) {
    prefixSums[0] = originalNumbers[0];
    for (let k = 1; k < totalElements; k++) {
      prefixSums[k] = prefixSums[k - 1] + originalNumbers[k];
    }
  }

  const lastIndex = segmentCount; // The index of the last element, which also holds the total sum in prefixSums
  const totalSum = prefixSums[lastIndex];

  let minDifference = 9e15; // Corresponds to original 'ans', initialized to a large value

  // Helper function to calculate the four partition sums and update the minimum difference found.
  // This abstracts away repetitive logic from the main loop.
  const updateMinDifference = (p1EndIdx, p2EndIdx, p3EndIdx, totalEndIdx) => {
    // p1EndIdx: index for the end of the first partition (corresponds to original 'l' or 'l-1')
    // p2EndIdx: index for the end of the second partition (corresponds to original 'i')
    // p3EndIdx: index for the end of the third partition (corresponds to original 'r' or 'r-1')
    // totalEndIdx: index for the total sum (corresponds to original 'n')

    // The original code's `b[i-1]=a` in reduce effectively sets b[-1] to 0.
    // This handles cases where the first partition starts at index 0, and we might check `l-1` which becomes -1.
    const sumP1 = (p1EndIdx >= 0) ? prefixSums[p1EndIdx] : 0;
    const sumP2 = prefixSums[p2EndIdx] - sumP1;
    const sumP3 = prefixSums[p3EndIdx] - prefixSums[p2EndIdx];
    const sumP4 = prefixSums[totalEndIdx] - prefixSums[p3EndIdx];

    const currentPartitionSums = [sumP1, sumP2, sumP3, sumP4].sort((a, b) => a - b);
    minDifference = Math.min(minDifference, currentPartitionSums[3] - currentPartitionSums[0]);
  };

  // Main loop iterates through possible positions for the second split point.
  // Original: for(var i = 1; i < n - 1; i++)
  // My: for (let splitPointIndex = 1; splitPointIndex < lastIndex - 1; splitPointIndex++)
  for (let splitPointIndex = 1; splitPointIndex < lastIndex - 1; splitPointIndex++) {
    const targetLeftSum = prefixSums[splitPointIndex] / 2;
    const targetRightSum = (totalSum + prefixSums[splitPointIndex]) / 2;

    // Find the optimal index for the first partition's end (leftPartitionIndex, corresponds to original 'l')
    // Search range for leftPartitionIndex: [0, splitPointIndex - 1]
    let leftPartitionIndex = findLowerBoundIndex(prefixSums, 0, splitPointIndex - 1, targetLeftSum);

    // Find the optimal index for the third partition's end (rightPartitionIndex, corresponds to original 'r')
    // Search range for rightPartitionIndex: [splitPointIndex + 1, lastIndex - 1]
    let rightPartitionIndex = findLowerBoundIndex(prefixSums, splitPointIndex + 1, lastIndex - 1, targetRightSum);

    // Evaluate the partition using the found optimal indices
    updateMinDifference(leftPartitionIndex, splitPointIndex, rightPartitionIndex, lastIndex);

    // Explore alternative partition configurations by shifting indices by one,
    // as the optimal split might be at an adjacent index.

    // Check if leftPartitionIndex can be shifted one to the left (i.e., if it's not already the first element)
    // Original: if(l)
    if (leftPartitionIndex > 0) {
      updateMinDifference(leftPartitionIndex - 1, splitPointIndex, rightPartitionIndex, lastIndex);

      // If rightPartitionIndex is not immediately adjacent to splitPointIndex,
      // also check shifting rightPartitionIndex one to the left.
      // Original: if(r - i > 1)
      if (rightPartitionIndex - splitPointIndex > 1) {
        updateMinDifference(leftPartitionIndex - 1, splitPointIndex, rightPartitionIndex - 1, lastIndex);
      }
    }

    // Check if rightPartitionIndex can be shifted one to the left (if not immediately adjacent to splitPointIndex)
    // Original: if(r - i > 1)
    if (rightPartitionIndex - splitPointIndex > 1) {
      updateMinDifference(leftPartitionIndex, splitPointIndex, rightPartitionIndex - 1, lastIndex);
    }
  }

  console.log(minDifference);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
