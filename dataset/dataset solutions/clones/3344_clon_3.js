'use strict';
(function(fileContent){
  // Step 1: Process raw input string
  const processedNumbers = fileContent.trim().split(/\s+/).map(strNum => Number(strNum));

  // Step 2: Extract total number of slimes and their initial sizes
  const totalSlimes = processedNumbers.shift();
  const initialSlimeSizes = processedNumbers;

  // Step 3: Initialize DP table for minimum merge costs
  // minCostToMerge[lenMinusOne][startIdx] stores the minimum cost to merge slimes
  // from startIdx to startIdx + lenMinusOne.
  // lenMinusOne represents (segment length - 1).
  const minCostToMerge = new Array(totalSlimes).fill(0).map((_, idx) => new Array(totalSlimes - idx).fill(Infinity));
  
  // Base case: merging a single slime (segment length 1, lenMinusOne = 0) costs 0.
  minCostToMerge[0] = new Array(totalSlimes).fill(0);
  
  // Step 4: Pre-calculate cumulative sum of sizes for all possible segments
  // segmentSumOfSizes[lenMinusOne][startIdx] stores the total size of slimes
  // from startIdx to startIdx + lenMinusOne.
  const segmentSumOfSizes = new Array(totalSlimes).fill(0).map((_, idx) => new Array(totalSlimes - idx).fill(0));
  
  // Base case: segment of length 1 (lenMinusOne = 0) has size equal to initial slime size.
  for (let sIdx = 0; sIdx < totalSlimes; sIdx++) {
    segmentSumOfSizes[0][sIdx] = initialSlimeSizes[sIdx];
  }

  // Calculate sums for longer segments
  for (let lenMinusOne = 1; lenMinusOne < totalSlimes; lenMinusOne++) {
    for (let startIdx = 0; startIdx < totalSlimes - lenMinusOne; startIdx++) {
      // The sum of a segment [startIdx, startIdx + lenMinusOne] is the sum of
      // [startIdx, startIdx + lenMinusOne - 1] plus the size of the last slime in the segment.
      segmentSumOfSizes[lenMinusOne][startIdx] = segmentSumOfSizes[lenMinusOne - 1][startIdx] + initialSlimeSizes[startIdx + lenMinusOne];
    }
  }
  
  // Step 5: Fill the DP table for minimum merge costs
  // Iterate over segment lengths (lenMinusOne from 1 to totalSlimes - 1)
  for (let lenMinusOne = 1; lenMinusOne < totalSlimes; lenMinusOne++) {
    // Iterate over starting indices for segments of current length
    for (let segmentStartIdx = 0; segmentStartIdx < totalSlimes - lenMinusOne; segmentStartIdx++) {
      // The total size of the current segment, which is added as a cost when two sub-segments are merged.
      const currentSegmentTotalSize = segmentSumOfSizes[lenMinusOne][segmentStartIdx];

      // Iterate over all possible split points within the current segment
      // A split point 'splitPointOffset' divides the segment into two parts:
      // 1. Left segment: from segmentStartIdx to segmentStartIdx + splitPointOffset (length splitPointOffset + 1)
      // 2. Right segment: from segmentStartIdx + splitPointOffset + 1 to segmentStartIdx + lenMinusOne (length lenMinusOne - splitPointOffset)
      for (let splitPointOffset = 0; splitPointOffset < lenMinusOne; splitPointOffset++) {
        const leftSegmentLengthMinusOne = splitPointOffset;
        const rightSegmentLengthMinusOne = lenMinusOne - splitPointOffset - 1;
        const rightSegmentStartIdx = segmentStartIdx + splitPointOffset + 1;

        const costOfLeftMerge = minCostToMerge[leftSegmentLengthMinusOne][segmentStartIdx];
        const costOfRightMerge = minCostToMerge[rightSegmentLengthMinusOne][rightSegmentStartIdx];
        
        // The total cost for this specific split is the sum of costs to merge the two sub-segments
        // plus the cost of merging these two resulting slimes (which is their combined size).
        const currentSplitCost = costOfLeftMerge + costOfRightMerge + currentSegmentTotalSize;
        
        minCostToMerge[lenMinusOne][segmentStartIdx] = Math.min(minCostToMerge[lenMinusOne][segmentStartIdx], currentSplitCost);
      }
    }
  }
  
  // The final answer is the minimum cost to merge all slimes (segment of length totalSlimes, i.e., lenMinusOne = totalSlimes - 1, starting at index 0)
  console.log(minCostToMerge[totalSlimes - 1][0]);
})(require('fs').readFileSync('/dev/stdin','utf8'));
