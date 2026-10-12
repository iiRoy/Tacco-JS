"use strict";

// Entry point for processing input data
processInput(require("fs").readFileSync("/dev/stdin", "utf-8"));

/**
 * Main function to process the input and calculate the result.
 * @param {string} rawData - The raw input string read from stdin.
 */
function processInput(rawData) {
  // Split the raw input into individual lines
  const inputLines = rawData.split("\n");

  // The first line indicates the number of splits, but it's not used in the core logic.
  // We parse it to maintain behavioral equivalence with the original code.
  const splitCount = parseInt(inputLines.shift());

  // The second line contains space-separated segment lengths.
  // Parse them into an array of integers.
  const segmentLengths = inputLines[0].split(" ").map(segmentStr => parseInt(segmentStr));

  let currentSumLeft = 0; // Accumulates the sum of segments on the left side of the potential split.
  let splitPointIndex = 0; // Stores the index where the optimal split is found.

  // Iterate through each segment to find the point where the left sum
  // is approximately equal to or just exceeds the right sum.
  for (let segmentIndex = 0; segmentIndex < segmentLengths.length; segmentIndex++) {
    const currentSegmentValue = segmentLengths[segmentIndex]; // The value of the current segment.

    // Calculate the sum of all segments to the right of the current segment.
    const sumOfRemainingSegments = calculateSegmentSum(segmentLengths, segmentIndex + 1, segmentLengths.length);

    // Add the current segment's value to the left sum.
    currentSumLeft += currentSegmentValue;

    // If the accumulated left sum is now greater than or equal to the sum of the remaining segments,
    // this segment is part of the left side, and we've found our split point.
    if (currentSumLeft >= sumOfRemainingSegments) {
      splitPointIndex = segmentIndex;
      break; // Exit the loop as the split point has been determined.
    }
  }

  // After finding the split point, calculate the final sum of the right part.
  const finalRightSum = calculateSegmentSum(segmentLengths, splitPointIndex + 1, segmentLengths.length);

  // Output the absolute difference between the final left sum and the final right sum.
  console.log(
    Math.abs(currentSumLeft - finalRightSum)
  );
}

/**
 * Calculates the sum of elements within a specified range of an array.
 * @param {number[]} dataArray - The array of numbers.
 * @param {number} startIndex - The starting index (inclusive) for summation.
 * @param {number} endIndex - The ending index (exclusive) for summation.
 * @returns {number} The sum of elements in the specified range.
 */
function calculateSegmentSum(dataArray, startIndex, endIndex) {
  let totalSum = 0; // Accumulator for the sum.

  // Guard clause: If the start index is beyond or equal to the end index,
  // there are no elements to sum, so return 0.
  if (startIndex >= endIndex) {
    return 0;
  }

  // Loop through the array from startIndex up to (but not including) endIndex.
  for (let currentIdx = startIndex; currentIdx < endIndex; currentIdx++) {
    totalSum += dataArray[currentIdx];
  }
  return totalSum;
}
