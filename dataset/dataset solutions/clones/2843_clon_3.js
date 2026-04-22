function ProcessCoordinates(rawDataString) {
  'use strict';

  // Helper function to parse a string like "X Y" into a numeric array [X, Y]
  const convertToNumericPair = (coordinateString) => {
    const stringParts = coordinateString.split(" ");
    // Basic validation: ensure two parts are present
    if (stringParts.length !== 2) {
      throw new Error(`Input format error: Expected two numeric values, got "${coordinateString}"`);
    }
    // Explicitly parse integers with radix 10
    return [parseInt(stringParts[0], 10), parseInt(stringParts[1], 10)];
  };

  // Helper function to compare two arrays of numbers by converting them to JSON strings.
  // This replicates the specific comparison behavior of the original code.
  const areVectorArraysEquivalent = (vectorA, vectorB) => {
    return JSON.stringify(vectorA) === JSON.stringify(vectorB);
  };

  // Custom comparator for sorting arrays of arrays, ensuring consistency with
  // the JSON.stringify-based comparison used later.
  const arrayStringComparator = (arr1, arr2) => {
    return JSON.stringify(arr1).localeCompare(JSON.stringify(arr2));
  };

  // --- Start of Main Logic ---
  const inputLines = rawDataString.split("\n");

  // Handle empty input or invalid first line
  if (inputLines.length === 0 || inputLines[0].trim() === '') {
    console.log(0);
    return;
  }

  // Parse the total number of data points from the first line
  const numberOfPoints = parseInt(inputLines[0], 10);

  // Guard against invalid or zero point counts
  if (isNaN(numberOfPoints) || numberOfPoints <= 0) {
    console.log(numberOfPoints < 0 ? 0 : numberOfPoints); // If negative, treat as 0 points; otherwise, 0
    return;
  }

  // An array to hold the parsed numeric coordinate pairs
  const pointData = [];
  // Populate pointData, skipping the first line which contains numberOfPoints
  for (let pointIndex = 0; pointIndex < numberOfPoints; pointIndex++) {
    const currentInputLine = inputLines[pointIndex + 1]; // +1 to offset the 'numberOfPoints' line
    if (!currentInputLine) {
        // This scenario indicates insufficient data lines for the declared numberOfPoints
        throw new Error(`Missing coordinate data for point ${pointIndex + 1}. Expected ${numberOfPoints} points.`);
    }
    pointData.push(convertToNumericPair(currentInputLine));
  }

  // Collections for storing displacement vectors and their corresponding inverse vectors
  const forwardDisplacements = [];
  const backwardDisplacements = [];

  // Generate all unique pairwise displacement vectors (P_i - P_j) and their inverses (P_j - P_i)
  // The outer loop runs up to numberOfPoints - 2 (inclusive), inner up to numberOfPoints - 1 (inclusive)
  for (let firstPointIdx = 0; firstPointIdx < numberOfPoints - 1; firstPointIdx++) {
    for (let secondPointIdx = firstPointIdx + 1; secondPointIdx < numberOfPoints; secondPointIdx++) {
      const pointOne = pointData[firstPointIdx];
      const pointTwo = pointData[secondPointIdx];

      // Calculate the vector from point two to point one
      const displacementVec = [pointOne[0] - pointTwo[0], pointOne[1] - pointTwo[1]];
      forwardDisplacements.push(displacementVec);

      // Calculate the inverse vector from point one to point two
      const inverseDisplacementVec = [pointTwo[0] - pointOne[0], pointTwo[1] - pointOne[1]];
      backwardDisplacements.push(inverseDisplacementVec);
    }
  }

  // Sort both lists of displacement vectors using the custom comparator
  // This ensures the sorting order is consistent with the `areVectorArraysEquivalent` helper.
  forwardDisplacements.sort(arrayStringComparator);
  backwardDisplacements.sort(arrayStringComparator);

  // Initialize counters for sequence analysis
  let currentConsecutiveSequenceLength = 1;
  let maximumIdenticalSequenceLength = 0; // This variable will hold the 's' value from the original code

  // The counting loop iterates through the 'forwardDisplacements' array
  // It compares each vector with the subsequent vector in its own array,
  // and also with the subsequent vector in the 'backwardDisplacements' array.
  // The loop runs up to (length - 2) to ensure 'seqIndex + 1' is always valid.
  for (let seqIndex = 0; seqIndex < forwardDisplacements.length - 1; seqIndex++) {
    const currentVectorUnderConsideration = forwardDisplacements[seqIndex];
    const nextVectorInForwardSet = forwardDisplacements[seqIndex + 1];
    const nextVectorInBackwardSet = backwardDisplacements[seqIndex + 1]; // This is a specific comparison from original code

    // Check if the current vector matches the next in either set
    const doesConditionHold = areVectorArraysEquivalent(currentVectorUnderConsideration, nextVectorInForwardSet) ||
                             areVectorArraysEquivalent(currentVectorUnderConsideration, nextVectorInBackwardSet);

    if (doesConditionHold) {
      currentConsecutiveSequenceLength++;
    } else {
      // If the sequence is broken, update the maximum found so far
      if (currentConsecutiveSequenceLength > maximumIdenticalSequenceLength) {
        maximumIdenticalSequenceLength = currentConsecutiveSequenceLength;
      }
      currentConsecutiveSequenceLength = 1; // Reset counter for a new sequence
    }
    // IMPORTANT: The original code's logic *does not* include a final check
    // for `currentConsecutiveSequenceLength` against `maximumIdenticalSequenceLength`
    // after the loop finishes. This behavior, including its potential to miss
    // a maximum if it occurs at the very end of the array without an intervening 'else' block,
    // is preserved here to maintain functional similarity (Type III).
  }

  // Output the final result as per the original problem's formula
  console.log(numberOfPoints - maximumIdenticalSequenceLength);
}

// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
// This part is the standard input/output handling, outside the scope of the clone.
// ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));