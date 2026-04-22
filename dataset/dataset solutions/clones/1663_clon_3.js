"use strict";

// Helper for creating multi-dimensional arrays.
// This function recursively builds an array structure.
function createDeepArray(dimensions, initialValueCreator) {
  if (dimensions.length === 0) {
    return initialValueCreator();
  }
  const currentDimSize = dimensions[0];
  const remainingDims = dimensions.slice(1);
  return Array.from({ length: currentDimSize }, () =>
    createDeepArray(remainingDims, initialValueCreator)
  );
}

// Input processing utilities
let rawInputData;
let dataTokens;
let currentTokenIndex = 0;

try {
  // Attempt to read from standard input.
  rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
  // Split the input by any sequence of whitespace characters and filter out empty strings.
  dataTokens = rawInputData.split(/\s+/).filter(Boolean);
} catch (error) {
  // Guard clause: If reading from /dev/stdin fails (e.g., local development),
  // provide sample data to allow the program to run.
  console.error("Error reading input from /dev/stdin:", error.message);
  rawInputData = "5\n10 20 U\n30 40 R\n10 10 D\n50 60 L\n20 20 U"; // Sample input data
  dataTokens = rawInputData.split(/\s+/).filter(Boolean);
  console.warn("Using sample data for execution due to input error.");
}

/**
 * Reads the next token from the input stream and parses it as an integer.
 * Throws an error if the token is not a valid number.
 * @returns {number} The parsed integer value.
 */
function consumeInteger() {
  const token = dataTokens[currentTokenIndex++];
  const parsedValue = parseInt(token, 10);
  if (isNaN(parsedValue)) {
    throw new Error(`Input Error: Expected an integer, but received "${token}".`);
  }
  return parsedValue;
}

/**
 * Reads the next token from the input stream as a string.
 * @returns {string} The raw string token.
 */
function consumeString() {
  return dataTokens[currentTokenIndex++];
}

/**
 * Reads the next token from the input stream and parses it as a BigInt.
 * @returns {BigInt} The parsed BigInt value.
 */
function consumeBigInt() {
  return BigInt(dataTokens[currentTokenIndex++]);
}

/**
 * Reads a specified number of tokens from the input stream.
 * @param {number} count The number of tokens to read.
 * @param {boolean} [returnAsStrings=false] If true, tokens are returned as strings; otherwise, as integers.
 * @returns {Array<number|string>} An array containing the parsed tokens.
 */
function consumeArray(count, returnAsStrings = false) {
  const elements = [];
  for (let idx = 0; idx < count; ++idx) {
    elements.push(returnAsStrings ? consumeString() : consumeInteger());
  }
  return elements;
}

