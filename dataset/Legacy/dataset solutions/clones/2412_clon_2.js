"use strict";

// Initiates the primary processing function by reading data from standard input.
processInput(require("fs").readFileSync("/dev/stdin", "utf-8"));

/**
 * This function serves as the main entry point for processing the input string.
 * It parses the raw data, performs calculations, and outputs a result.
 * @param {string} rawData - The complete string content read from the input source.
 */
function processInput(rawData) {
  // Divides the incoming raw string into an array of strings, using newline characters as delimiters.
  let processedData = rawData.split("\n");

  // Extracts and parses the first line of the input, converting it to an integer.
  // This value represents a count of breaks, though its direct use might vary.
  const breakCount = parseInt(processedData.shift());

  // Takes the first remaining line, splits it by spaces, and transforms each part into an integer.
  // This creates an array of numerical segment lengths.
  processedData = processedData[0].split(" ").map(segmentValue => parseInt(segmentValue));

  // Initializes a variable to accumulate the sum of segments on one side of a potential split.
  let currentSum = 0;
  // Initializes an index to mark the position where the array is conceptually divided.
  let splitIndex = 0;

  // Iterates through the array of segment lengths to determine an optimal split point.
  for (let idx = 0; idx < processedData.length; idx++) {
    // Compares the sum of segments up to the current point (plus the current segment)
    // with the sum of the remaining segments.
    if (currentSum + processedData[idx] < calculateSegmentSum(processedData, idx + 1, processedData.length)) {
      // If the left side remains smaller, add the current segment to the left sum.
      currentSum += processedData[idx];
    } else {
      // If adding the current segment makes the left side greater or equal,
      // this segment completes the left side, and we've found our split point.
      currentSum += processedData[idx];
      splitIndex = idx;
      break; // Terminates the loop as the split point has been identified.
    }
  }

  // Prints the absolute difference between the sum of the left partition and the sum of the right partition.
  console.log(
    Math.abs(currentSum - calculateSegmentSum(processedData, splitIndex + 1, processedData.length))
  );
}

/**
 * Computes the sum of numerical elements within a specified range of an array.
 * @param {number[]} dataArray - The array containing numerical values.
 * @param {number} startIndex - The starting index for summation (inclusive).
 * @param {number} endIndex - The ending index for summation (exclusive).
 * @returns {number} The total sum of elements within the given range.
 */
function calculateSegmentSum(dataArray, startIndex, endIndex) {
  let segmentTotal = 0; // Accumulator for the sum of the segment.
  // Loops from the start index up to (but not including) the end index.
  for (startIndex; startIndex < endIndex; startIndex++) {
    segmentTotal += dataArray[startIndex]; // Adds the value at the current index to the total.
  }
  return segmentTotal; // Returns the computed sum of the segment.
}
