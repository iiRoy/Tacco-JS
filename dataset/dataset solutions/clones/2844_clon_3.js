function processData(rawInputText) {
  'use strict';

  // Split the entire input string into individual lines based on newline characters.
  const allInputLines = rawInputText.split('\n');

  // Extract the total count of points from the first line of the input.
  // Using Number() for type conversion instead of parseInt() for slight variation.
  const totalPointsCount = Number(allInputLines.shift());

  // --- Initial Input Validation and Edge Case Handling ---
  // If the number of points is less than 2, it's impossible to form pairs
  // or calculate differences in the intended way. The result would be totalPointsCount itself.
  if (totalPointsCount < 2) {
    console.log(totalPointsCount);
    return; // Exit the function early.
  }

  // This array will store the parsed coordinate pairs, each as [x, y].
  const coordinatePairs = [];

  // Loop through the remaining input lines to parse each point's coordinates.
  for (let pointIndex = 0; pointIndex < totalPointsCount; pointIndex++) {
    const currentLineContent = allInputLines[pointIndex];

    // Ensure the line is not empty or just whitespace before processing.
    if (currentLineContent && currentLineContent.trim() !== '') {
      // Split the line by space and convert each part to a number.
      const coords = currentLineContent.split(' ').map(Number);

      // Basic validation: ensure we have exactly two numbers (x and y) and they are not NaN.
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        coordinatePairs.push(coords);
      }
      // Malformed lines might be skipped here, or an error could be thrown
      // depending on strictness requirements. For this problem, we assume valid input.
    }
  }

  // Sort the collected coordinate pairs primarily by their X-coordinate.
  // This sorting helps optimize subsequent pair comparisons and is a common preprocessing step.
  coordinatePairs.sort((pointA, pointB) => pointA[0] - pointB[0]);

  // This collection will hold all computed difference vectors [deltaX, deltaY].
  const allDifferenceVectors = [];

  // Iterate through all unique pairs of points (P_i, P_j) where i < j.
  // For each pair, calculate the vector from P_j to P_i (P_i - P_j).
  for (let outerIndex = 0; outerIndex < totalPointsCount - 1; outerIndex++) {
    const currentPointX = coordinatePairs[outerIndex][0];
    const currentPointY = coordinatePairs[outerIndex][1];

    for (let innerIndex = outerIndex + 1; innerIndex < totalPointsCount; innerIndex++) {
      const comparedPointX = coordinatePairs[innerIndex][0];
      const comparedPointY = coordinatePairs[innerIndex][1];

      // Calculate the difference in X and Y coordinates.
      const deltaX = currentPointX - comparedPointX;
      const deltaY = currentPointY - comparedPointY;

      allDifferenceVectors.push([deltaX, deltaY]);
    }
  }

  // If no difference vectors were generated (e.g., due to filtering bad input or N<2 already handled),
  // then there are no common differences to count.
  if (allDifferenceVectors.length === 0) {
      console.log(totalPointsCount); // This would only happen if totalPointsCount was 0 or 1, already handled.
      return;
  }

  // Sort the array of difference vectors.
  // This step is critical for grouping identical vectors together, allowing for easy counting of streaks.
  // A custom comparison function ensures correct lexicographical sorting (first X, then Y).
  allDifferenceVectors.sort((vectorA, vectorB) => {
    // If X components are different, sort by X.
    if (vectorA[0] !== vectorB[0]) {
      return vectorA[0] - vectorB[0];
    }
    // If X components are identical, sort by Y.
    return vectorA[1] - vectorB[1];
  });

  // Variables to keep track of the longest streak of identical difference vectors.
  let currentConsecutiveCount = 1; // Tracks the length of the current streak.
  let maximumConsecutiveCount = 0; // Stores the maximum streak length found globally.

  // Helper function to compare two vector arrays for deep equality.
  // This improves readability and encapsulates the comparison logic.
  const areVectorsIdentical = (vec1, vec2) => {
    return vec1[0] === vec2[0] && vec1[1] === vec2[1];
  };

  // Iterate through the sorted difference vectors to find the longest sequence of identical vectors.
  for (let vectorIdx = 0; vectorIdx < allDifferenceVectors.length - 1; vectorIdx++) {
    // Check if the current vector is the same as the next one in the sorted list.
    if (areVectorsIdentical(allDifferenceVectors[vectorIdx], allDifferenceVectors[vectorIdx + 1])) {
      currentConsecutiveCount++; // Increment the current streak length.
    } else {
      // If the vectors are different, the streak is broken.
      // Update the overall maximum if the just-finished streak was longer.
      if (currentConsecutiveCount > maximumConsecutiveCount) {
        maximumConsecutiveCount = currentConsecutiveCount;
      }
      // Reset the current streak counter for the new vector.
      currentConsecutiveCount = 1;
    }
  }

  // After the loop finishes, there might be a final streak that needs to be compared
  // against the maximumConsecutiveCount. This handles cases where the longest streak
  // extends to the very end of the `allDifferenceVectors` array.
  if (currentConsecutiveCount > maximumConsecutiveCount) {
    maximumConsecutiveCount = currentConsecutiveCount;
  }

  // The problem's solution typically involves subtracting the maximum number of
  // points that share the same displacement vector from the total number of points.
  // This effectively calculates the minimum number of points that must be removed
  // to break all instances of the most frequent displacement.
  console.log(totalPointsCount - maximumConsecutiveCount);
}

// --- Standard boilerplate for reading input from stdin and executing the main logic ---
// This section is typically provided and should not be altered as per common problem instructions.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));