/**
 * Reads a 2D matrix of specified dimensions from the input stream.
 * @param {number} rows The number of rows in the matrix.
 * @param {number} columns The number of columns in each row.
 * @param {boolean} [returnAsStrings=false] If true, matrix elements are strings; otherwise, integers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function consumeMatrix(rows, columns, returnAsStrings = false) {
  const matrix = [];
  for (let r = 0; r < rows; ++r) {
    matrix.push(consumeArray(columns, returnAsStrings));
  }
  return matrix;
}

// Main problem-solving function
function findMinCollisionDistance() {
  // A very large number to represent an initially infinite distance.
  // Using Number.MAX_SAFE_INTEGER ensures it's within JavaScript's integer limits.
  const MAX_POSSIBLE_DIST = Number.MAX_SAFE_INTEGER;

  const totalPointsToProcess = consumeInteger(); // Read the total count of points.

  // This array will hold points categorized by their initial direction.
  // Each sub-array stores point data: [x_coord, y_coord, x_minus_y, x_plus_y].
  // Indices: 0 for 'U', 1 for 'R', 2 for 'D', 3 for 'L'.
  const directionalPointGroups = Array.from({ length: 4 }, () => []);

  // Map direction characters to their corresponding array indices.
  const directionToIndexMap = new Map([
    ["U", 0], // Up
    ["R", 1], // Right
    ["D", 2], // Down
    ["L", 3], // Left
  ]);

  // Process all input points, extract coordinates and direction, then categorize.
  for (let pointIndex = 0; pointIndex < totalPointsToProcess; ++pointIndex) {
    const coordX = consumeInteger();
    const coordY = consumeInteger();
    const directionChar = consumeString();

    // Validate the direction character. Skip if unknown.
    if (!directionToIndexMap.has(directionChar)) {
      console.warn(`Encountered an unknown direction: "${directionChar}". Skipping point at (${coordX}, ${coordY}).`);
      continue;
    }

    const assignedGroupIndex = directionToIndexMap.get(directionChar);
    const xMinusY = coordX - coordY; // Useful for diagonal movement (constant x-y)
    const xPlusY = coordX + coordY;   // Useful for anti-diagonal movement (constant x+y)

    // Store the point's original coordinates and derived diagonal values.
    directionalPointGroups[assignedGroupIndex].push([coordX, coordY, xMinusY, xPlusY]);
  }

  let minimumObservedDistance = MAX_POSSIBLE_DIST;

  // Helper function to sort a given array of points based on two specified indices.
  const sortPointsByDimensions = (pointsList, primaryDimensionIndex, secondaryDimensionIndex) => {
    pointsList.sort((pointA, pointB) => {
      // Primary sort criterion
      if (pointA[primaryDimensionIndex] !== pointB[primaryDimensionIndex]) {
        return pointA[primaryDimensionIndex] - pointB[primaryDimensionIndex];
      }
      // Secondary sort criterion if primary values are equal
      return pointA[secondaryDimensionIndex] - pointB[secondaryDimensionIndex];
    });
  };

  // --- Collision Detection Block 1: Axis-aligned (Horizontal/Vertical) collisions ---
  // This block looks for collisions between 'U' & 'D' points (vertical)
  // and 'R' & 'L' points (horizontal).
  // 'U' (0) vs 'D' (2) -> Same X-coordinate, different Y-coordinates.
  // 'R' (1) vs 'L' (3) -> Same Y-coordinate, different X-coordinates.

  // First, sort each directional group.
  // For 'U'/'D' (groups 0, 2), sort by X (index 0), then Y (index 1).
  // For 'R'/'L' (groups 1, 3), sort by Y (index 1), then X (index 0).
  for (let groupIdx = 0; groupIdx < 4; ++groupIdx) {
    const primaryDim = groupIdx % 2;       // 0 for U/D (X), 1 for R/L (Y)
    const secondaryDim = 1 - primaryDim; // 1 for U/D (Y), 0 for R/L (X)
    sortPointsByDimensions(directionalPointGroups[groupIdx], primaryDim, secondaryDim);
  }

  // Iterate over the two collision pairs: (U,D) and (R,L).
  for (let pairType = 0; pairType < 2; ++pairType) {
    const firstGroupIdx = pairType;       // 0 for U, 1 for R
    const secondGroupIdx = pairType + 2; // 2 for D, 3 for L

    const pointsFromFirstGroup = directionalPointGroups[firstGroupIdx];
    const pointsFromSecondGroup = directionalPointGroups[secondGroupIdx];

    // Optimization: Skip if either group is empty.
    if (pointsFromFirstGroup.length === 0 || pointsFromSecondGroup.length === 0) {
      continue;
    }

    let secondGroupPointer = 0; // Two-pointer for the second group.

    // The coordinate that must match for a potential collision (X for U/D, Y for R/L).
    const sharedAlignmentDimension = pairType % 2;
    // The coordinate along which distance is measured (Y for U/D, X for R/L).
    const collisionDistanceDimension = 1 - sharedAlignmentDimension;

    // Iterate through points in the first group.
    for (let currentPointIdx = 0; currentPointIdx < pointsFromFirstGroup.length; ++currentPointIdx) {
      const currentPointA = pointsFromFirstGroup[currentPointIdx];

      // Advance secondGroupPointer past points in the second group that are "behind" currentPointA
      // along the shared alignment dimension.
      while (
        secondGroupPointer < pointsFromSecondGroup.length &&
        pointsFromSecondGroup[secondGroupPointer][sharedAlignmentDimension] < currentPointA[sharedAlignmentDimension]
      ) {
        secondGroupPointer++;
      }

      // Further advance secondGroupPointer if alignment dimensions match, but currentPointA
      // is at or "behind" the point in the second group along the collision distance dimension.
      // Example: U (Y_A) vs D (Y_B). If Y_A >= Y_B, D is not "below" U, so skip.
      while (
        secondGroupPointer < pointsFromSecondGroup.length &&
        pointsFromSecondGroup[secondGroupPointer][sharedAlignmentDimension] === currentPointA[sharedAlignmentDimension] &&
        currentPointA[collisionDistanceDimension] >= pointsFromSecondGroup[secondGroupPointer][collisionDistanceDimension]
      ) {
        secondGroupPointer++;
      }

      // If the secondGroupPointer has exhausted its list, no further collisions for currentPointA.
      if (secondGroupPointer === pointsFromSecondGroup.length) {
        break;
      }

      // If alignment dimensions match, a collision is possible.
      if (currentPointA[sharedAlignmentDimension] === pointsFromSecondGroup[secondGroupPointer][sharedAlignmentDimension]) {
        const calculatedDistance = Math.abs(
          pointsFromSecondGroup[secondGroupPointer][collisionDistanceDimension] - currentPointA[collisionDistanceDimension]
        );
        minimumObservedDistance = Math.min(minimumObservedDistance, calculatedDistance);
      }
    }
  }

  // --- Collision Detection Block 2: Anti-diagonal collisions (x+y constant) ---
  // This block identifies collisions between 'U' & 'R' points, and 'D' & 'L' points.
  // These pairs collide when their (x+y) sum is constant.
  // 'U' (0) vs 'R' (1)
  // 'D' (2) vs 'L' (3)

  // Sort all directional groups by their (x+y) sum (index 3).
  // Secondary sort: for U/D (groups 0,2) by Y (index 1); for R/L (groups 1,3) by X (index 0).
  for (let groupIdx = 0; groupIdx < 4; ++groupIdx) {
    const primaryDim = 3; // (x+y) sum
    // Original logic: 1 - (i & 1) for secondary sort.
    // i=0 (U) -> 1 (Y), i=1 (R) -> 0 (X), i=2 (D) -> 1 (Y), i=3 (L) -> 0 (X)
    const secondaryDim = 1 - (groupIdx % 2);
    sortPointsByDimensions(directionalPointGroups[groupIdx], primaryDim, secondaryDim);
  }

  // Iterate over the two anti-diagonal collision pairs: (U,R) and (D,L).
  for (let pairOffset = 0; pairOffset < 4; pairOffset += 2) {
    const firstGroupIdx = pairOffset;       // 0 for U, 2 for D
    const secondGroupIdx = pairOffset + 1; // 1 for R, 3 for L

    const pointsFromFirstGroup = directionalPointGroups[firstGroupIdx];
    const pointsFromSecondGroup = directionalPointGroups[secondGroupIdx];

    if (pointsFromFirstGroup.length === 0 || pointsFromSecondGroup.length === 0) {
      continue;
    }

    let secondGroupPointer = 0;
    const sharedSumDimension = 3; // Index for (x+y)

    // Dimension used for relative position check.
    // Original logic: 1 - (k / 2) where k was 0 or 2.
    // k=0 (U,R) -> 1 (Y).  k=2 (D,L) -> 0 (X).
    const relativePositionDimension = 1 - (pairOffset / 2);

    for (let currentPointIdx = 0; currentPointIdx < pointsFromFirstGroup.length; ++currentPointIdx) {
      const currentPointA = pointsFromFirstGroup[currentPointIdx];

      while (
        secondGroupPointer < pointsFromSecondGroup.length &&
        pointsFromSecondGroup[secondGroupPointer][sharedSumDimension] < currentPointA[sharedSumDimension]
      ) {
        secondGroupPointer++;
      }

      while (
        secondGroupPointer < pointsFromSecondGroup.length &&
        pointsFromSecondGroup[secondGroupPointer][sharedSumDimension] === currentPointA[sharedSumDimension] &&
        currentPointA[relativePositionDimension] >= pointsFromSecondGroup[secondGroupPointer][relativePositionDimension]
      ) {
        secondGroupPointer++;
      }

      if (secondGroupPointer === pointsFromSecondGroup.length) {
        break;
      }

      if (currentPointA[sharedSumDimension] === pointsFromSecondGroup[secondGroupPointer][sharedSumDimension]) {
        // For anti-diagonal collisions, the distance is calculated as 2 * absolute difference
        // in the relevant coordinate (Y for U/R, X for D/L).
        const calculatedDistance =
          Math.abs(pointsFromSecondGroup[secondGroupPointer][relativePositionDimension] - currentPointA[relativePositionDimension]) * 2;
        minimumObservedDistance = Math.min(minimumObservedDistance, calculatedDistance);
      }
    }
  }

  // --- Collision Detection Block 3: Diagonal collisions (x-y constant) ---
  // This block identifies collisions between 'U' & 'L' points, and 'D' & 'R' points.
  // These pairs collide when their (x-y) difference is constant.
  // 'U' (0) vs 'L' (3)
  // 'D' (2) vs 'R' (1)

  // Sort all directional groups by their (x-y) difference (index 2), then by X (index 0).
  for (let groupIdx = 0; groupIdx < 4; ++groupIdx) {
    const primaryDim = 2; // (x-y) difference
    const secondaryDim = 0; // X-coordinate
    sortPointsByDimensions(directionalPointGroups[groupIdx], primaryDim, secondaryDim);
  }

  // Iterate over the two diagonal collision pairs: (U,L) and (D,R).
  for (let pairOffset = 0; pairOffset < 2; ++pairOffset) {
    const firstGroupIdx = pairOffset;       // 0 for U, 1 for R (Original: k=0,1 then a[k] vs a[3-k])
    // The original code used `a[k]` and `a[3-k]`.
    // For k=0 (U), it's U (0) vs L (3).
    // For k=1 (R), it's R (1) vs D (2).
    // Let's adjust the indices to match this.
    // If firstGroupIdx is 0 (U), secondGroupIdx is 3 (L).
    // If firstGroupIdx is 2 (D), secondGroupIdx is 1 (R).
    // The original code iterated k=0,1.
    // For k=0: a[0] (U) vs a[3] (L).
    // For k=1: a[1] (R) vs a[2] (D).
    // So the loop should be for (U,L) and (R,D).
    const actualFirstGroupIdx = (pairOffset === 0) ? 0 : 2; // 0 for U, 2 for D
    const actualSecondGroupIdx = (pairOffset === 0) ? 3 : 1; // 3 for L, 1 for R

    const pointsFromFirstGroup = directionalPointGroups[actualFirstGroupIdx];
    const pointsFromSecondGroup = directionalPointGroups[actualSecondGroupIdx];

    if (pointsFromFirstGroup.length === 0 || pointsFromSecondGroup.length === 0) {
      continue;
    }

    let secondGroupPointer = 0;
    const sharedDiffDimension = 2; // Index for (x-y)
    const relativePositionDimension = 0; // X-coordinate for relative position check

    for (let currentPointIdx = 0; currentPointIdx < pointsFromFirstGroup.length; ++currentPointIdx) {
      const currentPointA = pointsFromFirstGroup[currentPointIdx];

      while (
        secondGroupPointer < pointsFromSecondGroup.length &&
        pointsFromSecondGroup[secondGroupPointer][sharedDiffDimension] < currentPointA[sharedDiffDimension]
      ) {
        secondGroupPointer++;
      }

      while (
        secondGroupPointer < pointsFromSecondGroup.length &&
        pointsFromSecondGroup[secondGroupPointer][sharedDiffDimension] === currentPointA[sharedDiffDimension] &&
        currentPointA[relativePositionDimension] >= pointsFromSecondGroup[secondGroupPointer][relativePositionDimension]
      ) {
        secondGroupPointer++;
      }

      if (secondGroupPointer === pointsFromSecondGroup.length) {
        break;
      }

      if (currentPointA[sharedDiffDimension] === pointsFromSecondGroup[secondGroupPointer][sharedDiffDimension]) {
        // For diagonal collisions, the distance is calculated as 2 * absolute difference in X-coordinate.
        const calculatedDistance =
          Math.abs(pointsFromSecondGroup[secondGroupPointer][relativePositionDimension] - currentPointA[relativePositionDimension]) * 2;
        minimumObservedDistance = Math.min(minimumObservedDistance, calculatedDistance);
      }
    }
  }

  // Determine the final output based on whether any collision was found.
  const finalOutput = minimumObservedDistance === MAX_POSSIBLE_DIST ? "SAFE" : minimumObservedDistance * 5;
  return finalOutput;
}

// Entry point for executing the solution and printing the result.
function runSolution() {
  const problemResult = findMinCollisionDistance();
  console.log(String(problemResult));
}

// Execute the main solution logic.
runSolution();