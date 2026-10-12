'use strict';
(function(rawInputData) {
  // Process the raw input string: trim whitespace, split by spaces, convert to numbers.
  let processedData = rawInputData.trim().split(/\s+/).map(currentVal => currentVal - 0);

  // Extract the total number of items from the beginning of the processed data.
  const itemCount = processedData.shift();
  // The remaining elements are the initial sizes of the slimes.
  const initialSlimeSizes = processedData;

  // Initialize a 2D array for dynamic programming, storing minimum merge costs.
  // `minMergeCosts[lenIdx][startIdx]` will store the minimum cost to merge slimes
  // from `startIdx` up to `startIdx + lenIdx`.
  const minMergeCosts = new Array(itemCount).fill(0).map((currentVal, lenIdx) =>
    new Array(itemCount - lenIdx).fill(Infinity)
  );
  // Base case: Merging a single slime (length 0) costs nothing.
  minMergeCosts[0] = new Array(itemCount).fill(0);

  // Initialize another 2D array to store the total size of merged slimes.
  // `totalSlimeSizes[lenIdx][startIdx]` will store the sum of sizes of slimes
  // from `startIdx` up to `startIdx + lenIdx`.
  const totalSlimeSizes = new Array(itemCount).fill(0).map((currentVal, lenIdx) =>
    new Array(itemCount - lenIdx).fill(0)
  );
  // Base case: For length 0, the total size is just the initial slime size.
  totalSlimeSizes[0] = initialSlimeSizes;

  // Calculate total sizes for all possible contiguous segments of slimes.
  // `lenIdx` represents the length of the segment minus one (e.g., 0 for length 1, 1 for length 2).
  for (let lenIdx = 1; lenIdx < itemCount; lenIdx++) {
    // `startIdx` represents the starting index of the segment.
    for (let startIdx = 0; startIdx < itemCount - lenIdx; startIdx++) {
      // The total size of a segment is the sum of its first part (length `lenIdx-1`)
      // and the last individual slime (at `startIdx + lenIdx`).
      totalSlimeSizes[lenIdx][startIdx] = totalSlimeSizes[lenIdx - 1][startIdx] + totalSlimeSizes[0][startIdx + lenIdx];
    }
  }

  // Fill the `minMergeCosts` DP table.
  // `lenIdx` iterates from 1 up to `itemCount - 1`, representing the length of the segment being merged.
  for (let lenIdx = 1; lenIdx < itemCount; lenIdx++) {
    // `startIdx` iterates through all possible starting positions for a segment of current `lenIdx`.
    for (let startIdx = 0; startIdx < itemCount - lenIdx; startIdx++) {
      // `splitPointIdx` iterates through all possible split points within the current segment.
      // The segment from `startIdx` to `startIdx + lenIdx` is split into two parts:
      // 1. From `startIdx` to `startIdx + splitPointIdx` (length `splitPointIdx + 1`).
      // 2. From `startIdx + splitPointIdx + 1` to `startIdx + lenIdx` (length `lenIdx - splitPointIdx`).
      for (let splitPointIdx = 0; splitPointIdx < lenIdx; splitPointIdx++) {
        // Calculate the cost of merging the two sub-segments and then merging their results.
        // The cost is the sum of:
        // - Cost to merge the first sub-segment (`minMergeCosts[splitPointIdx][startIdx]`)
        // - Cost to merge the second sub-segment (`minMergeCosts[lenIdx - splitPointIdx - 1][startIdx + splitPointIdx + 1]`)
        // - Cost of merging the two resulting slimes (which is their combined total size).
        const currentMergeCost =
          minMergeCosts[splitPointIdx][startIdx] +
          minMergeCosts[lenIdx - splitPointIdx - 1][startIdx + splitPointIdx + 1] +
          totalSlimeSizes[splitPointIdx][startIdx] +
          totalSlimeSizes[lenIdx - splitPointIdx - 1][startIdx + splitPointIdx + 1];

        // Update the minimum cost for the current segment if this split yields a lower cost.
        minMergeCosts[lenIdx][startIdx] = Math.min(minMergeCosts[lenIdx][startIdx], currentMergeCost);
      }
    }
  }

  // The final answer is the minimum cost to merge all slimes,
  // which is stored at `minMergeCosts[itemCount - 1][0]`.
  console.log(minMergeCosts[itemCount - 1][0]);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
