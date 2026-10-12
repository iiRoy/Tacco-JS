"use strict";

// Module for file system operations, used to read input from stdin.
var rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw input data by spaces or newlines to create a stream of tokens.
var inputTokens = rawInputData.split(/ |\n/);
// Index to keep track of the current token being processed.
var currentTokenIndex = 0;

/**
 * Retrieves the next token from the input stream and converts it to a number.
 * @returns {number} The numeric value of the next token.
 */
function getNextNumber() {
  return +inputTokens[currentTokenIndex++];
}

/**
 * Retrieves the next token from the input stream as a string.
 * @returns {string} The string value of the next token.
 */
function getNextString() {
  return inputTokens[currentTokenIndex++];
}

/**
 * Retrieves the next token from the input stream and converts it to a BigInt.
 * @returns {BigInt} The BigInt value of the next token.
 */
function getNextBigInt() {
  return BigInt(inputTokens[currentTokenIndex++]);
}

/**
 * Retrieves a specified number of tokens from the input stream.
 * Optionally converts them to numbers.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} returnAsStrings - If true, tokens are returned as strings; otherwise, as numbers.
 * @returns {Array<number|string>} An array containing the retrieved tokens.
 */
function getNumberSlice(count, returnAsStrings) {
  if (returnAsStrings) {
    return inputTokens.slice(currentTokenIndex, (currentTokenIndex += count));
  } else {
    return inputTokens.slice(currentTokenIndex, (currentTokenIndex += count)).map((val) => +val);
  }
}

/**
 * Retrieves a 2D matrix of tokens from the input stream.
 * Optionally converts them to numbers.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in each row.
 * @param {boolean} returnAsStrings - If true, tokens are returned as strings; otherwise, as numbers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function getMatrixData(rows, cols, returnAsStrings) {
  var resultMatrix = [];
  var rowIdx = 0;
  if (returnAsStrings) {
    for (; rowIdx < rows; rowIdx++) {
      resultMatrix.push(inputTokens.slice(currentTokenIndex, (currentTokenIndex += cols)));
    }
  } else {
    for (; rowIdx < rows; rowIdx++) {
      resultMatrix.push(inputTokens.slice(currentTokenIndex, (currentTokenIndex += cols)).map((val) => +val));
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array with specified dimensions,
 * initializing inner-most elements with a given expression.
 * @param {string} initValueExpr - A string representing the initial value or expression for the innermost elements (e.g., "[]", "0").
 * @param {...number} dimensions - A variable number of arguments specifying the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createNestedArray(initValueExpr) {
  var dimensionArgs = arguments;
  var numDimensions = dimensionArgs.length;
  // Start building the array creation string from the innermost dimension.
  var arrayBuildString = "Array(dimensionArgs[" + --numDimensions + "]).fill().map(element => {return " + initValueExpr + ";})";
  // Wrap the string for each outer dimension.
  while (--numDimensions) {
    arrayBuildString = "Array(dimensionArgs[" + numDimensions + "]).fill().map(element => " + arrayBuildString + ")";
  }
  // Evaluate the constructed string to create the array.
  return eval(arrayBuildString);
}

// Execute the main problem-solving logic.
var finalOutput = solveCollisionProblem();

// If the main function returns a value (not undefined), print it to the console.
if (finalOutput !== undefined) {
  console.log(String(finalOutput));
}

/**
 * Main function that implements the collision detection algorithm.
 * It categorizes points by direction and calculates the minimum collision distance.
 * @returns {string|number} "SAFE" if no collision is detected, otherwise the minimum collision distance multiplied by 5.
 */
