'use strict';

// This immediately invoked function expression (IIFE) serves as the entry point
// for the program. It handles reading input from a file, parsing it,
// and then orchestrates the dynamic programming solution for the slime merging problem.
(function(rawInputPayload) {
  // Define a constant for a very large number, used to represent an
  // uninitialized or effectively infinite cost in the dynamic programming table.
  const MAX_POSSIBLE_COST = Number.MAX_SAFE_INTEGER;

  /**
   * Computes the minimum cost to combine a series of slimes into a single slime.
   * The cost of merging any two slimes is their combined weight. This function
   * employs a dynamic programming approach to find the optimal sequence of merges.
   *
   * @param {number} elementCount - The total number of slimes to be merged.
   * @param {number[]} elementSizes - An array where each element represents the
   *                                  initial weight (size) of a slime.
   * @returns {number} The absolute minimum total cost required to merge all
   *                   given slimes into one. Returns 0 if there are 0 or 1 slimes,
   *                   as no merging is necessary in those cases.
   */
  const calculateMinSlimeMergeCost = (elementCount, elementSizes) => {
    // Early exit condition: If there are no slimes or only one slime,
    // no merging operations are performed, thus the total cost is zero.
    if (elementCount <= 1) {
      return 0;
    }

    // Step 1: Pre-calculate cumulative sums (prefix sums) of slime sizes.
    // This allows for efficient O(1) retrieval of the sum of weights for
    // any contiguous segment of slimes.
    // `cumulativeSums[k]` will store the sum of `elementSizes[0]` up to `elementSizes[k-1]`.
    // Example: `cumulativeSums[0] = 0`, `cumulativeSums[1] = elementSizes[0]`,
    // `cumulativeSums[2] = elementSizes[0] + elementSizes[1]`, and so on.
    const cumulativeSums = new Array(elementCount + 1).fill(0);
    for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
      cumulativeSums[currentIdx + 1] = cumulativeSums[currentIdx] + elementSizes[currentIdx];
    }

    // Helper function: Retrieves the total weight of slimes within a specified
    // inclusive range [startIdx, endIdx] by utilizing the pre-calculated
    // cumulative sums.
    const getSegmentTotalWeight = (startIdx, endIdx) => {
      // Basic validation for segment indices. While the DP loops ensure valid
      // indices for this problem, such checks improve robustness for general use.
      if (startIdx > endIdx || startIdx < 0 || endIdx >= elementCount) {
        // In a production system, one might throw an error or log a warning here.
        // For this specific competitive programming context, we assume valid calls.
        return 0;
      }
      return cumulativeSums[endIdx + 1] - cumulativeSums[startIdx];
    };

    // Step 2: Initialize the dynamic programming table.
    // `minMergeCosts[lenMinusOne][startIdx]` will store the minimum cost to combine
    // slimes from `startIdx` up to `startIdx + lenMinusOne` (inclusive).
    // `lenMinusOne` is used because it simplifies indexing; `lenMinusOne = 0` implies
    // a segment of 1 slime, `lenMinusOne = elementCount - 1` implies all slimes.
    const minMergeCosts = Array.from({ length: elementCount }, () =>
      Array(elementCount).fill(MAX_POSSIBLE_COST)
    );

    // Base case initialization: The cost to combine any single slime (a segment
    // of length 1, i.e., `lenMinusOne = 0`) is always zero, as no merge is performed.
    for (let j = 0; j < elementCount; j++) {
      minMergeCosts[0][j] = 0;
    }

    // Step 3: Populate the DP table using a bottom-up approach.
    // We iterate through all possible segment lengths, starting from 2 (since length 1 is the base case).
    // `currentSegmentLength` represents the actual number of slimes in the segment.
    for (let currentSegmentLength = 2; currentSegmentLength <= elementCount; currentSegmentLength++) {
      // Iterate over all possible starting indices for a segment of the current length.
      // `segmentStartIdx` is the zero-based index of the first slime in the current segment.
      for (let segmentStartIdx = 0; segmentStartIdx <= elementCount - currentSegmentLength; segmentStartIdx++) {
        // Calculate the inclusive ending index for the current segment.
        const segmentEndIdx = segmentStartIdx + currentSegmentLength - 1;

        // Calculate the total weight of all slimes within this current segment.
        // This value represents the cost incurred when the two final sub-slimes
        // (resulting from the split) are merged together.
        const totalWeightOfCurrentSegment = getSegmentTotalWeight(segmentStartIdx, segmentEndIdx);

        // Iterate through all possible split points within the current segment.
        // `splitPointIdx` is the index of the last slime in the *left* sub-segment.
        // The segment `[segmentStartIdx, segmentEndIdx]` is split into:
        //   Left sub-segment: `[segmentStartIdx, splitPointIdx]`
        //   Right sub-segment: `[splitPointIdx + 1, segmentEndIdx]`
        for (let splitPointIdx = segmentStartIdx; splitPointIdx < segmentEndIdx; splitPointIdx++) {
          // Calculate the `lenMinusOne` index for the left sub-segment.
          const leftSubSegmentLenMinusOne = splitPointIdx - segmentStartIdx;
          // Calculate the `lenMinusOne` index for the right sub-segment.
          const rightSubSegmentLenMinusOne = segmentEndIdx - (splitPointIdx + 1);

          // Retrieve the minimum costs already computed for the two sub-problems
          // from the DP table. These represent the costs to merge the slimes
          // within each sub-segment independently.
          const costOfLeftSubMerge = minMergeCosts[leftSubSegmentLenMinusOne][segmentStartIdx];
          const costOfRightSubMerge = minMergeCosts[rightSubSegmentLenMinusOne][splitPointIdx + 1];

          // The total cost for this particular split configuration is the sum of:
          // 1. Cost to merge the left sub-segment.
          // 2. Cost to merge the right sub-segment.
          // 3. Cost to merge the two resulting slimes (which is their combined weight).
          const currentSplitTotalCost = costOfLeftSubMerge + costOfRightSubMerge + totalWeightOfCurrentSegment;

          // Update the minimum cost for the current segment if this specific
          // split yields a lower overall cost than previously found splits.
          minMergeCosts[currentSegmentLength - 1][segmentStartIdx] = Math.min(
            minMergeCosts[currentSegmentLength - 1][segmentStartIdx],
            currentSplitTotalCost
          );
        }
      }
    }

    // The final result is the minimum cost to combine all slimes,
    // which is stored at `minMergeCosts[elementCount - 1][0]`.
    // This corresponds to the segment of length `elementCount` starting at index 0.
    return minMergeCosts[elementCount - 1][0];
  };

  // --- Input Processing and Program Execution ---

  // The raw input payload (a string from stdin) is first trimmed of leading/trailing
  // whitespace, then split into an array of strings using any whitespace as a delimiter.
  // Finally, each string element is converted into a number.
  const processedNumericValues = rawInputPayload.trim().split(/\s+/).map(Number);

  // According to the problem format, the first number in the input array
  // represents the total count of slimes. This value is extracted using `shift()`.
  const totalSlimesCount = processedNumericValues.shift();

  // The remaining numbers in the array are the individual weights (sizes) of the slimes.
  const initialSlimeWeights = processedNumericValues;

  // Invoke the primary function to calculate the minimum merging cost
  // with the parsed input data.
  const finalCalculatedCost = calculateMinSlimeMergeCost(totalSlimesCount, initialSlimeWeights);

  // Output the final computed minimum cost to the standard console.
  console.log(finalCalculatedCost);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));