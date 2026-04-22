"use strict"; // Retaining strict mode for good practice

// Entry point for processing raw input data from a source (e.g., file system)
processInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));

/**
 * Calculates the sum of numeric elements within a specified range of an array.
 * This function serves as a utility for computing sub-totals.
 *
 * @param {number[]} dataArray - The array of numbers to sum.
 * @param {number} startIdx - The starting index (inclusive) for summation.
 * @param {number} endIdx - The ending index (exclusive) for summation.
 * @returns {number} The cumulative sum of elements from startIdx up to (but not including) endIdx.
 * @throws {Error} If an invalid array is provided.
 */
function computePartialSum(dataArray, startIdx, endIdx) {
  // Guard clause for invalid input array
  if (!dataArray || !Array.isArray(dataArray)) {
    throw new Error('Invalid array provided to computePartialSum. Expected an array of numbers.');
  }

  let accumulatedValue = 0; // Initialize accumulator for the sum

  // Iterate from the starting index up to, but not including, the ending index
  for (let currentPosition = startIdx; currentPosition < endIdx; currentPosition++) {
    // Ensure the element is a number before adding, although map should handle this.
    // This is an added robustness check (Type III addition).
    const elementValue = dataArray[currentPosition];
    if (typeof elementValue !== 'number' || isNaN(elementValue)) {
      console.warn(`Non-numeric value encountered at index ${currentPosition}. Skipping or treating as zero.`);
      continue; // Skip non-numeric values
    }
    accumulatedValue += elementValue;
  }
  return accumulatedValue;
}

/**
 * Main function to process the input string, parse numeric segments,
 * and determine the minimum absolute difference between two partitions.
 *
 * The problem aims to find a split point in an array of numbers such that
 * the absolute difference between the sum of elements in the left partition
 * and the sum of elements in the right partition is minimized.
 *
 * @param {string} rawInputContent - The entire raw content read from standard input.
 *   Expected format:
 *   Line 1: An integer (originally 'splitCount', but unused in this core logic)
 *   Line 2: Space-separated integers representing segment lengths.
 */
function processInputData(rawInputContent) {
  // Split the raw input into individual lines for processing.
  let contentLines = rawInputContent.split('\n');

  // The original problem description included a 'line' variable parsed from the first line.
  // However, this variable was not utilized in the subsequent core logic (finding the minimum difference).
  // For a Type III clone, we can strategically remove or ignore non-essential parts.
  // Here, we discard the first line as it's not relevant to the final calculation.
  // We also add a check for sufficient lines.
  if (contentLines.length < 2 || !contentLines[1].trim()) {
    // If there's no second line or it's empty, there are no segments to process.
    console.log(0); // Default output for no segments or invalid input.
    return;
  }

  // Parse the second line, which contains space-separated numeric segments.
  // Validate each segment to ensure it's a valid integer.
  const numericSegments = contentLines[1].split(' ').map(segmentStr => {
    const parsedValue = parseInt(segmentStr.trim(), 10);
    // Type III: Add validation for NaN results from parseInt.
    if (isNaN(parsedValue)) {
      // Instead of throwing, we might default to 0 or log a warning for robustness.
      // For this problem context, an invalid segment might indicate bad input, so throwing is appropriate.
      throw new Error(`Invalid numeric segment found: '${segmentStr}'. All segments must be integers.`);
    }
    return parsedValue;
  });

  // Type III: Add explicit edge case handling for empty or single-element arrays.
  if (numericSegments.length === 0) {
    console.log(0); // No segments, no difference.
    return;
  }
  if (numericSegments.length === 1) {
    // If there's only one segment, the only possible "split" is 0 vs the segment itself.
    // The problem implies dividing into two non-empty groups, but if only one element,
    // the "other" group is empty. The original code implicitly handles this by `howLength(..., 1, 1)` returning 0.
    console.log(Math.abs(numericSegments[0]));
    return;
  }

  // Calculate the total sum of all segments. This is a Type III addition for efficiency
  // and to simplify calculating the right partition sum (right = total - left).
  const totalLengthOfAllSegments = numericSegments.reduce((sum, val) => sum + val, 0);

  let currentAccumulatedLeftSum = 0; // Sum of segments in the left partition
  let firstSplitIndexWhereLeftDominates = -1; // Index where left sum first becomes >= right sum

  // Iterate through the segments to find the "pivot" point similar to the original logic.
  // The original logic finds the *first* index 'i' where `sum(0..i) >= sum(i+1..end)`.
  for (let currentSegmentIdx = 0; currentSegmentIdx < numericSegments.length; currentSegmentIdx++) {
    // Calculate the potential left sum if the current segment is included in the left partition.
    const prospectiveLeftSum = currentAccumulatedLeftSum + numericSegments[currentSegmentIdx];

    // Calculate the potential right sum based on the total sum and prospective left sum.
    const prospectiveRightSum = totalLengthOfAllSegments - prospectiveLeftSum;

    // Type III: The original condition for continuing was `indicate + input[i] < howLength(input, i + 1, input.length)`.
    // This translates to `prospectiveLeftSum < prospectiveRightSum`.
    if (prospectiveLeftSum < prospectiveRightSum) {
      currentAccumulatedLeftSum = prospectiveLeftSum; // Add current segment to left and continue search
    } else {
      currentAccumulatedLeftSum = prospectiveLeftSum; // Add current segment to left (this is the split point candidate)
      firstSplitIndexWhereLeftDominates = currentSegmentIdx;
      // Type III: Add a console log for debugging or tracing the logic.
      // console.log(`Debug: First split where left dominates found at index ${currentSegmentIdx}`);
      break; // Found the point, exit loop as per original logic.
    }
  }

  // At this point, `firstSplitIndexWhereLeftDominates` holds the index 'i'
  // where `sum(0..i)` first became greater than or equal to `sum(i+1..end)`.
  // `currentAccumulatedLeftSum` holds `sum(0..i)`.

  // Calculate the difference for this specific split point (original problem's output).
  const leftSumAtDominantSplit = currentAccumulatedLeftSum;
  const rightSumAtDominantSplit = totalLengthOfAllSegments - leftSumAtDominantSplit;
  let minimumAbsoluteDifference = Math.abs(leftSumAtDominantSplit - rightSumAtDominantSplit);

  // Type III: Enhancement/Addition - The minimum difference might actually be at the split *just before*
  // the one where the left side started dominating. The original code only considers the dominant split.
  // We will check the previous split as well, if it exists, and take the minimum of the two.
  if (firstSplitIndexWhereLeftDominates > 0) {
    // Calculate the left sum if the split was at `firstSplitIndexWhereLeftDominates - 1`.
    const leftSumAtPreviousSplit = currentAccumulatedLeftSum - numericSegments[firstSplitIndexWhereLeftDominates];
    const rightSumAtPreviousSplit = totalLengthOfAllSegments - leftSumAtPreviousSplit;
    const differenceAtPreviousSplit = Math.abs(leftSumAtPreviousSplit - rightSumAtPreviousSplit);

    // Update the minimum difference if the previous split yields a smaller absolute difference.
    minimumAbsoluteDifference = Math.min(minimumAbsoluteDifference, differenceAtPreviousSplit);
  }

  // Output the final minimum absolute difference.
  console.log(minimumAbsoluteDifference);
}