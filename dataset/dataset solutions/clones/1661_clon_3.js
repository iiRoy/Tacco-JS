"use strict";

// This script processes a set of two-dimensional points, each associated with a direction.
// It aims to find the minimum "encounter distance" between specific pairs of points
// based on their coordinates and derived diagonal values.
// The final result is either "SAFE" if no such encounter is found, or a calculated value.

// --- Input Processing Utilities ---

// Reads the entire standard input.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
// Splits the input into tokens using spaces or newlines as delimiters.
const parsedTokens = rawInputData.split(/ |\n/);
// Keeps track of the current token index being processed.
let tokenIndex = 0;

/**
 * Reads the next token from the input stream and converts it to an integer.
 * @returns {number} The parsed integer value.
 */
function readNextInt() {
  // Ensure the token is treated as a number.
  return Number.parseInt(parsedTokens[tokenIndex++], 10);
}

/**
 * Reads the next token from the input stream as a string.
 * @returns {string} The raw string token.
 */
function readNextString() {
  return parsedTokens[tokenIndex++];
}

// --- Main Logic Function ---

/**
 * Main function to process point data and calculate the minimum encounter distance.
 * @returns {string | number} "SAFE" if no encounter, or the calculated minimum distance multiplied by a factor.
 */
function coordinateProcessor() {
  // A large number representing an effectively infinite distance.
  const maxPossibleDistance = 1e9 + 7; // Slightly changed value

  // Read the total number of points to be processed.
  const numPoints = readNextInt();

  // Validate the number of points. A non-positive number might indicate an issue.
  if (numPoints <= 0) {
    // For this problem, a non-positive N means no points, so it's "SAFE".
    return "SAFE";
  }

  // Define indices for point components for better readability.
  // Each point will be stored as [x, y, x-y, x+y]
  const X_COORD = 0;
  const Y_COORD = 1;
  const DIFF_COORD = 2; // Represents x - y
  const SUM_COORD = 3;  // Represents x + y

  // Categorizes points based on their direction.
  // Index mapping: 0=U (Up), 1=R (Right), 2=D (Down), 3=L (Left).
  // Initialized as an array of 4 empty arrays.
  const categorizedPoints = Array.from({ length: 4 }, () => []);

  // Maps direction strings to their corresponding array indices.
  const directionMap = { 'U': 0, 'R': 1, 'D': 2, 'L': 3 };

  // Populate the categorizedPoints array.
  for (let pointIdx = 0; pointIdx < numPoints; ++pointIdx) {
    const currentX = readNextInt();
    const currentY = readNextInt();
    const currentDirection = readNextString();

    // Calculate derived coordinates (x-y and x+y) which are useful for diagonal comparisons.
    const diffXY = currentX - currentY;
    const sumXY = currentX + currentY;

    // Retrieve the category index from the direction map.
    const categoryIndex = directionMap[currentDirection];

    // Add the point's data to the appropriate category.
    // Each point stores its original (x,y) and the derived (x-y, x+y).
    categorizedPoints[categoryIndex].push([currentX, currentY, diffXY, sumXY]);
  }

  // Initialize the minimum encounter distance found so far.
  let minEncounterDistance = maxPossibleDistance;

  // Helper function for sorting points by a specific coordinate index.
  const sortByCoordinate = (index) => (p1, p2) => p1[index] - p2[index];

  // Helper function to update the minimum distance.
  const updateMinDistance = (newDistance) => {
    minEncounterDistance = Math.min(minEncounterDistance, newDistance);
  };

  // --- First Pass: Horizontal and Vertical Encounters ---
  // This section looks for encounters where points share an X or Y coordinate.
  // It compares U-points with D-points (same X) and R-points with L-points (same Y).

  // Sort U-points (index 0) by X_COORD.
  categorizedPoints[0].sort(sortByCoordinate(X_COORD));
  // Sort R-points (index 1) by Y_COORD.
  categorizedPoints[1].sort(sortByCoordinate(Y_COORD));
  // Sort D-points (index 2) by X_COORD.
  categorizedPoints[2].sort(sortByCoordinate(X_COORD));
  // Sort L-points (index 3) by Y_COORD.
  categorizedPoints[3].sort(sortByCoordinate(Y_COORD));

  // Loop through two primary categories (U and R).
  for (let primaryCategory = 0; primaryCategory < 2; ++primaryCategory) {
    let comparisonPointer = 0; // Pointer for the secondary category array.
    const secondaryCategory = primaryCategory + 2; // D for U, L for R.

    // Only proceed if the secondary category has points to compare against.
    if (categorizedPoints[secondaryCategory].length === 0) {
      continue;
    }

    // Iterate through points in the primary category.
    for (let currentPointIdx = 0; currentPointIdx < categorizedPoints[primaryCategory].length; ++currentPointIdx) {
      const currentPoint = categorizedPoints[primaryCategory][currentPointIdx];
      const primaryCoordValue = currentPoint[primaryCategory]; // X for U, Y for R.

      // Advance comparisonPointer in the secondary category until its points are >= primaryCoordValue.
      while (comparisonPointer < categorizedPoints[secondaryCategory].length &&
             categorizedPoints[secondaryCategory][comparisonPointer][primaryCategory] < primaryCoordValue) {
        comparisonPointer++;
      }

      // If comparisonPointer reached the end, no more potential matches for current and subsequent points.
      if (comparisonPointer === categorizedPoints[secondaryCategory].length) {
        break;
      }

      const potentialMatchPoint = categorizedPoints[secondaryCategory][comparisonPointer];
      const secondaryCoordValue = potentialMatchPoint[primaryCategory]; // X for D, Y for L.

      // Check for a direct alignment (same X or Y coordinate) and ensure order.
      if (primaryCoordValue === secondaryCoordValue) {
        const primaryOtherCoord = currentPoint[1 - primaryCategory]; // Y for U, X for R.
        const secondaryOtherCoord = potentialMatchPoint[1 - primaryCategory]; // Y for D, X for L.

        // If primary point's "other" coordinate is less than secondary's, an encounter is possible.
        if (primaryOtherCoord < secondaryOtherCoord) {
          updateMinDistance(secondaryOtherCoord - primaryOtherCoord);
        }
      }
    }
  }

  // --- Second Pass: Diagonal Encounters (x+y = constant) ---
  // This section looks for encounters along diagonals where x+y is constant.
  // Compares U-points with R-points, D-points with L-points, etc.

  // Sort all categories by SUM_COORD (x+y).
  categorizedPoints[0].sort(sortByCoordinate(SUM_COORD));
  categorizedPoints[1].sort(sortByCoordinate(SUM_COORD));
  categorizedPoints[2].sort(sortByCoordinate(SUM_COORD));
  categorizedPoints[3].sort(sortByCoordinate(SUM_COORD));

  // Loop through pairs of categories that might interact diagonally.
  // K=0: U (0) vs R (1)
  // K=2: D (2) vs L (3)
  for (let kPairIdx = 0; kPairIdx < 4; kPairIdx += 2) {
    let comparisonPointer = 0; // Pointer for the second array in the pair.
    const firstCategory = kPairIdx;
    const secondCategory = kPairIdx + 1;

    // Only proceed if the second category has points.
    if (categorizedPoints[secondCategory].length === 0) {
      continue;
    }

    for (let currentPointIdx = 0; currentPointIdx < categorizedPoints[firstCategory].length; ++currentPointIdx) {
      const currentPoint = categorizedPoints[firstCategory][currentPointIdx];
      const currentSumValue = currentPoint[SUM_COORD];

      // Advance comparisonPointer until points in the second category have sum_coord >= currentSumValue.
      while (comparisonPointer < categorizedPoints[secondCategory].length &&
             categorizedPoints[secondCategory][comparisonPointer][SUM_COORD] < currentSumValue) {
        comparisonPointer++;
      }

      if (comparisonPointer === categorizedPoints[secondCategory].length) {
        break;
      }

      const potentialMatchPoint = categorizedPoints[secondCategory][comparisonPointer];
      const potentialMatchSumValue = potentialMatchPoint[SUM_COORD];

      // If x+y values are the same, check for an encounter.
      if (currentSumValue === potentialMatchSumValue) {
        // The index for the "other" coordinate depends on kPairIdx.
        // For kPairIdx=0 (U vs R), it's Y_COORD (1).
        // For kPairIdx=2 (D vs L), it's X_COORD (0).
        const relevantCoordIndex = (kPairIdx === 0) ? Y_COORD : X_COORD;

        const currentRelevantCoord = currentPoint[relevantCoordIndex];
        const matchRelevantCoord = potentialMatchPoint[relevantCoordIndex];

        if (currentRelevantCoord < matchRelevantCoord) {
          // Distance is multiplied by 2 for this type of diagonal encounter.
          updateMinDistance((matchRelevantCoord - currentRelevantCoord) * 2);
        }
      }
    }
  }

  // --- Third Pass: Diagonal Encounters (x-y = constant) ---
  // This section looks for encounters along diagonals where x-y is constant.
  // Compares U-points with L-points, R-points with D-points.

  // Sort all categories by DIFF_COORD (x-y).
  categorizedPoints[0].sort(sortByCoordinate(DIFF_COORD));
  categorizedPoints[1].sort(sortByCoordinate(DIFF_COORD));
  categorizedPoints[2].sort(sortByCoordinate(DIFF_COORD));
  categorizedPoints[3].sort(sortByCoordinate(DIFF_COORD));

  // Loop through two primary categories (U and R).
  for (let primaryCategory = 0; primaryCategory < 2; ++primaryCategory) {
    let comparisonPointer = 0; // Pointer for the secondary category array.
    const secondaryCategory = 3 - primaryCategory; // L for U, D for R.

    // Guard clause: skip if the secondary category is empty.
    if (categorizedPoints[secondaryCategory].length === 0) {
      continue;
    }

    for (let currentPointIdx = 0; currentPointIdx < categorizedPoints[primaryCategory].length; ++currentPointIdx) {
      const currentPoint = categorizedPoints[primaryCategory][currentPointIdx];
      const currentDiffValue = currentPoint[DIFF_COORD];

      // Advance comparisonPointer until points in the secondary category have diff_coord >= currentDiffValue.
      while (comparisonPointer < categorizedPoints[secondaryCategory].length &&
             categorizedPoints[secondaryCategory][comparisonPointer][DIFF_COORD] < currentDiffValue) {
        comparisonPointer++;
      }

      if (comparisonPointer === categorizedPoints[secondaryCategory].length) {
        break;
      }

      const potentialMatchPoint = categorizedPoints[secondaryCategory][comparisonPointer];
      const potentialMatchDiffValue = potentialMatchPoint[DIFF_COORD];

      // If x-y values are the same, check for an encounter.
      if (currentDiffValue === potentialMatchDiffValue) {
        const currentXValue = currentPoint[X_COORD];
        const matchXValue = potentialMatchPoint[X_COORD];

        if (currentXValue < matchXValue) {
          // Distance is multiplied by 2 for this type of diagonal encounter.
          updateMinDistance((matchXValue - currentXValue) * 2);
        }
      }
    }
  }

  // Determine the final output based on whether an encounter was found.
  if (minEncounterDistance === maxPossibleDistance) {
    return "SAFE";
  } else {
    // Apply a specific scaling factor to the minimum distance.
    const finalScaledDistance = minEncounterDistance * 5;
    return finalScaledDistance;
  }
}

// Execute the main processing function.
const resultOfProcessing = coordinateProcessor();

// Output the result to the console if it's not undefined.
if (resultOfProcessing !== undefined) {
  console.log(String(resultOfProcessing));
}