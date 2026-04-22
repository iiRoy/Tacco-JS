'use strict';

/**
 * Main entry point for processing input data.
 * This function handles the parsing and calculation.
 * @param {string} rawData The complete string retrieved from standard input.
 */
const performCalculation = rawData => {
  // Parse the incoming text: first split by newline, then each line by space.
  const processedSegments = rawData
    .split('\n')
    .map(currentSegment => currentSegment.split(' '));

  // Extract the primary numeric quantity from the first line's first element.
  const baseValue = parseInt(processedSegments[0][0], 10);

  // Obtain the decrement value from the first line's second element.
  const subtractAmount = parseInt(processedSegments[0][1], 10);

  // Compute the final result, ensuring it's not below zero, and output it.
  console.log(
    Math.max(0, baseValue - subtractAmount)
  );
};

// Execute the primary function by reading content from the standard input stream.
performCalculation(
  require('node:fs')
    .readFileSync('/dev/stdin', 'utf-8')
);