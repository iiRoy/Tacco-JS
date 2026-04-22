"use strict" /* enables strict mode for better error handling */;

// Kick off the processing by reading input from standard in.
processInputData( require("fs").readFileSync("/dev/stdin", "utf8") );

/**
 * This function serves as the primary entry point for the application's logic.
 * It parses raw input data, performs calculations to find a optimal split point,
 * and then outputs a specific result.
 * @param {string} rawData - The complete string content read from the input stream.
 */
function processInputData(rawData) {

  let parsedDataLines = rawData.split('\n') ; // Divide the raw input into separate lines.

  // The first line contains a count of breakpoints, which we parse but do not use further in this specific algorithm.
  const breakpointCount = Number.parseInt(parsedDataLines.shift(), 10);

  // Extract the actual numeric segments from the first remaining line and convert them into an array of integers.
  let numericSegments = parsedDataLines[0]
                         .split(' ')
                         .map(
                           segmentStr => Number.parseInt(segmentStr, 10)
                         );

  // Initialize variables to track the sum of the left partition and the index where the split occurs.
  let leftPartitionSum = 0;
  let currentSplitIndex = 0;

  // Iterate through each segment to determine the split point that minimizes the difference between two partitions.
  for ( let idx = 0; idx < numericSegments.length; ++idx ) {
    // Calculate the total sum of segments for the potential right partition.
    const rightSideTotal = computeRangeTotal(numericSegments, idx + 1, numericSegments.length);

    // If adding the current segment to the left partition keeps it smaller than the right partition.
    if ( leftPartitionSum + numericSegments[idx] < rightSideTotal ) {
      leftPartitionSum += numericSegments[idx]; // Extend the left partition.
    }
    else {
      leftPartitionSum += numericSegments[idx]; // Add the current segment to the left sum.
      currentSplitIndex = idx;                  // This index marks our determined split point.
      break;                                    // Exit the loop as the split point has been found.
    }
  }

  // With the split point identified, calculate the final sum of the right partition.
  const finalRightPartitionSum = computeRangeTotal(numericSegments, currentSplitIndex + 1, numericSegments.length);

  // Output the absolute difference between the sums of the two partitions.
  console.log(
    Math.abs(leftPartitionSum - finalRightPartitionSum)
  );
}

/**
 * Computes the sum of elements within a specified range of a numeric array.
 * @param {Array<number>} numberList - The array from which to sum elements.
 * @param {number} startIndex - The starting index of the range (inclusive).
 * @param {number} endIndex - The ending index of the range (exclusive).
 * @returns {number} The accumulated sum of all numbers within the defined range.
 */
function computeRangeTotal(numberList, startIndex, endIndex) {
  let rangeTotal = 0; // Initialize the sum accumulator for the range.
  // Loop through the array from the start index up to (but not including) the end index.
  for ( /* initialization already done via parameter */; startIndex < endIndex; ++startIndex ) {
    rangeTotal += numberList[startIndex]; // Add the current element's value to the total.
  }
  return rangeTotal; // Return the final sum of the range.
}