'use strict';

const processData = (rawData) => {
  // Obtain the raw input string from the environment.
  // The original input 'inputS' is assumed to come from a global variable or external source.
  // For cloning, we'll replace 'inputS' with 'inputStringData'.
  let inputStringData = rawData; // Assuming rawData passed to processData is the full string.
  inputStringData = inputStringData.trim().split('\n');

  // Extract the line containing the numeric segments.
  const segmentsStr = inputStringData[1].split(' ');

  // Convert string segments into an array of integer values.
  const segmentValues = segmentsStr.map(itemStr => Number.parseInt(itemStr, 10));

  // Calculate the sum of all segment values.
  const totalLength = segmentValues.reduce((accumulator, currentValue) => accumulator + currentValue);
  // Determine the target value for splitting the segments into two halves.
  const targetHalf = totalLength / 2;

  let currentSum = 0; // Accumulator for the first part of segments.
  let segmentIdx = 0; // Index for iterating through segment values.

  // Loop through segments, accumulating their values until the sum exceeds or meets the target.
  while (currentSum < targetHalf) {
    currentSum += segmentValues[segmentIdx];
    segmentIdx++;
  }

  let diff1 = 0; // Stores the sum of segments up to (but not including) the segmentIdx.
  let diff2 = 0; // Stores the sum of segments up to (and including) the segmentIdx.

  // Calculate the sum of elements for the first potential partition.
  for (let loopIdx = 0; loopIdx < segmentIdx; loopIdx++) {
    diff1 += segmentValues[loopIdx];
  }
  // Calculate the sum of elements for the second potential partition.
  for (let loopIdx = 0; loopIdx <= segmentIdx; loopIdx++) {
    diff2 += segmentValues[loopIdx];
  }


  // Adjust diff1 based on conditions related to the total length.
  if (diff1 === targetHalf && totalLength - diff1 === targetHalf) {
    diff1 = 0; // If partitions are perfectly equal, set to zero difference.
  } else {
    diff1 = Math.abs(diff1 - totalLength); // Calculate absolute difference from total.
  }

  // Adjust diff2 based on conditions related to the total length.
  if (diff2 === totalLength) {
    diff2 = Infinity; // If diff2 equals totalLength, this partition is invalid/maximum.
  } else {
    diff2 = Math.abs(diff2 - totalLength); // Calculate absolute difference from total.
  }

  // Output the smaller of the two calculated differences.
  if (diff1 < diff2) {
    console.log(diff1);
  } else {
    console.log(diff2);
  }
};
// Invoke the main processing function with input read from standard input.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));