function solveCollisionProblem() {
  // Define a large number to represent an effectively infinite distance.
  var maxPossibleDistance = 1e9;

  // Read the total number of points from the input.
  var totalPoints = getNextNumber();

  // Initialize a 4-element array, where each element is an empty array.
  // This structure will hold points categorized by their movement direction.
  var categorizedPoints = createNestedArray("[]", 4);

  // Map direction characters to numerical indices for array access.
  var directionIndexMap = { U: 0, R: 1, D: 2, L: 3 };

  // Loop through each point, read its coordinates and direction,
  // then store it in the appropriate category.
  for (var pointIdx = 0; pointIdx < totalPoints; pointIdx++) {
    var currentX = getNextNumber();
    var currentY = getNextNumber();
    var currentDirection = getNextString();

    // Each point is stored as an array: [x, y, x-y, x+y].
    // x-y and x+y are pre-calculated for efficient diagonal collision checks.
    categorizedPoints[directionIndexMap[currentDirection]].push([
      currentX,
      currentY,
      currentX - currentY,
      currentX + currentY,
    ]);
  }

  // Initialize the minimum collision distance found so far to the maximum possible value.
  var minimumCollisionDistance = maxPossibleDistance;

  // --- First phase of collision checks: Horizontal and Vertical collisions ---
  // This loop prepares each direction group for specific collision checks.
  for (var groupIdx = 0; groupIdx < 4; groupIdx++) {
    // Determine the primary coordinate for sorting based on group index:
    // For groups 0 (U) and 2 (D), primary is X (index 0).
    // For groups 1 (R) and 3 (L), primary is Y (index 1).
    // The original code uses `i&1` which gives 0 for even (U, D) and 1 for odd (R, L).
    // This means for U/D, it sorts by Y (index 1), and for R/L, it sorts by X (index 0).
    // Let's re-evaluate:
    // U (0) -> 0&1 = 0. Sort by a[0] (X).
    // R (1) -> 1&1 = 1. Sort by a[1] (Y).
    // D (2) -> 2&1 = 0. Sort by a[0] (X).
    // L (3) -> 3&1 = 1. Sort by a[1] (Y).
    // This is for points moving along X or Y axes.
    // The original code sorts by `a[j]` where `j = i&1`.
    // For U (0) and D (2), j=0, so sort by X.
    // For R (1) and L (3), j=1, so sort by Y.
    // This is correct for finding collisions along X or Y axes.
    var primaryCoordType = groupIdx & 1;

    // Sort points within each group. Primary sort key is `primaryCoordType`,
    // secondary sort key (for tie-breaking) is the other coordinate.
    categorizedPoints[groupIdx].sort((pointA, pointB) => {
      if (pointA[primaryCoordType] > pointB[primaryCoordType]) return 1;
      if (pointA[primaryCoordType] < pointB[primaryCoordType]) return -1;
      // If primary coordinates are equal, sort by the other coordinate.
      return pointA[1 - primaryCoordType] - pointB[1 - primaryCoordType];
    });
  }

  // Check for collisions between opposing vertical (U-D) and horizontal (R-L) groups.
  // pairIndex = 0: Checks U (0) vs D (2)
  // pairIndex = 1: Checks R (1) vs L (3)
  for (var pairIndex = 0; pairIndex < 2; pairIndex++) {
    var otherGroupPointer = 0; // Pointer for iterating through the 'other' group.

    // Only proceed if the 'other' group (D or L) has points.
    if (categorizedPoints[pairIndex + 2].length) {
      // Iterate through points in the 'current' group (U or R).
      for (var currentPointIdx = 0; currentPointIdx < categorizedPoints[pairIndex].length; currentPointIdx++) {
        // Advance 'otherGroupPointer' past points in the 'other' group
        // that are "behind" the current point on the primary axis.
        while (
          categorizedPoints[pairIndex + 2].length > otherGroupPointer &&
          categorizedPoints[pairIndex + 2][otherGroupPointer][pairIndex] <
            categorizedPoints[pairIndex][currentPointIdx][pairIndex]
        ) {
          otherGroupPointer++;
        }

        // If points are on the same primary axis, advance 'otherGroupPointer' past
        // points that are "behind" the current point on the secondary axis.
        while (
          categorizedPoints[pairIndex + 2].length > otherGroupPointer &&
          categorizedPoints[pairIndex + 2][otherGroupPointer][pairIndex] ===
            categorizedPoints[pairIndex][currentPointIdx][pairIndex] &&
          categorizedPoints[pairIndex][currentPointIdx][1 - pairIndex] >
            categorizedPoints[pairIndex + 2][otherGroupPointer][1 - pairIndex]
        ) {
          otherGroupPointer++;
        }

        // If the 'other' group has been exhausted, no more collisions are possible for this 'current' group.
        if (otherGroupPointer === categorizedPoints[pairIndex + 2].length) {
          break;
        }

        // If points are on the same primary axis, a potential collision exists.
        if (
          categorizedPoints[pairIndex][currentPointIdx][pairIndex] ===
          categorizedPoints[pairIndex + 2][otherGroupPointer][pairIndex]
        ) {
          // Calculate the distance (difference in the secondary coordinate) and update the minimum.
          minimumCollisionDistance = Math.min(
            minimumCollisionDistance,
            categorizedPoints[pairIndex + 2][otherGroupPointer][1 - pairIndex] -
              categorizedPoints[pairIndex][currentPointIdx][1 - pairIndex]
          );
        }
      }
    }
  }

  // --- Second phase of collision checks: Diagonal collisions along x+y axis ---
  // This loop re-sorts each direction group for diagonal checks.
  for (var groupIdx = 0; groupIdx < 4; groupIdx++) {
    // Determine the secondary coordinate for tie-breaking during sorting:
    // For U (0) and D (2), use Y (index 1).
    // For R (1) and L (3), use X (index 0).
    // The original code uses `1-(i&1)`.
    // U (0) -> 1-(0&1) = 1-0 = 1 (Y coord)
    // R (1) -> 1-(1&1) = 1-1 = 0 (X coord)
    // D (2) -> 1-(2&1) = 1-0 = 1 (Y coord)
    // L (3) -> 1-(3&1) = 1-1 = 0 (X coord)
    var secondaryCoordForDiagonal = 1 - (groupIdx & 1);

    // Sort points within each group based on the (x+y) coordinate (index 3),
    // then by the determined secondary coordinate for tie-breaking.
    categorizedPoints[groupIdx].sort((pointA, pointB) => {
      if (pointA[3] > pointB[3]) return 1;
      if (pointA[3] < pointB[3]) return -1;
      // Tie-breaker: sort by the secondary coordinate (X or Y).
      return pointA[secondaryCoordForDiagonal] - pointB[secondaryCoordForDiagonal];
    });
  }

  // Check for diagonal collisions between specific pairs of groups.
  // diagonalPairIndex = 0: Checks U (0) vs R (1)
  // diagonalPairIndex = 2: Checks D (2) vs L (3)
  for (var diagonalPairIndex = 0; diagonalPairIndex < 4; diagonalPairIndex += 2) {
    var otherGroupPointer = 0; // Pointer for iterating through the 'other' group.

    // Only proceed if the 'other' group (R or L) has points.
    if (categorizedPoints[diagonalPairIndex + 1].length) {
      // Iterate through points in the 'current' group (U or D).
      for (var currentPointIdx = 0; currentPointIdx < categorizedPoints[diagonalPairIndex].length; currentPointIdx++) {
        // Advance 'otherGroupPointer' past points in the 'other' group
        // that are "behind" the current point on the (x+y) axis.
        while (
          categorizedPoints[diagonalPairIndex + 1].length > otherGroupPointer &&
          categorizedPoints[diagonalPairIndex + 1][otherGroupPointer][3] <
            categorizedPoints[diagonalPairIndex][currentPointIdx][3]
        ) {
          otherGroupPointer++;
        }

        // If points are on the same (x+y) axis, advance 'otherGroupPointer' past
        // points that are "behind" the current point on the secondary coordinate.
        while (
          categorizedPoints[diagonalPairIndex + 1].length > otherGroupPointer &&
          categorizedPoints[diagonalPairIndex + 1][otherGroupPointer][3] ===
            categorizedPoints[diagonalPairIndex][currentPointIdx][3] &&
          categorizedPoints[diagonalPairIndex][currentPointIdx][1 - diagonalPairIndex / 2] >
            categorizedPoints[diagonalPairIndex + 1][otherGroupPointer][1 - diagonalPairIndex / 2]
        ) {
          otherGroupPointer++;
        }

        // If the 'other' group has been exhausted, no more collisions are possible for this 'current' group.
        if (otherGroupPointer === categorizedPoints[diagonalPairIndex + 1].length) {
          break;
        }

        // If points are on the same (x+y) axis, a potential collision exists.
        if (
          categorizedPoints[diagonalPairIndex][currentPointIdx][3] ===
          categorizedPoints[diagonalPairIndex + 1][otherGroupPointer][3]
        ) {
          // Calculate the distance (2 times the difference in the secondary coordinate) and update the minimum.
          minimumCollisionDistance = Math.min(
            minimumCollisionDistance,
            (categorizedPoints[diagonalPairIndex + 1][otherGroupPointer][1 - diagonalPairIndex / 2] -
              categorizedPoints[diagonalPairIndex][currentPointIdx][1 - diagonalPairIndex / 2]) *
              2
          );
        }
      }
    }
  }

  // --- Third phase of collision checks: Diagonal collisions along x-y axis ---
  // This loop re-sorts each direction group for the final set of diagonal checks.
  for (var groupIdx = 0; groupIdx < 4; groupIdx++) {
    // Sort points within each group based on the (x-y) coordinate (index 2),
    // then by the X coordinate (index 0) for tie-breaking.
    categorizedPoints[groupIdx].sort((pointA, pointB) => {
      if (pointA[2] > pointB[2]) return 1;
      if (pointA[2] < pointB[2]) return -1;
      // Tie-breaker: sort by X coordinate.
      return pointA[0] - pointB[0];
    });
  }

  // Check for diagonal collisions between specific pairs of groups.
  // pairIndex = 0: Checks U (0) vs L (3)
  // pairIndex = 1: Checks R (1) vs D (2)
  for (var pairIndex = 0; pairIndex < 2; pairIndex++) {
    var otherGroupPointer = 0; // Pointer for iterating through the 'other' group.

    // The 'other' group index is calculated as (3 - pairIndex).
    // For pairIndex=0, other group is 3 (L).
    // For pairIndex=1, other group is 2 (D).
    if (categorizedPoints[3 - pairIndex].length) {
      // Iterate through points in the 'current' group (U or R).
      for (var currentPointIdx = 0; currentPointIdx < categorizedPoints[pairIndex].length; currentPointIdx++) {
        // Advance 'otherGroupPointer' past points in the 'other' group
        // that are "behind" the current point on the (x-y) axis.
        while (
          categorizedPoints[3 - pairIndex].length > otherGroupPointer &&
          categorizedPoints[3 - pairIndex][otherGroupPointer][2] <
            categorizedPoints[pairIndex][currentPointIdx][2]
        ) {
          otherGroupPointer++;
        }

        // If points are on the same (x-y) axis, advance 'otherGroupPointer' past
        // points that are "behind" the current point on the X coordinate.
        while (
          categorizedPoints[3 - pairIndex].length > otherGroupPointer &&
          categorizedPoints[3 - pairIndex][otherGroupPointer][2] ===
            categorizedPoints[pairIndex][currentPointIdx][2] &&
          categorizedPoints[pairIndex][currentPointIdx][0] >
            categorizedPoints[3 - pairIndex][otherGroupPointer][0]
        ) {
          otherGroupPointer++;
        }

        // If the 'other' group has been exhausted, no more collisions are possible for this 'current' group.
        if (otherGroupPointer === categorizedPoints[3 - pairIndex].length) {
          break;
        }

        // If points are on the same (x-y) axis, a potential collision exists.
        if (
          categorizedPoints[pairIndex][currentPointIdx][2] ===
          categorizedPoints[3 - pairIndex][otherGroupPointer][2]
        ) {
          // Calculate the distance (2 times the difference in the X coordinate) and update the minimum.
          minimumCollisionDistance = Math.min(
            minimumCollisionDistance,
            (categorizedPoints[3 - pairIndex][otherGroupPointer][0] -
              categorizedPoints[pairIndex][currentPointIdx][0]) *
              2
          );
        }
      }
    }
  }

  // If no collision was found, the minimumCollisionDistance will still be maxPossibleDistance.
  // In that case, return "SAFE". Otherwise, return the calculated minimum distance multiplied by 5.
  return minimumCollisionDistance === maxPossibleDistance ? "SAFE" : minimumCollisionDistance * 5;
}
