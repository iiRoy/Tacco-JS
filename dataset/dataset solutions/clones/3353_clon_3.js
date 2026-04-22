'use strict';

// Calculates the maximum possible score for a sequence of items,
// where each item's height must be strictly greater than the previous.
// This uses dynamic programming, summing attribute values.
function determineMaximalScore(totalElements, dimensions, attributes) {
  // Return 0 if there are no items to process.
  if (totalElements <= 0) {
    return 0;
  }

  // Initialize an array to hold the max cumulative score ending at each position.
  // Each element starts with its own attribute value.
  const cumulativeScores = new Array(totalElements);
  for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
    cumulativeScores[currentIdx] = attributes[currentIdx];
  }

  let peakValueFound = 0; // Tracks the overall maximum score.

  // Iterate through each item to calculate its optimal cumulative score.
  for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
    let potentialAddition = 0; // Max score from a preceding valid item.
    const currentItemHeight = dimensions[currentIdx]; // Cache current item's height.

    // Check all items before the current one.
    for (let precedingIdx = 0; precedingIdx < currentIdx; precedingIdx++) {
      const previousItemHeight = dimensions[precedingIdx]; // Cache previous item's height.
      const scoreOfPreviousSequence = cumulativeScores[precedingIdx]; // Max score ending at preceding item.

      // If current item is taller and preceding sequence yields a better score, update.
      if (currentItemHeight > previousItemHeight && scoreOfPreviousSequence > potentialAddition) {
        potentialAddition = scoreOfPreviousSequence;
      }
    }

    // Add the best preceding sequence score to the current item's initial value.
    cumulativeScores[currentIdx] += potentialAddition;

    // Update the overall maximum score found so far.
    peakValueFound = Math.max(peakValueFound, cumulativeScores[currentIdx]);
  }

  return peakValueFound; // The highest score achieved.
}

// Main function to process input, calculate, and display the result.
function processInputAndDisplayResult(rawData) {
  const inputLines = rawData.split('\n');

  // Parse the total number of items from the first line.
  const totalItemsCount = Number.parseInt(inputLines[0].trim(), 10);

  // Validate the total item count.
  if (isNaN(totalItemsCount) || totalItemsCount < 0) {
      console.error("Error: Invalid number of items provided. Expecting a non-negative integer.");
      return;
  }

  // Helper function to parse a line of space-separated integers.
  const parseNumericArray = (lineContent) => {
    return lineContent
      .split(/\s+/) // Split by any sequence of whitespace.
      .filter(Boolean) // Remove empty strings from potential multiple spaces.
      .map(segment => Number.parseInt(segment.trim(), 10)); // Parse each segment to an integer.
  };

  // Parse item heights from the second line.
  const itemHeights = parseNumericArray(inputLines[1]);

  // Parse item values (attributes) from the third line.
  const itemValues = parseNumericArray(inputLines[2]);

  // Validate that parsed array lengths match the expected total count.
  if (itemHeights.length !== totalItemsCount || itemValues.length !== totalItemsCount) {
      console.error("Error: Array lengths for heights or attributes do not match the declared total item count.");
      return;
  }

  // Validate that all parsed values are indeed numbers.
  if (itemHeights.some(isNaN) || itemValues.some(isNaN)) {
      console.error("Error: Non-numeric values detected in height or attribute data.");
      return;
  }

  // Calculate the final score.
  const finalCalculatedScore = determineMaximalScore(totalItemsCount, itemHeights, itemValues);

  // Output the result.
  console.log(finalCalculatedScore);
}

// Entry point: read input from stdin and initiate processing.
processInputAndDisplayResult(require('fs').readFileSync('/dev/stdin', 'utf8'));