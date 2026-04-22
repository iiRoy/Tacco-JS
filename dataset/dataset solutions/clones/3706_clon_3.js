"use strict";

// Helper function to convert a string of space-separated numbers into an array of integers.
const extractNumericArray = (inputString) => {
  // Return an empty array for invalid or empty input strings
  if (!inputString || inputString.trim() === "") {
    return [];
  }
  // Use Number constructor for type conversion, which is robust for integer parsing.
  return inputString.split(/\s+/).map(Number);
};

// Core function to process the sequence and find the optimal partition.
const processSequenceForMinMaxDifference = (rawProblemInput) => {
  // Divide the raw input string into individual lines.
  const inputDataLines = rawProblemInput.split('\n');

  // Input validation: Ensure there are at least two lines (N and the sequence).
  if (inputDataLines.length < 2) {
    console.error("Error: Insufficient input data provided. Expected at least two lines.");
    return; // Exit if input is invalid
  }

  // Parse the total number of elements from the first line.
  const totalItemsCount = Number(inputDataLines[0]);

  // Parse the actual numeric sequence from the second line, limiting to totalItemsCount.
  const itemValues = extractNumericArray(inputDataLines[1]).slice(0, totalItemsCount);

  // Problem constraint: A sequence must have at least 4 elements to be split into 4 non-empty parts.
  if (totalItemsCount < 4) {
    // For less than 4 elements, it's impossible to make 4 splits, so the difference is typically 0
    // or undefined depending on problem context. Assuming 0 for a non-divisible case.
    console.log(0);
    return;
  }

  // --- Step 1: Calculate the cumulative sum array (prefix sums) ---
  // This allows for O(1) retrieval of the sum of any subsegment.
  // `cumulativeTotals[k]` stores the sum of `itemValues[0]` through `itemValues[k]`.
  const cumulativeTotals = new Array(totalItemsCount);
  let runningSum = 0;
  for (let currentIdx = 0; currentIdx < totalItemsCount; ++currentIdx) {
    runningSum += itemValues[currentIdx];
    cumulativeTotals[currentIdx] = runningSum;
  }

  // --- Step 2: Determine optimal first split points for each second split position ---
  // `optimalFirstSplitIndices[i]` will store the index `p` (0-based) for a given second split `i` (0-based).
  // The first segment is `itemValues[0...p]`, the second is `itemValues[p+1...i]`.
  // We want to minimize `|sum(0...p) - sum(p+1...i)|`.
  // `i` represents the index of the element *before* the second cut. So the second cut is at `i+1`.
  // The `optimalFirstSplitIndices` array will be indexed by `i` (the end of the second segment).
  // `i` can range from `1` (smallest possible second segment) to `totalItemsCount - 3` (to leave room for two more segments).
  const optimalFirstSplitIndices = new Array(totalItemsCount);
  optimalFirstSplitIndices[0] = -1; // Sentinel value as the first split cannot be at index 0.
  optimalFirstSplitIndices[1] = 0;  // If second cut is at index 1, first cut must be at 0.

  // Iterate for the second cut position, `i_end_of_second_segment`.
  // This loop considers `i_end_of_second_segment` from `2` up to `totalItemsCount - 3`.
  for (let i_end_of_second_segment = 2; i_end_of_second_segment <= totalItemsCount - 3; ++i_end_of_second_segment) {
    // Optimize the search for `p_candidate` by starting from the previous optimal split.
    let previousBestP = optimalFirstSplitIndices[i_end_of_second_segment - 1];
    let currentBestP = previousBestP;

    // Search for `p_candidate` from `previousBestP` up to `i_end_of_second_segment - 1`.
    for (let p_candidate = previousBestP; p_candidate < i_end_of_second_segment; ++p_candidate) {
      // Calculate sums for segment 1 (0 to p_candidate) and segment 2 (p_candidate + 1 to i_end_of_second_segment).
      const sumPart1 = cumulativeTotals[p_candidate];
      const sumPart2 = cumulativeTotals[i_end_of_second_segment] - cumulativeTotals[p_candidate];
      const currentBalanceDifference = Math.abs(sumPart1 - sumPart2);

      // Consider shifting the split point `p_candidate` one position to the right.
      if (p_candidate + 1 < i_end_of_second_segment) {
        const sumPart1Next = cumulativeTotals[p_candidate + 1];
        const sumPart2Next = cumulativeTotals[i_end_of_second_segment] - cumulativeTotals[p_candidate + 1];
        const nextBalanceDifference = Math.abs(sumPart1Next - sumPart2Next);

        // If the current `p_candidate` yields a better or equal balance than moving right, it's our optimum.
        if (currentBalanceDifference < nextBalanceDifference) {
          currentBestP = p_candidate;
          break; // Found the optimal `p` for this `i`, exit inner loop.
        }
      } else { // `p_candidate` is `i_end_of_second_segment - 1`, the rightmost possible position.
        currentBestP = p_candidate;
        break; // No further right to compare, this is the best.
      }
      // If moving right improved the balance (or kept it equal), continue the search.
      currentBestP = p_candidate + 1; // Update for the next iteration in case it's the last one.
    }
    optimalFirstSplitIndices[i_end_of_second_segment] = currentBestP;
  }

  // --- Step 3: Determine optimal third split points for each second split position ---
  // `optimalThirdSplitIndices[i]` will store the index `r` (0-based) for a given second split `i` (0-based).
  // The third segment is `itemValues[i+1...r]`, the fourth is `itemValues[r+1...totalItemsCount-1]`.
  // We want to minimize `|sum(i+1...r) - sum(r+1...totalItemsCount-1)|`.
  // `i` represents the index of the element *before* the second cut.
  // `r` represents the index of the element *before* the fourth cut.
  const optimalThirdSplitIndices = new Array(totalItemsCount);
  optimalThirdSplitIndices[totalItemsCount - 1] = -1; // Sentinel
  optimalThirdSplitIndices[totalItemsCount - 2] = -1; // Sentinel
  // If the second cut is at `totalItemsCount - 3`, the third cut must be at `totalItemsCount - 2`.
  optimalThirdSplitIndices[totalItemsCount - 3] = totalItemsCount - 2;

  // Iterate for the second cut position, `i_end_of_second_segment`, from right to left.
  // This loop considers `i_end_of_second_segment` from `totalItemsCount - 4` down to `1`.
  for (let i_end_of_second_segment = totalItemsCount - 4; i_end_of_second_segment >= 1; --i_end_of_second_segment) {
    // Optimize the search for `r_candidate` by starting from the previous optimal split (for `i+1`).
    let previousBestRForNextI = optimalThirdSplitIndices[i_end_of_second_segment + 1];
    let currentBestR = previousBestRForNextI;

    // Search for `r_candidate` from `previousBestRForNextI` downwards to `i_end_of_second_segment + 1`.
    for (let r_candidate = previousBestRForNextI; r_candidate > i_end_of_second_segment; --r_candidate) {
      // Calculate sums for segment 3 (i_end_of_second_segment + 1 to r_candidate)
      const sumPart3 = cumulativeTotals[r_candidate] - cumulativeTotals[i_end_of_second_segment];
      // Calculate sums for segment 4 (r_candidate + 1 to totalItemsCount - 1)
      const sumPart4 = cumulativeTotals[totalItemsCount - 1] - cumulativeTotals[r_candidate];
      const currentRightBalanceDifference = Math.abs(sumPart3 - sumPart4);

      // Consider shifting the split point `r_candidate` one position to the left.
      if (r_candidate - 1 > i_end_of_second_segment) {
        const sumPart3Prev = cumulativeTotals[r_candidate - 1] - cumulativeTotals[i_end_of_second_segment];
        const sumPart4Prev = cumulativeTotals[totalItemsCount - 1] - cumulativeTotals[r_candidate - 1];
        const prevRightBalanceDifference = Math.abs(sumPart3Prev - sumPart4Prev);

        // If the current `r_candidate` yields a better or equal balance than moving left, it's our optimum.
        if (currentRightBalanceDifference < prevRightBalanceDifference) {
          currentBestR = r_candidate;
          break; // Found the optimal `r` for this `i`, exit inner loop.
        }
      } else { // `r_candidate` is `i_end_of_second_segment + 1`, the leftmost possible position.
        currentBestR = r_candidate;
        break; // No further left to compare, this is the best.
      }
      // If moving left improved the balance (or kept it equal), continue the search.
      currentBestR = r_candidate - 1; // Update for the next iteration in case it's the last one.
    }
    optimalThirdSplitIndices[i_end_of_second_segment] = currentBestR;
  }

  // --- Step 4: Iterate through all possible second cut positions and find the overall minimum max-min difference ---
  let overallMinMaxDifference = Infinity;

  // The second cut position `i_mid_segment` ranges from `1` to `totalItemsCount - 3`.
  for (let i_mid_segment = 1; i_mid_segment <= totalItemsCount - 3; ++i_mid_segment) {
    // Retrieve the pre-calculated optimal first and third split indices for this `i_mid_segment`.
    const firstCutIndex = optimalFirstSplitIndices[i_mid_segment];
    const thirdCutIndex = optimalThirdSplitIndices[i_mid_segment];

    // Calculate the sums of the four segments using cumulative totals.
    // Segment 1: `itemValues[0...firstCutIndex]`
    const segmentOneSum = cumulativeTotals[firstCutIndex];
    // Segment 2: `itemValues[firstCutIndex+1...i_mid_segment]`
    const segmentTwoSum = cumulativeTotals[i_mid_segment] - cumulativeTotals[firstCutIndex];
    // Segment 3: `itemValues[i_mid_segment+1...thirdCutIndex]`
    const segmentThreeSum = cumulativeTotals[thirdCutIndex] - cumulativeTotals[i_mid_segment];
    // Segment 4: `itemValues[thirdCutIndex+1...totalItemsCount-1]`
    const segmentFourSum = cumulativeTotals[totalItemsCount - 1] - cumulativeTotals[thirdCutIndex];

    // Find the minimum and maximum sum among the four segments.
    const currentMinimumSegmentSum = Math.min(segmentOneSum, segmentTwoSum, segmentThreeSum, segmentFourSum);
    const currentMaximumSegmentSum = Math.max(segmentOneSum, segmentTwoSum, segmentThreeSum, segmentFourSum);

    // Update the overall minimum difference between max and min segment sums.
    overallMinMaxDifference = Math.min(overallMinMaxDifference, currentMaximumSegmentSum - currentMinimumSegmentSum);
  }

  // Output the final calculated minimum difference.
  console.log(overallMinMaxDifference);
};

// Entry point: Read input from standard input and execute the processing function.
processSequenceForMinMaxDifference(require('fs').readFileSync('/dev/stdin', 'utf8'));